const { Schema, model } = require('mongoose');

// productId references MySQL products.product_id (NOT a Mongo ObjectId).
const imageSchema = new Schema({
  url: { type: String, required: true },
  altText: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
}, { _id: false });

const videoSchema = new Schema({
  url: { type: String, required: true },
  title: { type: String, default: '' },
  durationSeconds: { type: Number, default: 0 },
}, { _id: false });

const productMediaSchema = new Schema({
  productId: { type: Number, required: true, unique: true, index: true },
  images: { type: [imageSchema], default: [] },
  videos: { type: [videoSchema], default: [] },
}, { timestamps: true });

module.exports = model('ProductMedia', productMediaSchema, 'productmedia');
