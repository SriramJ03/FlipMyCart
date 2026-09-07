import client from './client';

export const getProductReviewsApi = (productId) => client.get(`/reviews/product/${productId}`).then((r) => r.data);
export const addReviewApi = (payload) => client.post('/reviews', payload).then((r) => r.data);
export const updateReviewApi = (id, payload) => client.put(`/reviews/${id}`, payload).then((r) => r.data);
export const deleteReviewApi = (id) => client.delete(`/reviews/${id}`).then((r) => r.data);
