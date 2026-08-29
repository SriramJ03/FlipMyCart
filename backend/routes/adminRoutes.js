const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

router.use(authenticate, authorize('admin'));

router.get('/users', ctrl.getAllUsers);
router.put('/users/:id/status', ctrl.setUserActiveStatus);
router.post('/users/staff', ctrl.createStaffUser);
router.get('/sellers', ctrl.getAllSellers);
router.get('/products', ctrl.getAllProductsAdmin);
router.put('/products/:id/status', ctrl.moderateProductStatus);

module.exports = router;
