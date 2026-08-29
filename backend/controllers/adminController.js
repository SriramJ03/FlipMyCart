const bcrypt = require('bcryptjs');
const { pool } = require('../config/mysql');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sanitizeUser } = require('../utils/sanitize');

const getAllUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const params = [];
  let where = '';
  if (role) {
    where = 'WHERE role = ?';
    params.push(role);
  }
  const [rows] = await pool.query(`SELECT * FROM users ${where} ORDER BY created_at DESC`, params);
  res.json({ success: true, data: rows.map(sanitizeUser) });
});

const getAllSellers = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.*, u.name AS owner_name, u.email AS owner_email, u.is_active AS user_is_active
     FROM sellers s JOIN users u ON u.user_id = s.user_id ORDER BY s.created_at DESC`
  );
  res.json({ success: true, data: rows });
});

const setUserActiveStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const [existing] = await pool.query('SELECT * FROM users WHERE user_id = ?', [req.params.id]);
  if (!existing[0]) throw new ApiError(404, 'User not found');
  await pool.query('UPDATE users SET is_active = ? WHERE user_id = ?', [isActive ? 1 : 0, req.params.id]);
  res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'}` });
});

// Admin-only creation of admin/support accounts (never available through public registration).
const createStaffUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!['admin', 'support'].includes(role)) throw new ApiError(400, "role must be 'admin' or 'support'");

  const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
  if (existing.length) throw new ApiError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, phone || null, role]
  );
  const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [result.insertId]);
  res.status(201).json({ success: true, data: sanitizeUser(rows[0]) });
});

const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name, s.business_name FROM products p
     JOIN categories c ON c.category_id = p.category_id JOIN sellers s ON s.seller_id = p.seller_id
     ORDER BY p.created_at DESC`
  );
  res.json({ success: true, data: rows });
});

const moderateProductStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['draft', 'active', 'inactive'];
  if (!allowed.includes(status)) throw new ApiError(400, `status must be one of: ${allowed.join(', ')}`);
  const [existing] = await pool.query('SELECT * FROM products WHERE product_id = ?', [req.params.id]);
  if (!existing[0]) throw new ApiError(404, 'Product not found');
  await pool.query('UPDATE products SET status = ? WHERE product_id = ?', [status, req.params.id]);
  res.json({ success: true, message: `Product status set to ${status}` });
});

module.exports = { getAllUsers, getAllSellers, setUserActiveStatus, createStaffUser, getAllProductsAdmin, moderateProductStatus };
