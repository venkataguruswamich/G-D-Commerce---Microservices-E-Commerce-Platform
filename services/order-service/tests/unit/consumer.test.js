jest.mock('../../src/models/orderModel');
jest.mock('../../src/events/publisher');
jest.mock('../../src/config/rabbitmq');

const orderModel = require('../../src/models/orderModel');
const { publishOrderEvent } = require('../../src/events/publisher');
const { handlePaymentEvent } = require('../../src/events/consumer');

describe('order event consumer', () => {
  afterEach(() => jest.clearAllMocks());

  test('confirms a PENDING order on payment.success', async () => {
    orderModel.findById.mockResolvedValueOnce({ id: 'o1', status: 'PENDING' });
    orderModel.updateStatus.mockResolvedValueOnce({ id: 'o1', status: 'CONFIRMED' });

    await handlePaymentEvent({ orderId: 'o1', eventType: 'payment.success' });

    expect(orderModel.updateStatus).toHaveBeenCalledWith('o1', 'CONFIRMED');
    expect(publishOrderEvent).toHaveBeenCalledWith('order.confirmed', { id: 'o1', status: 'CONFIRMED' });
  });

  test('cancels a PENDING order on payment.failed', async () => {
    orderModel.findById.mockResolvedValueOnce({ id: 'o2', status: 'PENDING' });
    orderModel.updateStatus.mockResolvedValueOnce({ id: 'o2', status: 'CANCELLED' });

    await handlePaymentEvent({ orderId: 'o2', eventType: 'payment.failed' });

    expect(orderModel.updateStatus).toHaveBeenCalledWith('o2', 'CANCELLED');
  });

  test('ignores events for orders no longer PENDING', async () => {
    orderModel.findById.mockResolvedValueOnce({ id: 'o3', status: 'CONFIRMED' });

    await handlePaymentEvent({ orderId: 'o3', eventType: 'payment.success' });

    expect(orderModel.updateStatus).not.toHaveBeenCalled();
  });

  test('ignores events with no orderId without throwing', async () => {
    await expect(handlePaymentEvent({ eventType: 'payment.success' })).resolves.toBeUndefined();
  });
});
