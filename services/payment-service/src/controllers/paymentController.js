const { v4: uuidv4 } = require('uuid');
const paymentModel = require('../models/paymentModel');
const orderClient = require('../utils/orderClient');
const { simulateOutcome } = require('../utils/paymentSimulator');
const { publishPaymentEvent } = require('../events/publisher');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

async function createPayment(req, res, next) {
  try {
    const { orderId, method } = req.body;

    const order = await orderClient.getOrder(orderId, req.rawToken);
    if (!order) return next(new AppError('NOT_FOUND', 'Order not found', 404));

    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      return next(new AppError('FORBIDDEN', 'You do not have access to this order', 403));
    }

    if (order.status !== 'PENDING') {
      return next(new AppError('ORDER_NOT_PAYABLE', `Order is in status ${order.status} and cannot be paid`, 409));
    }

    const existing = await paymentModel.findByOrderId(orderId);
    if (existing) {
      return next(new AppError('PAYMENT_EXISTS', 'A payment already exists for this order', 409));
    }

    const payment = await paymentModel.create({
      orderId,
      userId: order.userId,
      amountCents: order.totalCents,
      currency: order.currency,
      method,
      transactionRef: uuidv4(),
      status: 'PENDING',
    });

    const outcome = simulateOutcome(orderId, order.totalCents);
    const finalPayment = await paymentModel.updateStatus(payment.id, outcome);

    const routingKey = outcome === 'SUCCESS' ? 'payment.success' : 'payment.failed';
    await publishPaymentEvent(routingKey, finalPayment);

    logger.info('Payment processed', { requestId: req.requestId, paymentId: payment.id, orderId, outcome });

    return res.status(201).json({ success: true, data: finalPayment, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

async function getPayment(req, res, next) {
  try {
    const payment = await paymentModel.findById(req.params.id);
    if (!payment) return next(new AppError('NOT_FOUND', 'Payment not found', 404));

    if (req.user.role !== 'ADMIN' && payment.userId !== req.user.id) {
      return next(new AppError('FORBIDDEN', 'You do not have access to this payment', 403));
    }

    return res.status(200).json({ success: true, data: payment, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createPayment, getPayment };
