const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/cartController');

router.use(authenticate, authorize('buyer'));

router.get('/', ctrl.getCart);
router.post('/items', ctrl.addToCart);
router.put('/items/:itemId', ctrl.updateCartItem);
router.delete('/items/:itemId', ctrl.removeCartItem);

module.exports = router;
