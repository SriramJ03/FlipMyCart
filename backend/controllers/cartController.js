const { pool } = require('../config/mysql');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('../services/activityService');

async function getOrCreateCartId(userId) {
  const [rows] = await pool.query('SELECT cart_id FROM carts WHERE user_id = ?', [userId]);
  if (rows[0]) return rows[0].cart_id;
  const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
  return result.insertId;
}

const getCart = asyncHandler(async (req, res) => {
  const cartId = await getOrCreateCartId(req.user.userId);
  const [items] = await pool.query(
    `SELECT ci.cart_item_id, ci.product_id, ci.quantity, p.name, p.price, p.stock_quantity, p.status
     FROM cart_items ci JOIN products p ON p.product_id = ci.product_id
     WHERE ci.cart_id = ? ORDER BY ci.created_at DESC`,
    [cartId]
  );
  const normalized = items.map((i) => ({ ...i, price: Number(i.price), lineTotal: Number(i.price) * i.quantity }));
  const total = normalized.reduce((s, i) => s + i.lineTotal, 0);
  res.json({ success: true, data: { items: normalized, total } });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId || quantity < 1) throw new ApiError(400, 'productId and a positive quantity are required');

  const [productRows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [productId]);
  const product = productRows[0];
  if (!product || product.status !== 'active') throw new ApiError(404, 'Product not available');
  if (quantity > product.stock_quantity) throw new ApiError(400, 'Requested quantity exceeds available stock');

  const cartId = await getOrCreateCartId(req.user.userId);
  await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [cartId, productId, quantity]
  );

  logActivity({ userId: req.user.userId, activityType: 'cart_add', productId: Number(productId) }).catch(() => {});
  res.status(201).json({ success: true, message: 'Added to cart' });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (quantity === undefined || quantity < 1) throw new ApiError(400, 'A positive quantity is required');

  const cartId = await getOrCreateCartId(req.user.userId);
  const [rows] = await pool.query('SELECT ci.*, p.stock_quantity FROM cart_items ci JOIN products p ON p.product_id = ci.product_id WHERE ci.cart_item_id = ? AND ci.cart_id = ?', [req.params.itemId, cartId]);
  if (!rows[0]) throw new ApiError(404, 'Cart item not found');
  if (quantity > rows[0].stock_quantity) throw new ApiError(400, 'Requested quantity exceeds available stock');

  await pool.query('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?', [quantity, req.params.itemId]);
  res.json({ success: true, message: 'Cart item updated' });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cartId = await getOrCreateCartId(req.user.userId);
  const [result] = await pool.query('DELETE FROM cart_items WHERE cart_item_id = ? AND cart_id = ?', [req.params.itemId, cartId]);
  if (result.affectedRows === 0) throw new ApiError(404, 'Cart item not found');
  res.json({ success: true, message: 'Removed from cart' });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
