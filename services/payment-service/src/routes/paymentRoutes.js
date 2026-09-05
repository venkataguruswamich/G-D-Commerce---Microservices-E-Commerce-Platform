const express = require('express');
const paymentController = require('../controllers/paymentController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { createPaymentSchema } = require('../validation/paymentValidation');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createPaymentSchema), paymentController.createPayment);
router.get('/:id', paymentController.getPayment);

module.exports = router;
