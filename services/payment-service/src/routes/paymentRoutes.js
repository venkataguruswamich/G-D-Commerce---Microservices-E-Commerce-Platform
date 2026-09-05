const express = require('express');
const paymentController = require('../controllers/paymentController');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const { createPaymentSchema, listPaymentsQuerySchema } = require('../validation/paymentValidation');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createPaymentSchema), paymentController.createPayment);
router.get('/', requireRole('ADMIN'), validate(listPaymentsQuerySchema, 'query'), paymentController.listPayments);
router.get('/:id', paymentController.getPayment);

module.exports = router;
