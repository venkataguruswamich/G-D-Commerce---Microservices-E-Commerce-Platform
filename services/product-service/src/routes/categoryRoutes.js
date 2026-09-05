const express = require('express');
const categoryController = require('../controllers/categoryController');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const { createCategorySchema, updateCategorySchema } = require('../validation/categoryValidation');

const router = express.Router();

router.get('/', categoryController.listCategories);
router.post('/', authenticate, requireRole('ADMIN'), validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', authenticate, requireRole('ADMIN'), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', authenticate, requireRole('ADMIN'), categoryController.deleteCategory);

module.exports = router;
