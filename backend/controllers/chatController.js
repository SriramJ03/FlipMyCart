const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Conversation = require('../models/mongodb/Conversation');
const Message = require('../models/mongodb/Message');
const { pool } = require('../config/mysql');
const { createNotification } = require('../services/notificationService');

function assertParticipant(conversation, user) {
  const isBuyer = user.role === 'buyer' && conversation.buyerId === user.userId;
  const isSeller = user.role === 'seller' && conversation.sellerUserId === user.userId;
  const isAdmin = user.role === 'admin';
  if (!isBuyer && !isSeller && !isAdmin) {
    throw new ApiError(403, 'You are not a participant in this conversation');
  }
}

// A buyer starts a conversation about a specific product with the product's seller.
const startConversation = asyncHandler(async (req, res) => {
  if (req.user.role !== 'buyer') throw new ApiError(403, 'Only buyers can start a conversation');
  const { productId, message } = req.body;
  if (!productId || !message) throw new ApiError(400, 'productId and message are required');

  const [productRows] = await pool.query(
    `SELECT p.product_id, p.name, s.seller_id, s.user_id AS seller_user_id
     FROM products p JOIN sellers s ON s.seller_id = p.seller_id WHERE p.product_id = ?`,
    [productId]
  );
  const product = productRows[0];
  if (!product) throw new ApiError(404, 'Product not found');

  let conversation = await Conversation.findOne({ buyerId: req.user.userId, sellerId: product.seller_id, productId: product.product_id });
  if (!conversation) {
    conversation = await Conversation.create({
      buyerId: req.user.userId,
      sellerUserId: product.seller_user_id,
      sellerId: product.seller_id,
      productId: product.product_id,
      productName: product.name,
      lastMessage: message,
      lastMessageAt: new Date(),
    });
  } else {
    conversation.lastMessage = message;
    conversation.lastMessageAt = new Date();
    await conversation.save();
  }

  await Message.create({ conversationId: conversation._id, senderId: req.user.userId, message });

  createNotification({
    userId: product.seller_user_id,
    type: 'seller_message',
    title: 'New buyer message',
    message: `New message about "${product.name}"`,
    link: '/seller/messages',
  }).catch(() => {});

  res.status(201).json({ success: true, data: conversation });
});

const getMyConversations = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'seller' ? { sellerUserId: req.user.userId } : { buyerId: req.user.userId };
  const conversations = await Conversation.find(filter).sort({ lastMessageAt: -1 }).lean();
  res.json({ success: true, data: conversations });
});

const getConversationMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  assertParticipant(conversation, req.user);

  const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 }).lean();
  res.json({ success: true, data: { conversation, messages } });
});

const sendMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  assertParticipant(conversation, req.user);

  const { message } = req.body;
  if (!message) throw new ApiError(400, 'message is required');

  const doc = await Message.create({ conversationId: conversation._id, senderId: req.user.userId, message });
  conversation.lastMessage = message;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  const recipientId = req.user.userId === conversation.buyerId ? conversation.sellerUserId : conversation.buyerId;
  createNotification({
    userId: recipientId,
    type: 'seller_message',
    title: 'New message',
    message: message.length > 80 ? `${message.slice(0, 80)}...` : message,
    link: '/messages',
  }).catch(() => {});

  res.status(201).json({ success: true, data: doc });
});

module.exports = { startConversation, getMyConversations, getConversationMessages, sendMessage };
