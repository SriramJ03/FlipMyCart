const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/wishlistController');

router.use(authenticate, authorize('buyer'));

router.get('/', ctrl.getWishlist);
router.post('/', ctrl.addToWishlist);
router.delete('/:productId', ctrl.removeFromWishlist);

module.exports = router;
