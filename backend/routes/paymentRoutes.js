const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/paymentController');

router.get('/mine', authenticate, ctrl.getMyPayments);
router.get('/', authenticate, authorize('admin'), ctrl.getAllPayments);

module.exports = router;
