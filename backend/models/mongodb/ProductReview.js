const { Schema, model } = require('mongoose');

// productId / userId reference MySQL products.product_id / users.user_id.
const productReviewSchema = new Schema({
  productId: { type: Number, required: true, index: true },
  userId: { type: Number, required: true, index: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, default: '', maxlength: 2000 },
}, { timestamps: true });

// A user may review a given product only once.
productReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = model('ProductReview', productReviewSchema, 'productreviews');
