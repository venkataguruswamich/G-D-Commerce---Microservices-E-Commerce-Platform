const logger = require('../../src/utils/logger');
const { handleOrderCreated } = require('../../src/events/consumer');

describe('payment.queue consumer', () => {
  test('logs receipt of order.created without throwing', async () => {
    const spy = jest.spyOn(logger, 'info').mockImplementation(() => {});

    await expect(
      handleOrderCreated({ orderId: 'o1', userId: 'u1', totalCents: 1500 })
    ).resolves.toBeUndefined();

    expect(spy).toHaveBeenCalledWith(
      'Observed order.created on payment.queue',
      expect.objectContaining({ orderId: 'o1', userId: 'u1', totalCents: 1500 })
    );

    spy.mockRestore();
  });
});
