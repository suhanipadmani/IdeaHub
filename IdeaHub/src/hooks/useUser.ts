'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.api';
import type { IUser } from '@/types';
import { showToast } from '@/utils/toast';
import { useRouter } from 'next/navigation';

export const useUser = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const updateProfileMutation = useMutation({
        mutationFn: (data: Partial<IUser>) => userService.updateProfile(data),
        onSuccess: (data) => {
            queryClient.setQueryData(['auth', 'user'], data);
            showToast.success('Profile updated successfully');
            router.push('/profile');
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: (data: any) => userService.changePassword(data),
        onSuccess: () => {
            showToast.success('Password changed successfully');
            router.push('/profile');
        },
    });

    const deleteAccountMutation = useMutation({
        mutationFn: () => userService.deleteAccount(),
        onSuccess: () => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
            }
            queryClient.clear();
            showToast.success('Account deleted successfully');
            router.push('/login');
        },
    });

    return {
        updateProfile: updateProfileMutation.mutate,
        isUpdating: updateProfileMutation.isPending,
        changePassword: changePasswordMutation.mutate,
        isChangingPassword: changePasswordMutation.isPending,
        deleteAccount: deleteAccountMutation.mutate,
        isDeletingAccount: deleteAccountMutation.isPending,
    };
};
