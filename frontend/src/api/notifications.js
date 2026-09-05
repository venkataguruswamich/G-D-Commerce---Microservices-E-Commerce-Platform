import client from './client';

export const listNotifications = (params) => client.get('/notifications', { params }).then((res) => res.data.data);
