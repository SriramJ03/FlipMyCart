const { Schema, model } = require('mongoose');

// userId / productId reference MySQL users.user_id / products.product_id.
// High write-volume, append-only clickstream-style data - a textbook MongoDB use case.
const userActivitySchema = new Schema({
  userId: { type: Number, default: null, index: true },
  activityType: {
    type: String,
    required: true,
    enum: ['product_view', 'product_search', 'category_view', 'wishlist_add', 'cart_add'],
    index: true,
  },
  productId: { type: Number, default: null, index: true },
  categoryId: { type: Number, default: null },
  searchQuery: { type: String, default: null },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = model('UserActivity', userActivitySchema, 'useractivities');
