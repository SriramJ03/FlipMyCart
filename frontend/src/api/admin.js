import client from './client';

export const getAllUsersApi = (params) => client.get('/admin/users', { params }).then((r) => r.data);
export const setUserActiveStatusApi = (id, isActive) => client.put(`/admin/users/${id}/status`, { isActive }).then((r) => r.data);
export const createStaffUserApi = (payload) => client.post('/admin/users/staff', payload).then((r) => r.data);
export const getAllSellersApi = () => client.get('/admin/sellers').then((r) => r.data);
export const getAllProductsAdminApi = () => client.get('/admin/products').then((r) => r.data);
export const moderateProductStatusApi = (id, status) => client.put(`/admin/products/${id}/status`, { status }).then((r) => r.data);
