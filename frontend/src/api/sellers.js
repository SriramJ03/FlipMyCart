import client from './client';

export const getMySellerProfileApi = () => client.get('/sellers/me').then((r) => r.data);
export const updateMySellerProfileApi = (payload) => client.put('/sellers/me', payload).then((r) => r.data);
export const payOnboardingFeeApi = (payload) => client.post('/sellers/onboarding/pay', payload).then((r) => r.data);
export const getOnboardingPaymentsApi = () => client.get('/sellers/onboarding/payments').then((r) => r.data);
export const getSellerDashboardApi = () => client.get('/sellers/dashboard').then((r) => r.data);
