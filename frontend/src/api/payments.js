import client from './client';

export const createPayment = (payload) => client.post('/payments', payload).then((res) => res.data.data);

export const listPayments = (params) => client.get('/payments', { params }).then((res) => res.data.data);

export const getPayment = (id) => client.get(`/payments/${id}`).then((res) => res.data.data);
