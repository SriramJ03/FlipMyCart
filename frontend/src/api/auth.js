import client from './client';

export const registerApi = (payload) => client.post('/auth/register', payload).then((r) => r.data);
export const loginApi = (payload) => client.post('/auth/login', payload).then((r) => r.data);
export const getProfileApi = () => client.get('/auth/profile').then((r) => r.data);
export const updateProfileApi = (payload) => client.put('/auth/profile', payload).then((r) => r.data);
export const changePasswordApi = (payload) => client.put('/auth/change-password', payload).then((r) => r.data);
