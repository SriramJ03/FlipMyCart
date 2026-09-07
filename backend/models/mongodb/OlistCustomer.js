const { Schema, model } = require('mongoose');

const addressSchema = new Schema({
  customerId: String,
  zipCodePrefix: Number,
  city: String,
  state: String,
}, { _id: false });

const olistCustomerSchema = new Schema({
  customerUniqueId: { type: String, unique: true, index: true },
  addresses: { type: [addressSchema], default: [] },
}, { timestamps: true, collection: 'olistcustomers' });

module.exports = model('OlistCustomer', olistCustomerSchema);
