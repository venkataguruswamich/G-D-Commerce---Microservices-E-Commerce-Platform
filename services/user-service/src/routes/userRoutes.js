const express = require('express');
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../validation/userValidation');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authenticate, userController.getMe);
router.put('/me', authenticate, validate(updateProfileSchema), userController.updateMe);
router.get('/', authenticate, requireRole('ADMIN'), userController.listUsers);
router.get('/:id', authenticate, requireRole('ADMIN'), userController.getUserById);

module.exports = router;
