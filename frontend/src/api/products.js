import client from './client';

export const listProducts = (params) => client.get('/products', { params }).then((res) => res.data.data);

export const getProduct = (id) => client.get(`/products/${id}`).then((res) => res.data.data);

export const createProduct = (payload) => client.post('/products', payload).then((res) => res.data.data);

export const updateProduct = (id, payload) => client.put(`/products/${id}`, payload).then((res) => res.data.data);

export const deleteProduct = (id) => client.delete(`/products/${id}`).then((res) => res.data.data);

export const updateInventory = (id, payload) => client.put(`/products/${id}/inventory`, payload).then((res) => res.data.data);

export const getInventory = (id) => client.get(`/products/${id}/inventory`).then((res) => res.data.data);

export const listInventory = (params) => client.get('/products/inventory', { params }).then((res) => res.data.data);
