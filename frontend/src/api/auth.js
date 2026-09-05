import client from './client';

export const register = (payload) => client.post('/auth/register', payload).then((res) => res.data.data);

export const login = (payload) => client.post('/auth/login', payload).then((res) => res.data.data);

export const logout = (refreshToken) => client.post('/auth/logout', { refreshToken }).then((res) => res.data.data);

export const getMe = () => client.get('/users/me').then((res) => res.data.data);

export const updateMe = (payload) => client.put('/users/me', payload).then((res) => res.data.data);
