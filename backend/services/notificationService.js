const Notification = require('../models/mongodb/Notification');

async function createNotification({ userId, type, title, message, link = null }) {
  return Notification.create({ userId, type, title, message, link });
}

module.exports = { createNotification };
