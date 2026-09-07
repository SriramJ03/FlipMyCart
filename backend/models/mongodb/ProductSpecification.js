const { Schema, model } = require('mongoose');

// productId references MySQL products.product_id.
// `attributes` is intentionally schemaless (Mixed) - this is the concrete
// demonstration of why MongoDB fits here: an Electronics product and a
// Clothing product have completely different attribute sets, and forcing
// them into fixed relational columns would require sparse columns or EAV.
const productSpecificationSchema = new Schema({
  productId: { type: Number, required: true, unique: true, index: true },
  categorySlug: { type: String, required: true },
  attributes: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = model('ProductSpecification', productSpecificationSchema, 'productspecifications');
