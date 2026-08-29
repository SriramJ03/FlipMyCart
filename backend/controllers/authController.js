const bcrypt = require('bcryptjs');
const { pool } = require('../config/mysql');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../utils/jwt');
const { sanitizeUser } = require('../utils/sanitize');

// Public registration only allows 'buyer' or 'seller' - admin/support are seed/admin-created only.
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, businessName, businessDescription } = req.body;

  if (!['buyer', 'seller'].includes(role)) {
    throw new ApiError(400, "Public registration only supports role 'buyer' or 'seller'");
  }

  const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
  if (existing.length) throw new ApiError(409, 'An account with this email already exists');

  if (role === 'seller' && !businessName) {
    throw new ApiError(400, 'businessName is required to register as a seller');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [userResult] = await conn.query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, phone || null, role]
    );
    const userId = userResult.insertId;

    await conn.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);

    let sellerId = null;
    if (role === 'seller') {
      const [sellerResult] = await conn.query(
        'INSERT INTO sellers (user_id, business_name, business_description, onboarding_status) VALUES (?, ?, ?, \'pending\')',
        [userId, businessName, businessDescription || null]
      );
      sellerId = sellerResult.insertId;
    }

    await conn.commit();

    const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    const token = signToken({ userId, role });
    res.status(201).json({ success: true, data: { user: sanitizeUser(rows[0]), sellerId, token } });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  if (!user || !user.is_active) throw new ApiError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new ApiError(401, 'Invalid email or password');

  let sellerId = null;
  if (user.role === 'seller') {
    const [sellerRows] = await pool.query('SELECT seller_id, onboarding_status FROM sellers WHERE user_id = ?', [user.user_id]);
    if (sellerRows[0]) {
      sellerId = sellerRows[0].seller_id;
    }
  }

  const token = signToken({ userId: user.user_id, role: user.role });
  res.json({ success: true, data: { user: sanitizeUser(user), sellerId, token } });
});

const getProfile = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [req.user.userId]);
  const user = rows[0];
  let seller = null;
  if (user.role === 'seller') {
    const [sellerRows] = await pool.query('SELECT * FROM sellers WHERE user_id = ?', [user.user_id]);
    seller = sellerRows[0] || null;
  }
  res.json({ success: true, data: { user: sanitizeUser(user), seller } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, addressLine1, addressLine2, city, state, postalCode, country } = req.body;
  await pool.query(
    `UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address_line1 = ?, address_line2 = ?,
     city = ?, state = ?, postal_code = ?, country = COALESCE(?, country) WHERE user_id = ?`,
    [name ?? null, phone ?? null, addressLine1 || null, addressLine2 || null, city || null, state || null, postalCode || null, country ?? null, req.user.userId]
  );
  const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [req.user.userId]);
  res.json({ success: true, data: { user: sanitizeUser(rows[0]) } });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [req.user.userId]);
  const user = rows[0];
  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw new ApiError(401, 'Current password is incorrect');
  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [newHash, req.user.userId]);
  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { register, login, getProfile, updateProfile, changePassword };
