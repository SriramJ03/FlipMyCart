import client from './client';

export const listProductsApi = (params) => client.get('/products', { params }).then((r) => r.data);
export const listMyProductsApi = (params) => client.get('/products/mine', { params }).then((r) => r.data);
export const getProductApi = (id) => client.get(`/products/${id}`).then((r) => r.data);
export const createProductApi = (payload) => client.post('/products', payload).then((r) => r.data);
export const updateProductApi = (id, payload) => client.put(`/products/${id}`, payload).then((r) => r.data);
export const deleteProductApi = (id) => client.delete(`/products/${id}`).then((r) => r.data);
export const uploadProductMediaApi = (id, formData) =>
  client.post(`/products/${id}/media`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
