const { pool } = require('../config/mysql');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { transactionRef } = require('../utils/sanitize');
const { createNotification } = require('../services/notificationService');

async function getSellerRowForUser(userId) {
  const [rows] = await pool.query('SELECT * FROM sellers WHERE user_id = ?', [userId]);
  if (!rows[0]) throw new ApiError(404, 'Seller profile not found');
  return rows[0];
}

const getMySellerProfile = asyncHandler(async (req, res) => {
  const seller = await getSellerRowForUser(req.user.userId);
  res.json({ success: true, data: seller });
});

const updateMySellerProfile = asyncHandler(async (req, res) => {
  const { businessName, businessDescription, gstNumber } = req.body;
  const seller = await getSellerRowForUser(req.user.userId);
  await pool.query(
    'UPDATE sellers SET business_name = COALESCE(?, business_name), business_description = ?, gst_number = ? WHERE seller_id = ?',
    [businessName ?? null, businessDescription || null, gstNumber || null, seller.seller_id]
  );
  const [rows] = await pool.query('SELECT * FROM sellers WHERE seller_id = ?', [seller.seller_id]);
  res.json({ success: true, data: rows[0] });
});

// Simulated one-time onboarding payment. NOT a real payment gateway - college project mock flow.
const payOnboardingFee = asyncHandler(async (req, res) => {
  const seller = await getSellerRowForUser(req.user.userId);
  if (seller.onboarding_status === 'paid') {
    throw new ApiError(400, 'Onboarding fee has already been paid');
  }

  const { method = 'mock_card' } = req.body;
  const ref = transactionRef('TXN-ONB');

  // Simulated payment always succeeds in this mock flow (see docs for real-gateway notes).
  await pool.query(
    'INSERT INTO seller_onboarding_payments (seller_id, amount, method, status, transaction_ref) VALUES (?, ?, ?, \'successful\', ?)',
    [seller.seller_id, seller.onboarding_fee, method, ref]
  );
  await pool.query("UPDATE sellers SET onboarding_status = 'paid' WHERE seller_id = ?", [seller.seller_id]);

  createNotification({
    userId: req.user.userId,
    type: 'payment_update',
    title: 'Onboarding payment successful',
    message: 'Your one-time onboarding fee has been received. You can now publish active products.',
    link: '/seller/dashboard',
  }).catch(() => {});

  const [rows] = await pool.query('SELECT * FROM sellers WHERE seller_id = ?', [seller.seller_id]);
  res.json({ success: true, message: 'Onboarding payment successful', data: rows[0] });
});

const getOnboardingPayments = asyncHandler(async (req, res) => {
  const seller = await getSellerRowForUser(req.user.userId);
  const [rows] = await pool.query('SELECT * FROM seller_onboarding_payments WHERE seller_id = ? ORDER BY created_at DESC', [seller.seller_id]);
  res.json({ success: true, data: rows });
});

const getSellerDashboardStats = asyncHandler(async (req, res) => {
  const seller = await getSellerRowForUser(req.user.userId);
  const [[productStats]] = await pool.query(
    `SELECT COUNT(*) AS total_products, SUM(status='active') AS active_products, SUM(status='draft') AS draft_products,
            SUM(stock_quantity = 0) AS out_of_stock
     FROM products WHERE seller_id = ?`,
    [seller.seller_id]
  );
  const [[orderStats]] = await pool.query(
    `SELECT COUNT(DISTINCT oi.order_id) AS order_count, COALESCE(SUM(oi.line_total),0) AS total_revenue, COALESCE(SUM(oi.quantity),0) AS units_sold
     FROM order_items oi JOIN orders o ON o.order_id = oi.order_id
     WHERE oi.seller_id = ? AND o.status != 'cancelled'`,
    [seller.seller_id]
  );
  res.json({
    success: true,
    data: {
      seller,
      products: productStats,
      orders: { ...orderStats, total_revenue: Number(orderStats.total_revenue) },
    },
  });
});

module.exports = {
  getMySellerProfile,
  updateMySellerProfile,
  payOnboardingFee,
  getOnboardingPayments,
  getSellerDashboardStats,
  getSellerRowForUser,
};
