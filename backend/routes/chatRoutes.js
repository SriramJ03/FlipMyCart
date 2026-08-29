const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/chatController');

router.use(authenticate, authorize('buyer', 'seller', 'admin'));

router.post('/conversations', ctrl.startConversation);
router.get('/conversations', ctrl.getMyConversations);
router.get('/conversations/:id/messages', ctrl.getConversationMessages);
router.post('/conversations/:id/messages', ctrl.sendMessage);

module.exports = router;
