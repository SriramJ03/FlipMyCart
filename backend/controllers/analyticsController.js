const asyncHandler = require('../utils/asyncHandler');
const analyticsService = require('../services/analyticsService');
const { getSellerRowForUser } = require('./sellerController');

const getSalesAnalysis = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await analyticsService.salesAnalysis() });
});

// Admins see every seller's figures; a seller only sees their own row (this endpoint
// would otherwise leak competitors' revenue to any logged-in seller).
const getSellerPerformance = asyncHandler(async (req, res) => {
  const performance = await analyticsService.sellerPerformance();
  if (req.user.role === 'seller') {
    const seller = await getSellerRowForUser(req.user.userId);
    return res.json({ success: true, data: performance.filter((s) => s.seller_id === seller.seller_id) });
  }
  res.json({ success: true, data: performance });
});

const getProductAnalysis = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await analyticsService.productAnalysis() });
});

const getCustomerBehaviour = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await analyticsService.customerBehaviour() });
});

const getInventoryAnalysis = asyncHandler(async (req, res) => {
  const threshold = req.query.lowStockThreshold ? Number(req.query.lowStockThreshold) : 10;
  res.json({ success: true, data: await analyticsService.inventoryAnalysis(threshold) });
});

module.exports = { getSalesAnalysis, getSellerPerformance, getProductAnalysis, getCustomerBehaviour, getInventoryAnalysis };
