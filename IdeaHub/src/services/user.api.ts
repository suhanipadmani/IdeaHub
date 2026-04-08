import api from './api-client';
import type { IUser } from '../types';

export const userService = {
    updateProfile: async (data: Partial<IUser>) => {
        const response = await api.put<IUser>('/auth/profile', data);
        return response.data;
    },

    changePassword: async (data: any) => {
        const response = await api.put('/auth/change-password', data);
        return response.data;
    },

    deleteAccount: async () => {
        const response = await api.delete('/auth/delete-account');
        return response.data;
    },

    // Admin only
    getAllUsers: async (params?: any) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    exportUsers: async (params?: any) => {
        const response = await api.get('/admin/users/export', {
            params,
            responseType: 'blob'
        });
        
        // Only run on client side
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'users_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        }
    },

    deleteUser: async (id: string) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },

    updateUser: async (id: string, data: Partial<IUser>) => {
        const response = await api.put<IUser>(`/admin/users/${id}`, data);
        return response.data;
    }
};
