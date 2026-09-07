const { Schema, model } = require('mongoose');

// buyerId, sellerUserId reference MySQL users.user_id.
// sellerId references MySQL sellers.seller_id. productId references MySQL products.product_id.
const conversationSchema = new Schema({
  buyerId: { type: Number, required: true, index: true },
  sellerUserId: { type: Number, required: true, index: true },
  sellerId: { type: Number, required: true, index: true },
  productId: { type: Number, default: null },
  productName: { type: String, default: '' },
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

// One conversation thread per (buyer, seller, product) combination.
conversationSchema.index({ buyerId: 1, sellerId: 1, productId: 1 }, { unique: true });

module.exports = model('Conversation', conversationSchema, 'conversations');
