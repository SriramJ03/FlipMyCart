import client from './client';

export const placeOrderApi = (payload) => client.post('/orders', payload).then((r) => r.data);
export const getMyOrdersApi = () => client.get('/orders/mine').then((r) => r.data);
export const getSellerOrdersApi = () => client.get('/orders/seller').then((r) => r.data);
export const getOrderApi = (id) => client.get(`/orders/${id}`).then((r) => r.data);
export const updateOrderStatusApi = (id, status) => client.put(`/orders/${id}/status`, { status }).then((r) => r.data);
