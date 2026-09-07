const { Schema, model, Types } = require('mongoose');

// Each message is its own document (not embedded in Conversation) so a
// conversation thread never becomes a single unbounded document.
// conversationId references Conversation._id (a Mongo-internal relationship).
// senderId references MySQL users.user_id.
const messageSchema = new Schema({
  conversationId: { type: Types.ObjectId, ref: 'Conversation', required: true, index: true },
  senderId: { type: Number, required: true },
  message: { type: String, required: true, maxlength: 3000 },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = model('Message', messageSchema, 'messages');
