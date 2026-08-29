const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/sellerController');

router.use(authenticate, authorize('seller'));

router.get('/me', ctrl.getMySellerProfile);
router.put('/me', ctrl.updateMySellerProfile);
router.post('/onboarding/pay', ctrl.payOnboardingFee);
router.get('/onboarding/payments', ctrl.getOnboardingPayments);
router.get('/dashboard', ctrl.getSellerDashboardStats);

module.exports = router;
