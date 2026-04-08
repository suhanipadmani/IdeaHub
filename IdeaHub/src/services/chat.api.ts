import api from './api-client';

export const chatService = {
    getHistory: async (ideaId: string, page: number = 1, limit: number = 20) => {
        const response = await api.get(`/chat/${ideaId}`, {
            params: { page, limit }
        });
        return response.data;
    },
    getUnreadCounts: async () => {
        const response = await api.get('/chat/unread-counts');
        return response.data.unreadCounts;
    },
    markRead: async (ideaId: string) => {
        const response = await api.post(`/chat/${ideaId}/read`);
        return response.data;
    }
};
