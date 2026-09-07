const router = require('express').Router();
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/productController');

router.get('/', optionalAuthenticate, ctrl.listProducts);
router.get('/mine', authenticate, authorize('seller'), ctrl.listMyProducts);
router.get('/:id', optionalAuthenticate, ctrl.getProduct);

router.post('/', authenticate, authorize('seller'), ctrl.createProduct);
router.put('/:id', authenticate, authorize('seller'), ctrl.updateProduct);
router.delete('/:id', authenticate, authorize('seller', 'admin'), ctrl.deleteProduct);
router.post('/:id/media', authenticate, authorize('seller'), upload.array('files', 6), ctrl.uploadProductMedia);

module.exports = router;
