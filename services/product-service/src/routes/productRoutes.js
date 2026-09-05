const express = require('express');
const productController = require('../controllers/productController');
const inventoryController = require('../controllers/inventoryController');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  listProductsQuerySchema,
  createProductSchema,
  updateProductSchema,
  updateInventorySchema,
  listInventoryQuerySchema,
} = require('../validation/productValidation');

const router = express.Router();

router.get('/', validate(listProductsQuerySchema, 'query'), productController.listProducts);

// Must be registered before `/:id` — otherwise Express would match a
// request for `/inventory` against the `:id` param route instead.
router.get(
  '/inventory',
  authenticate,
  requireRole('ADMIN'),
  validate(listInventoryQuerySchema, 'query'),
  inventoryController.listInventory
);

router.get('/:id', productController.getProduct);
router.post('/', authenticate, requireRole('ADMIN'), validate(createProductSchema), productController.createProduct);
router.put('/:id', authenticate, requireRole('ADMIN'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', authenticate, requireRole('ADMIN'), productController.deleteProduct);

router.get('/:id/inventory', inventoryController.getInventory);
router.put(
  '/:id/inventory',
  authenticate,
  requireRole('ADMIN'),
  validate(updateInventorySchema),
  inventoryController.updateInventory
);

module.exports = router;
