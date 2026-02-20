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
    const seq = parts[2];
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
  const items = await query('order_items').where({ order_id: id });
  return { ...order, items };
}

async function updateOrder(id, data) {
  await db(TABLE_NAME).where({ id }).update(data);
  return getOrderById(id);
}

async function confirmPayment(orderId) {
  return db.transaction(async (trx) => {
    // update payment status
    await trx(TABLE_NAME).where({ id: orderId }).update({ payment_status: 'confirmed' });
    await trx('payments').where({ order_id: orderId }).update({ status: 'confirmed' });
    // fetch order items to adjust inventory
    const items = await trx('order_items').where({ order_id: orderId });
    for (const item of items) {
      await trx('products')
        .where({ id: item.product_id })
        .decrement('stock', item.quantity);
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