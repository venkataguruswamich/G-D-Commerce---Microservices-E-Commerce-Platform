import client from './client';

export const createOrder = (payload) => client.post('/orders', payload).then((res) => res.data.data);

export const listOrders = (params) => client.get('/orders', { params }).then((res) => res.data.data);

export const getOrder = (id) => client.get(`/orders/${id}`).then((res) => res.data.data);

export const updateOrderStatus = (id, status) => client.put(`/orders/${id}/status`, { status }).then((res) => res.data.data);
