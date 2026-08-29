const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/supportController');

router.post('/tickets', authenticate, ctrl.createTicket);
router.get('/tickets/mine', authenticate, ctrl.getMyTickets);
router.get('/tickets', authenticate, authorize('support', 'admin'), ctrl.getAllTickets);
router.put('/tickets/:id/assign', authenticate, authorize('support', 'admin'), ctrl.assignTicket);
router.put('/tickets/:id/status', authenticate, authorize('support', 'admin'), ctrl.updateTicketStatus);

module.exports = router;
