const { pool } = require('../config/mysql');
const ApiError = require('../utils/ApiError');
const { transactionRef } = require('../utils/sanitize');
const { createNotification } = require('./notificationService');

// Order creation is a MySQL-only, single-database transaction: validate cart -> validate
// stock -> create order -> create order_items (snapshotting price) -> decrement stock -> clear cart.
async function createOrderFromCart(userId, shippingAddress, paymentMethod = 'mock_card') {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [cartRows] = await conn.query('SELECT cart_id FROM carts WHERE user_id = ?', [userId]);
    if (!cartRows[0]) throw new ApiError(400, 'Cart not found');
    const cartId = cartRows[0].cart_id;

    const [items] = await conn.query(
      `SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock_quantity, p.seller_id, p.status
       FROM cart_items ci
       JOIN products p ON p.product_id = ci.product_id
       WHERE ci.cart_id = ?
       FOR UPDATE`,
      [cartId]
    );

    if (items.length === 0) throw new ApiError(400, 'Cart is empty');

    for (const item of items) {
      if (item.status !== 'active') {
        throw new ApiError(400, `Product "${item.name}" is no longer available`);
      }
      if (item.quantity > item.stock_quantity) {
        throw new ApiError(400, `Insufficient stock for "${item.name}" (available: ${item.stock_quantity})`);
      }
    }

    const totalAmount = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES (?, ?, ?, ?)',
      [userId, totalAmount, 'placed', shippingAddress]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      const lineTotal = Number(item.price) * item.quantity;
      // Snapshot product_name and unit_price so historical orders never change if the product does later.
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, seller_id, product_name, unit_price, quantity, line_total, item_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'placed')`,
        [orderId, item.product_id, item.seller_id, item.name, item.price, item.quantity, lineTotal]
      );
      await conn.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?', [item.quantity, item.product_id]);
    }

    const ref = transactionRef('TXN-ORD');
    await conn.query(
      `INSERT INTO payments (order_id, user_id, amount, method, status, transaction_ref) VALUES (?, ?, ?, ?, 'successful', ?)`,
      [orderId, userId, totalAmount, paymentMethod, ref]
    );

    await conn.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await conn.commit();

    createNotification({
      userId,
      type: 'order_update',
      title: 'Order placed',
      message: `Your order #${orderId} has been placed successfully.`,
      link: `/orders/${orderId}`,
    }).catch(() => {});

    return getOrderById(orderId, userId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getOrderById(orderId, requesterId = null, requesterRole = null) {
  const [orders] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
  const order = orders[0];
  if (!order) throw new ApiError(404, 'Order not found');
  if (requesterRole === 'buyer' && requesterId && order.user_id !== requesterId) {
    throw new ApiError(403, 'You cannot view this order');
  }

  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  const [payments] = await pool.query('SELECT * FROM payments WHERE order_id = ?', [orderId]);

  return { ...order, total_amount: Number(order.total_amount), items, payments };
}

async function getBuyerOrders(userId) {
  const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  const orderIds = orders.map((o) => o.order_id);
  if (orderIds.length === 0) return [];
  const [items] = await pool.query(`SELECT * FROM order_items WHERE order_id IN (?)`, [orderIds]);
  return orders.map((o) => ({
    ...o,
    total_amount: Number(o.total_amount),
    items: items.filter((i) => i.order_id === o.order_id),
  }));
}

async function getSellerOrderItems(sellerId) {
  const [items] = await pool.query(
    `SELECT oi.*, o.status AS order_status, o.created_at AS order_created_at, o.user_id AS buyer_id, u.name AS buyer_name
     FROM order_items oi
     JOIN orders o ON o.order_id = oi.order_id
     JOIN users u ON u.user_id = o.user_id
     WHERE oi.seller_id = ?
     ORDER BY oi.created_at DESC`,
    [sellerId]
  );
  return items;
}

async function updateOrderStatus(orderId, status, actor) {
  const [rows] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
  const order = rows[0];
  if (!order) throw new ApiError(404, 'Order not found');

  if (actor.role === 'buyer') {
    if (order.user_id !== actor.userId) throw new ApiError(403, 'You cannot modify this order');
    if (status !== 'cancelled' || !['placed', 'processing'].includes(order.status)) {
      throw new ApiError(400, 'Buyers may only cancel orders that are placed or processing');
    }
  }

  await pool.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, orderId]);
  if (status === 'cancelled') {
    await pool.query("UPDATE order_items SET item_status = 'cancelled' WHERE order_id = ?", [orderId]);
    const [items] = await pool.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
    for (const item of items) {
      await pool.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ?', [item.quantity, item.product_id]);
    }
  } else {
    await pool.query('UPDATE order_items SET item_status = ? WHERE order_id = ?', [status, orderId]);
  }

  createNotification({
    userId: order.user_id,
    type: 'order_update',
    title: 'Order status updated',
    message: `Your order #${orderId} is now "${status}".`,
    link: `/orders/${orderId}`,
  }).catch(() => {});

  return getOrderById(orderId);
}

module.exports = { createOrderFromCart, getOrderById, getBuyerOrders, getSellerOrderItems, updateOrderStatus };
