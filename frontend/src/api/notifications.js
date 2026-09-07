import client from './client';

export const getMyNotificationsApi = () => client.get('/notifications').then((r) => r.data);
export const getUnreadCountApi = () => client.get('/notifications/unread-count').then((r) => r.data);
export const markAsReadApi = (id) => client.put(`/notifications/${id}/read`).then((r) => r.data);
export const markAllAsReadApi = () => client.put('/notifications/read-all').then((r) => r.data);
