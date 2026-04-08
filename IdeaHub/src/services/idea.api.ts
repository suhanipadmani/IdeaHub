import api from './api-client';
import type { IProjectIdea, IPaginatedResponse, IdeaFilters } from '../types';

export const ideaService = {
    getAllIdeas: async (params?: IdeaFilters) => {
        const response = await api.get<IProjectIdea[] | IPaginatedResponse<IProjectIdea>>('/ideas', { params });
        return response.data;
    },

    getAdminIdeas: async (params?: IdeaFilters) => {
        const response = await api.get<IPaginatedResponse<IProjectIdea>>('/admin/ideas', { params });
        return response.data;
    },

    getIdeaStats: async () => {
        const response = await api.get<{ total: number; pending: number; approved: number; rejected: number }>('/ideas/stats');
        return response.data;
    },

    getIdeaById: async (id: string) => {
        const response = await api.get<IProjectIdea>(`/ideas/${id}`);
        return response.data;
    },

    createIdea: async (data: FormData) => {
        const response = await api.post<IProjectIdea>('/ideas', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateIdea: async (id: string, data: FormData) => {
        const response = await api.put<IProjectIdea>(`/ideas/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    uploadDocument: async (id: string, name: string, file: File) => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('document', file);
        const response = await api.post<IProjectIdea>(`/ideas/${id}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteIdea: async (id: string) => {
        const response = await api.delete(`/ideas/${id}`);
        return response.data;
    },

    analyzeIdea: async (idOrData: string | any) => {
        const payload = typeof idOrData === 'string' 
            ? { ideaId: idOrData } 
            : { ideaData: idOrData };
        const response = await api.post('/ai/analyze-idea', payload);
        return response.data;
    },

    // Admin
    approveIdea: async (id: string, comment: string) => {
        const response = await api.put(`/admin/ideas/${id}/approve`, { comment });
        return response.data;
    },

    rejectIdea: async (id: string, comment: string) => {
        const response = await api.put(`/admin/ideas/${id}/reject`, { comment });
        return response.data;
    },

    analyzeIdeaForAdmin: async (id: string) => {
        const response = await api.post(`/admin/ideas/${id}/analyze`);
        return response.data;
    }
};
