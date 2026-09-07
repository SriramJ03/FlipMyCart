import client from './client';

export const getSalesAnalysisApi = () => client.get('/analytics/sales').then((r) => r.data);
export const getSellerPerformanceApi = () => client.get('/analytics/sellers').then((r) => r.data);
export const getProductAnalysisApi = () => client.get('/analytics/products').then((r) => r.data);
export const getCustomerBehaviourApi = () => client.get('/analytics/customer-behaviour').then((r) => r.data);
export const getInventoryAnalysisApi = () => client.get('/analytics/inventory').then((r) => r.data);
