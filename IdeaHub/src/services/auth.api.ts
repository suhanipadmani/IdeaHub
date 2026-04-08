import api from './api-client';
import type { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth';

export const authService = {
    login: async (data: LoginPayload) => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterPayload) => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    forgotPassword: async (email: string) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token: string, password: string) => {
        const response = await api.put(`/auth/reset-password/${token}`, { password });
        return response.data;
    },

    deleteAccount: async () => {
        const response = await api.delete('/auth/delete-account');
        return response.data;
    }
};
