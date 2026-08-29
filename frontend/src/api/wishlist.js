import client from './client';

export const getWishlistApi = () => client.get('/wishlist').then((r) => r.data);
export const addToWishlistApi = (productId) => client.post('/wishlist', { productId }).then((r) => r.data);
export const removeFromWishlistApi = (productId) => client.delete(`/wishlist/${productId}`).then((r) => r.data);
