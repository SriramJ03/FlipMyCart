const { Schema, model } = require('mongoose');

const olistSellerSchema = new Schema({
  sellerId: { type: String, unique: true, index: true },
  location: {
    zipCodePrefix: Number,
    city: String,
    state: String,
  },
}, { timestamps: true, collection: 'olistsellers' });

module.exports = model('OlistSeller', olistSellerSchema);
