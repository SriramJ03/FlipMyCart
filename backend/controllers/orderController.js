const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const orderService = require('../services/orderService');
const { getSellerRowForUser } = require('./sellerController');

const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  if (!shippingAddress) throw new ApiError(400, 'shippingAddress is required');
  const order = await orderService.createOrderFromCart(req.user.userId, shippingAddress, paymentMethod);
  res.status(201).json({ success: true, data: order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getBuyerOrders(req.user.userId);
  res.json({ success: true, data: orders });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user.userId, req.user.role);
  res.json({ success: true, data: order });
});

const getSellerOrders = asyncHandler(async (req, res) => {
  const seller = await getSellerRowForUser(req.user.userId);
  const items = await orderService.getSellerOrderItems(seller.seller_id);
  res.json({ success: true, data: items });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) throw new ApiError(400, `status must be one of: ${allowed.join(', ')}`);
  const order = await orderService.updateOrderStatus(req.params.id, status, { userId: req.user.userId, role: req.user.role });
  res.json({ success: true, data: order });
});

module.exports = { placeOrder, getMyOrders, getOrder, getSellerOrders, updateOrderStatus };
