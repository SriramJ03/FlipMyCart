const { pool } = require('../config/mysql');
const ProductReview = require('../models/mongodb/ProductReview');
const UserActivity = require('../models/mongodb/UserActivity');

/* ---------------------------- 1. Sales analysis (MySQL) --------------------------- */

async function salesAnalysis() {
  const [[totals]] = await pool.query(
    `SELECT COUNT(*) AS total_orders, COALESCE(SUM(total_amount),0) AS total_revenue
     FROM orders WHERE status != 'cancelled'`
  );

  const [monthlyTrend] = await pool.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS order_count, SUM(total_amount) AS revenue
     FROM orders WHERE status != 'cancelled'
     GROUP BY month ORDER BY month`
  );

  const [bestSellers] = await pool.query(
    `SELECT oi.product_id, oi.product_name, SUM(oi.quantity) AS units_sold, SUM(oi.line_total) AS revenue
     FROM order_items oi
     JOIN orders o ON o.order_id = oi.order_id
     WHERE o.status != 'cancelled'
     GROUP BY oi.product_id, oi.product_name
     ORDER BY units_sold DESC LIMIT 10`
  );

  const [categorySales] = await pool.query(
    `SELECT c.name AS category, SUM(oi.line_total) AS revenue, SUM(oi.quantity) AS units_sold
     FROM order_items oi
     JOIN orders o ON o.order_id = oi.order_id
     JOIN products p ON p.product_id = oi.product_id
     JOIN categories c ON c.category_id = p.category_id
     WHERE o.status != 'cancelled'
     GROUP BY c.name ORDER BY revenue DESC`
  );

  return {
    totalOrders: totals.total_orders,
    totalRevenue: Number(totals.total_revenue),
    monthlyTrend: monthlyTrend.map((r) => ({ month: r.month, orderCount: r.order_count, revenue: Number(r.revenue) })),
    bestSellingProducts: bestSellers.map((r) => ({ ...r, revenue: Number(r.revenue) })),
    categorySales: categorySales.map((r) => ({ ...r, revenue: Number(r.revenue) })),
  };
}

/* ------------------------ 2. Seller performance (MySQL) --------------------------- */

async function sellerPerformance() {
  const [rows] = await pool.query(
    `SELECT s.seller_id, s.business_name, s.onboarding_status,
            COUNT(DISTINCT oi.order_id) AS order_count,
            COALESCE(SUM(oi.quantity),0) AS units_sold,
            COALESCE(SUM(oi.line_total),0) AS total_revenue
     FROM sellers s
     LEFT JOIN order_items oi ON oi.seller_id = s.seller_id
       AND oi.order_id IN (SELECT order_id FROM orders WHERE status != 'cancelled')
     GROUP BY s.seller_id, s.business_name, s.onboarding_status
     ORDER BY total_revenue DESC`
  );
  return rows.map((r) => ({ ...r, total_revenue: Number(r.total_revenue) }));
}

/* --------------------- 3. Product analysis (MySQL + MongoDB) ---------------------- */

async function productAnalysis() {
  const [purchased] = await pool.query(
    `SELECT oi.product_id, oi.product_name, SUM(oi.quantity) AS times_purchased
     FROM order_items oi
     JOIN orders o ON o.order_id = oi.order_id
     WHERE o.status != 'cancelled'
     GROUP BY oi.product_id, oi.product_name
     ORDER BY times_purchased DESC LIMIT 10`
  );

  const mostViewed = await UserActivity.aggregate([
    { $match: { activityType: 'product_view', productId: { $ne: null } } },
    { $group: { _id: '$productId', views: { $sum: 1 } } },
    { $sort: { views: -1 } },
    { $limit: 10 },
  ]);
  const viewedIds = mostViewed.map((v) => v._id);
  let viewedNames = {};
  if (viewedIds.length) {
    const [rows] = await pool.query(`SELECT product_id, name FROM products WHERE product_id IN (?)`, [viewedIds]);
    viewedNames = Object.fromEntries(rows.map((r) => [r.product_id, r.name]));
  }

  const ratingAgg = await ProductReview.aggregate([
    { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
  ]);
  const ratingIds = ratingAgg.map((r) => r._id);
  let ratingNames = {};
  if (ratingIds.length) {
    const [rows] = await pool.query(`SELECT product_id, name FROM products WHERE product_id IN (?)`, [ratingIds]);
    ratingNames = Object.fromEntries(rows.map((r) => [r.product_id, r.name]));
  }
  const ratings = ratingAgg
    .map((r) => ({ productId: r._id, name: ratingNames[r._id] || `Product ${r._id}`, avgRating: Number(r.avgRating.toFixed(2)), reviewCount: r.reviewCount }))
    .sort((a, b) => b.avgRating - a.avgRating);

  return {
    mostPurchased: purchased.map((p) => ({ productId: p.product_id, name: p.product_name, timesPurchased: p.times_purchased })),
    mostViewed: mostViewed.map((v) => ({ productId: v._id, name: viewedNames[v._id] || `Product ${v._id}`, views: v.views })),
    highestRated: ratings.slice(0, 10),
    lowestRated: [...ratings].sort((a, b) => a.avgRating - b.avgRating).slice(0, 10),
  };
}

/* --------------------- 4. Customer behaviour (MongoDB only) ----------------------- */

async function customerBehaviour() {
  const mostSearched = await UserActivity.aggregate([
    { $match: { activityType: 'product_search', searchQuery: { $ne: null } } },
    { $group: { _id: '$searchQuery', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const popularCategoriesAgg = await UserActivity.aggregate([
    { $match: { activityType: 'category_view', categoryId: { $ne: null } } },
    { $group: { _id: '$categoryId', views: { $sum: 1 } } },
    { $sort: { views: -1 } },
  ]);
  const catIds = popularCategoriesAgg.map((c) => c._id);
  let catNames = {};
  if (catIds.length) {
    const [rows] = await pool.query(`SELECT category_id, name FROM categories WHERE category_id IN (?)`, [catIds]);
    catNames = Object.fromEntries(rows.map((r) => [r.category_id, r.name]));
  }

  const activityBreakdown = await UserActivity.aggregate([
    { $group: { _id: '$activityType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return {
    mostSearchedTerms: mostSearched.map((s) => ({ term: s._id, count: s.count })),
    popularCategories: popularCategoriesAgg.map((c) => ({ categoryId: c._id, name: catNames[c._id] || `Category ${c._id}`, views: c.views })),
    activityBreakdown: activityBreakdown.map((a) => ({ activityType: a._id, count: a.count })),
  };
}

/* -------------------------- 5. Inventory analysis (MySQL) ------------------------- */

async function inventoryAnalysis(lowStockThreshold = 10) {
  const [lowStock] = await pool.query(
    `SELECT product_id, name, stock_quantity, seller_id FROM products WHERE stock_quantity > 0 AND stock_quantity <= ? AND status = 'active' ORDER BY stock_quantity ASC`,
    [lowStockThreshold]
  );
  const [outOfStock] = await pool.query(
    `SELECT product_id, name, seller_id FROM products WHERE stock_quantity = 0 AND status = 'active'`
  );
  const [[availability]] = await pool.query(
    `SELECT
       SUM(CASE WHEN status='active' AND stock_quantity > 0 THEN 1 ELSE 0 END) AS available,
       SUM(CASE WHEN status='active' AND stock_quantity = 0 THEN 1 ELSE 0 END) AS out_of_stock,
       SUM(CASE WHEN status='draft' THEN 1 ELSE 0 END) AS draft,
       COUNT(*) AS total
     FROM products`
  );

  return { lowStock, outOfStock, availability };
}

module.exports = { salesAnalysis, sellerPerformance, productAnalysis, customerBehaviour, inventoryAnalysis };
