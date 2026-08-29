import client from './client';

export const startConversationApi = (payload) => client.post('/chat/conversations', payload).then((r) => r.data);
export const getMyConversationsApi = () => client.get('/chat/conversations').then((r) => r.data);
export const getConversationMessagesApi = (id) => client.get(`/chat/conversations/${id}/messages`).then((r) => r.data);
export const sendMessageApi = (id, message) => client.post(`/chat/conversations/${id}/messages`, { message }).then((r) => r.data);
