const db = require('../db/connection');

async function confirmPayment(orderId) {
  return db.transaction(async (trx) => {
    // 1) Traer orden
    const order = await trx('orders').where({ id: orderId }).first();
    if (!order) throw new Error('Order not found');
    if (order.payment_status === 'confirmed') throw new Error('Payment already confirmed');

    // 2) Traer items
    const items = await trx('order_items').where({ order_id: orderId });

    // 3) Confirmar payment + actualizar order
    await trx('payments')
      .where({ order_id: orderId })
      .update({ status: 'confirmed', updated_at: trx.fn.now() });

    await trx('orders')
      .where({ id: orderId })
      .update({ payment_status: 'confirmed', updated_at: trx.fn.now() });

    // 4) Descontar stock + registrar movimiento
    for (const item of items) {
      // a) descontar stock
      await trx('products')
        .where({ id: item.product_id })
        .decrement('stock', item.quantity);

      // b) registrar auditoría de inventario
      await trx('inventory_movements').insert({
        product_id: item.product_id,
        type: 'out',
        quantity: item.quantity,
        reason: `order:${orderId} payment_confirmed`,
      });
    }

    // 5) devolver orden actualizada con items (igual que antes)
    const updatedOrder = await trx('orders').where({ id: orderId }).first();
    updatedOrder.items = items;
    return updatedOrder;
  });
}

module.exports = {
  // ...otras funciones
  confirmPayment,
};