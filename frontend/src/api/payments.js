import client from './client';

export const getMyPaymentsApi = () => client.get('/payments/mine').then((r) => r.data);
export const getAllPaymentsApi = () => client.get('/payments').then((r) => r.data);
