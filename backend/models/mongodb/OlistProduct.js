const { Schema, model } = require('mongoose');

const olistProductSchema = new Schema({
  productId: { type: String, unique: true, index: true },
  category: { type: String, index: true },
  categoryEnglish: { type: String, index: true },
  attributes: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true, collection: 'olistproducts' });

module.exports = model('OlistProduct', olistProductSchema);
