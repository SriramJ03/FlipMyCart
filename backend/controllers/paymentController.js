const { pool } = require('../config/mysql');
const asyncHandler = require('../utils/asyncHandler');

// Payments in FlipMyCart are records of a SIMULATED payment flow for this college
// project - order payments are created automatically inside orderService.createOrderFromCart
// (no real card/bank details are ever collected or processed).

const getMyPayments = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, o.status AS order_status FROM payments p JOIN orders o ON o.order_id = p.order_id
     WHERE p.user_id = ? ORDER BY p.created_at DESC`,
    [req.user.userId]
  );
  res.json({ success: true, data: rows.map((r) => ({ ...r, amount: Number(r.amount) })) });
});

const getAllPayments = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, u.name AS buyer_name, u.email AS buyer_email FROM payments p JOIN users u ON u.user_id = p.user_id
     ORDER BY p.created_at DESC LIMIT 200`
  );
  res.json({ success: true, data: rows.map((r) => ({ ...r, amount: Number(r.amount) })) });
});

module.exports = { getMyPayments, getAllPayments };
