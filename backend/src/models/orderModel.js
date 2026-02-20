const db = require('../db/connection');

const TABLE_NAME = 'orders';

async function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  // Get latest order number for today
  const latest = await db(TABLE_NAME)
    .where('order_number', 'like', `T24-${dateStr}-%`)
    .orderBy('id', 'desc')
    .first();
  let nextSeq = 1;
  if (latest && latest.order_number) {
    const parts = latest.order_number.split('-');
    const seq = parts[parts.length - 1];
    nextSeq = parseInt(seq, 10) + 1;
  }
  const padded = String(nextSeq).padStart(5, '0');
  return `T24-${dateStr}-${padded}`;
}

function generatePurchaseCode(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function createOrder({ userId, items, paymentMethod, shippingAddressId }) {
  return db.transaction(async (trx) => {
    // Generate order number and purchase code
    const order_number = await generateOrderNumber();
    const purchase_code = generatePurchaseCode(8);
    
    // Calculate totals and prepare order items
    let total = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await trx('products').where({ id: item.product_id }).first();
      if (!product) throw new Error(`Product ${item.product_id} not found`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for product ${product.name}`);
      
      const subtotal = product.price * item.quantity;
      total += subtotal;
      
      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price,
        cost: product.cost || 0,
        subtotal: subtotal
      });
    }

    const [orderId] = await trx(TABLE_NAME).insert({
      user_id: userId,
      order_number,
      purchase_code,
      order_status: 'pending',
      payment_status: 'pending',
      payment_method: paymentMethod,
      total_amount: total,
      shipping_address_id: shippingAddressId || null,
    });

    // Insert order items
    for (const oi of orderItems) {
      await trx('order_items').insert({
        order_id: orderId,
        product_id: oi.product_id,
        quantity: oi.quantity,
        price: oi.price,
        cost: oi.cost,
        subtotal: oi.subtotal,
      });
    }

    // Record payment placeholder
    await trx('payments').insert({
      order_id: orderId,
      method: paymentMethod,
      status: 'pending',
      amount: total,
    });

    return getOrderById(orderId, trx);
  });
}

async function getOrderById(id, customTrx) {
  const query = customTrx || db;
  const order = await query(TABLE_NAME).where({ id }).first();
  if (!order) return null;
  const items = await query('order_items')
    .join('products', 'order_items.product_id', 'products.id')
    .where({ 'order_items.order_id': id })
    .select('order_items.*', 'products.name as product_name');
  return { ...order, items };
}

async function updateOrder(id, data) {
  await db(TABLE_NAME).where({ id }).update(data);
  return getOrderById(id);
}

async function confirmPayment(orderId) {
  return db.transaction(async (trx) => {
    const order = await trx(TABLE_NAME).where({ id: orderId }).first();
    if (!order) throw new Error('Order not found');
    if (order.payment_status === 'confirmed') return getOrderById(orderId, trx);

    // update payment status
    await trx(TABLE_NAME).where({ id: orderId }).update({ 
      payment_status: 'confirmed',
      order_status: 'processing',
      updated_at: trx.fn.now()
    });
    
    await trx('payments').where({ order_id: orderId }).update({ 
      status: 'confirmed',
      updated_at: trx.fn.now()
    });

    // fetch order items to adjust inventory
    const items = await trx('order_items').where({ order_id: orderId });
    for (const item of items) {
      await trx('products')
        .where({ id: item.product_id })
        .decrement('stock', item.quantity);
        
      await trx('inventory_movements').insert({
        product_id: item.product_id,
        type: 'out',
        quantity: item.quantity,
        reason: `order:${orderId} payment_confirmed`,
      });
    }
    
    return getOrderById(orderId, trx);
  });
}

module.exports = {
  createOrder,
  getOrderById,
  updateOrder,
  confirmPayment,
};
