const { pool } = require('../config/mysql');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('../services/activityService');

const getWishlist = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT w.wishlist_id, w.product_id, w.created_at, p.name, p.price, p.status, p.stock_quantity
     FROM wishlists w JOIN products p ON p.product_id = w.product_id
     WHERE w.user_id = ? ORDER BY w.created_at DESC`,
    [req.user.userId]
  );
  res.json({ success: true, data: rows.map((r) => ({ ...r, price: Number(r.price) })) });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) throw new ApiError(400, 'productId is required');
  const [productRows] = await pool.query('SELECT product_id FROM products WHERE product_id = ?', [productId]);
  if (!productRows[0]) throw new ApiError(404, 'Product not found');

  try {
    await pool.query('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [req.user.userId, productId]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw new ApiError(409, 'Product already in wishlist');
    throw err;
  }
  logActivity({ userId: req.user.userId, activityType: 'wishlist_add', productId: Number(productId) }).catch(() => {});
  res.status(201).json({ success: true, message: 'Added to wishlist' });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [req.user.userId, req.params.productId]);
  if (result.affectedRows === 0) throw new ApiError(404, 'Wishlist entry not found');
  res.json({ success: true, message: 'Removed from wishlist' });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
