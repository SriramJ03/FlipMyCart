const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/orderController');

router.post('/', authenticate, authorize('buyer'), ctrl.placeOrder);
router.get('/mine', authenticate, authorize('buyer'), ctrl.getMyOrders);
router.get('/seller', authenticate, authorize('seller'), ctrl.getSellerOrders);
router.get('/:id', authenticate, ctrl.getOrder);
router.put('/:id/status', authenticate, authorize('buyer', 'seller', 'admin'), ctrl.updateOrderStatus);

module.exports = router;
