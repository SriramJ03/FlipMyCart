const UserActivity = require('../models/mongodb/UserActivity');

// Fire-and-forget style logger. Callers should not let a logging failure break the request.
async function logActivity({ userId = null, activityType, productId = null, categoryId = null, searchQuery = null, metadata = {} }) {
  try {
    await UserActivity.create({ userId, activityType, productId, categoryId, searchQuery, metadata });
  } catch (err) {
    console.error('[activityService] failed to log activity:', err.message);
  }
}

module.exports = { logActivity };
