import client from './client';

export const listUsers = (params) => client.get('/users', { params }).then((res) => res.data.data);

export const getUser = (id) => client.get(`/users/${id}`).then((res) => res.data.data);
