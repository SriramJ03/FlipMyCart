const { Schema, model } = require('mongoose');

const olistReviewSchema = new Schema({
  reviewId: { type: String, unique: true, index: true },
  orderId: { type: String, index: true },
  reviewScore: { type: Number, index: true },
  title: String,
  message: String,
  creationDate: Date,
  answerTimestamp: Date,
}, { timestamps: true, collection: 'olistreviews' });

module.exports = model('OlistReview', olistReviewSchema);
