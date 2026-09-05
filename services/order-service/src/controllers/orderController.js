const orderModel = require('../models/orderModel');
const productClient = require('../utils/productClient');
const { publishOrderEvent } = require('../events/publisher');
const { ORDER_STATUSES } = require('../validation/orderValidation');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Which statuses an order may move to from its current status.
const ALLOWED_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

async function createOrder(req, res, next) {
  try {
    const { items, shippingAddress } = req.body;

    const resolvedItems = [];
    let totalCents = 0;

    for (const item of items) {
      // eslint-disable-next-line no-await-in-loop
      const product = await productClient.getProduct(item.productId);
      if (!product || !product.isActive) {
        return next(new AppError('PRODUCT_UNAVAILABLE', `Product ${item.productId} is not available`, 422));
      }
      const lineTotal = product.priceCents * item.quantity;
      totalCents += lineTotal;
      resolvedItems.push({
        productId: product.id,
        productName: product.name,
        unitPriceCents: product.priceCents,
        quantity: item.quantity,
      });
    }

    const order = await orderModel.createWithItems({
      userId: req.user.id,
      items: resolvedItems,
      shippingAddress,
      totalCents,
    });

    await publishOrderEvent('order.created', order);
    logger.info('Order created', { requestId: req.requestId, orderId: order.id, userId: req.user.id });

    return res.status(201).json({ success: true, data: order, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

async function getOrders(req, res, next) {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const result = await orderModel.list({
      userId: isAdmin ? null : req.user.id,
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
    });
    return res.status(200).json({ success: true, data: result, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) return next(new AppError('NOT_FOUND', 'Order not found', 404));

    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      return next(new AppError('FORBIDDEN', 'You do not have access to this order', 403));
    }

    return res.status(200).json({ success: true, data: order, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const order = await orderModel.findById(req.params.id);
    if (!order) return next(new AppError('NOT_FOUND', 'Order not found', 404));

    if (!ALLOWED_TRANSITIONS[order.status].includes(status)) {
      return next(
        new AppError(
          'INVALID_TRANSITION',
          `Cannot transition order from ${order.status} to ${status}`,
          409
        )
      );
    }

    const updated = await orderModel.updateStatus(req.params.id, status);
    await publishOrderEvent(`order.${status.toLowerCase()}`, updated);
    logger.info('Order status updated', { requestId: req.requestId, orderId: order.id, status });

    return res.status(200).json({ success: true, data: updated, requestId: req.requestId });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, ALLOWED_TRANSITIONS, ORDER_STATUSES };
