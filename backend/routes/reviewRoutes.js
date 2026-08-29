const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/reviewController');

router.get('/product/:productId', ctrl.getProductReviews);
router.post('/', authenticate, authorize('buyer'), ctrl.addReview);
router.put('/:id', authenticate, authorize('buyer'), ctrl.updateReview);
router.delete('/:id', authenticate, authorize('buyer', 'admin'), ctrl.deleteReview);

module.exports = router;
