import client from './client';

export const getCartApi = () => client.get('/cart').then((r) => r.data);
export const addToCartApi = (payload) => client.post('/cart/items', payload).then((r) => r.data);
export const updateCartItemApi = (itemId, payload) => client.put(`/cart/items/${itemId}`, payload).then((r) => r.data);
export const removeCartItemApi = (itemId) => client.delete(`/cart/items/${itemId}`).then((r) => r.data);
