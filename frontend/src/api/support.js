import client from './client';

export const createTicketApi = (payload) => client.post('/support/tickets', payload).then((r) => r.data);
export const getMyTicketsApi = () => client.get('/support/tickets/mine').then((r) => r.data);
export const getAllTicketsApi = (params) => client.get('/support/tickets', { params }).then((r) => r.data);
export const assignTicketApi = (id, assignedTo) => client.put(`/support/tickets/${id}/assign`, { assignedTo }).then((r) => r.data);
export const updateTicketStatusApi = (id, payload) => client.put(`/support/tickets/${id}/status`, payload).then((r) => r.data);
