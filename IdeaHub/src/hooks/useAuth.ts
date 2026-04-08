import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.api';
import type { LoginPayload, RegisterPayload } from '../types/auth';
import { useRouter } from 'next/navigation';
import { showToast } from '../utils/toast';
import { useMemo } from 'react';

export const useAuth = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: user, isLoading: isLoadingUser } = useQuery({
        queryKey: ['auth', 'user'],
        queryFn: authService.getMe,
        retry: false,
        staleTime: 5 * 60 * 1000,
        enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
    });

    const loginMutation = useMutation({
        mutationFn: (data: LoginPayload) => authService.login(data),
        onSuccess: (data) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', data.token);
            }
            queryClient.setQueryData(['auth', 'user'], data.user);
            showToast.success('Logged in successfully');
            router.push(data.user.role === 'admin' ? '/admin' : '/founder');
        },
    });

    const registerMutation = useMutation({
        mutationFn: (data: RegisterPayload) => authService.register(data),
        onSuccess: (data) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', data.token);
            }
            queryClient.setQueryData(['auth', 'user'], data.user);
            showToast.success('Registered successfully');
            router.push('/founder');
        },
    });

    const logoutMutation = useMutation({
        mutationFn: authService.logout,
        onSettled: () => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
            }
            queryClient.setQueryData(['auth', 'user'], null);
            router.push('/login');
            showToast.success('Logged out successfully');
        },
    });

    const normalizedUser = useMemo(() => {
        return user ? { ...user, id: user._id || (user as any).id } : null;
    }, [user]);

    return {
        user: normalizedUser,
        isLoadingUser,
        login: loginMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        register: registerMutation.mutate,
        isRegistering: registerMutation.isPending,
        logout: logoutMutation.mutate,
    };
};
