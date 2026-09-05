jest.mock('../../src/models/notificationModel');
jest.mock('../../src/providers');

const notificationModel = require('../../src/models/notificationModel');
const { getProvider } = require('../../src/providers');
const { handleEvent } = require('../../src/events/consumer');

describe('notification event consumer', () => {
  afterEach(() => jest.clearAllMocks());

  test('records a SENT notification when the provider delivers successfully', async () => {
    const send = jest.fn().mockResolvedValueOnce();
    getProvider.mockReturnValueOnce({ NAME: 'console', send });

    await handleEvent({ eventType: 'order.created', userId: 'u1', orderId: 'o1' });

    expect(send).toHaveBeenCalled();
    expect(notificationModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', type: 'order.created', status: 'SENT' })
    );
  });

  test('records a FAILED notification when the provider throws, without rethrowing', async () => {
    const send = jest.fn().mockRejectedValueOnce(new Error('smtp down'));
    getProvider.mockReturnValueOnce({ NAME: 'smtp', send });

    await expect(handleEvent({ eventType: 'payment.failed', userId: 'u2' })).resolves.toBeUndefined();

    expect(notificationModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u2', type: 'payment.failed', status: 'FAILED' })
    );
  });

  test('propagates a database failure so the message can be retried', async () => {
    const send = jest.fn().mockResolvedValueOnce();
    getProvider.mockReturnValueOnce({ NAME: 'console', send });
    notificationModel.create.mockRejectedValueOnce(new Error('db down'));

    await expect(handleEvent({ eventType: 'order.created', userId: 'u3' })).rejects.toThrow('db down');
  });
});
