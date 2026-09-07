const { Schema, model } = require('mongoose');

const orderItemSchema = new Schema({
  orderItemId: Number,
  productId: String,
  productCategory: String,
  productCategoryEnglish: String,
  sellerId: String,
  price: Number,
  freightValue: Number,
  shippingLimitDate: Date,
}, { _id: false });

const paymentSchema = new Schema({
  sequential: Number,
  type: String,
  installments: Number,
  value: Number,
}, { _id: false });

const olistOrderSchema = new Schema({
  orderId: { type: String, unique: true, index: true },
  customerId: { type: String, index: true },
  customerUniqueId: { type: String, index: true },
  customer: {
    city: String,
    state: String,
  },
  status: { type: String, index: true },
  purchaseTimestamp: { type: Date, index: true },
  approvedAt: Date,
  deliveredCarrierDate: Date,
  deliveredCustomerDate: Date,
  estimatedDeliveryDate: Date,
  items: { type: [orderItemSchema], default: [] },
  payments: { type: [paymentSchema], default: [] },
}, { timestamps: true, collection: 'olistorders' });

olistOrderSchema.index({ status: 1, purchaseTimestamp: 1 });
olistOrderSchema.index({ customerUniqueId: 1, purchaseTimestamp: 1 });
olistOrderSchema.index({ 'items.productId': 1 });
olistOrderSchema.index({ 'items.sellerId': 1 });

module.exports = model('OlistOrder', olistOrderSchema);
