const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/analyticsController');

// Analytics are available to admin (full picture) and seller (their own performance
// slice is still meaningful even though these queries return platform-wide data;
// the frontend seller analytics page focuses the seller on their own dashboard stats
// from /api/sellers/dashboard, and uses these platform endpoints for category/market context).
router.use(authenticate, authorize('admin', 'seller'));

router.get('/sales', ctrl.getSalesAnalysis);
router.get('/sellers', ctrl.getSellerPerformance);
router.get('/products', ctrl.getProductAnalysis);
router.get('/customer-behaviour', ctrl.getCustomerBehaviour);
router.get('/inventory', ctrl.getInventoryAnalysis);

module.exports = router;
