const { Schema, model } = require('mongoose');

// userId references MySQL users.user_id.
const notificationSchema = new Schema({
  userId: { type: Number, required: true, index: true },
  type: {
    type: String,
    required: true,
    enum: ['order_update', 'seller_message', 'payment_update', 'product_status', 'support_update'],
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: null },
  isRead: { type: Boolean, default: false, index: true },
}, { timestamps: true });

module.exports = model('Notification', notificationSchema, 'notifications');
