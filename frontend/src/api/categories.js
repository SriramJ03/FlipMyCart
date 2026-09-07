import client from './client';

export const listCategoriesApi = () => client.get('/categories').then((r) => r.data);
export const createCategoryApi = (payload) => client.post('/categories', payload).then((r) => r.data);
export const updateCategoryApi = (id, payload) => client.put(`/categories/${id}`, payload).then((r) => r.data);
export const deleteCategoryApi = (id) => client.delete(`/categories/${id}`).then((r) => r.data);
