const express = require('express');
const orderController = require('../controllers/orderController');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const { createOrderSchema, updateStatusSchema, listOrdersQuerySchema } = require('../validation/orderValidation');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createOrderSchema), orderController.createOrder);
router.get('/', validate(listOrdersQuerySchema, 'query'), orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', requireRole('ADMIN'), validate(updateStatusSchema), orderController.updateOrderStatus);

module.exports = router;
