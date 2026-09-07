const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ProductReview = require('../models/mongodb/ProductReview');
const { pool } = require('../config/mysql');

const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await ProductReview.find({ productId: req.params.productId }).sort({ createdAt: -1 }).lean();
  const summary = reviews.length
    ? { count: reviews.length, average: Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2)) }
    : { count: 0, average: 0 };
  res.json({ success: true, data: { reviews, summary } });
});

// A buyer may review a product only once, and (for a credible review system) only if
// they actually purchased it - we check MySQL order_items for that.
const addReview = asyncHandler(async (req, res) => {
  const { productId, rating, reviewText } = req.body;
  if (!productId || !rating) throw new ApiError(400, 'productId and rating are required');
  if (rating < 1 || rating > 5) throw new ApiError(400, 'rating must be between 1 and 5');

  const [purchaseRows] = await pool.query(
    `SELECT oi.order_item_id FROM order_items oi JOIN orders o ON o.order_id = oi.order_id
     WHERE oi.product_id = ? AND o.user_id = ? AND o.status = 'delivered' LIMIT 1`,
    [productId, req.user.userId]
  );
  if (!purchaseRows[0]) throw new ApiError(403, 'You can only review products from delivered orders');

  try {
    const review = await ProductReview.create({
      productId: Number(productId),
      userId: req.user.userId,
      userName: req.user.name,
      rating,
      reviewText: reviewText || '',
    });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, 'You have already reviewed this product');
    throw err;
  }
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await ProductReview.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  if (review.userId !== req.user.userId) throw new ApiError(403, 'You can only edit your own review');

  const { rating, reviewText } = req.body;
  if (rating !== undefined) review.rating = rating;
  if (reviewText !== undefined) review.reviewText = reviewText;
  await review.save();
  res.json({ success: true, data: review });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await ProductReview.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  if (review.userId !== req.user.userId && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own review');
  }
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
});

module.exports = { getProductReviews, addReview, updateReview, deleteReview };
