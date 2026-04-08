'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.api';
import { showToast } from '@/utils/toast';
import { getErrorMessage } from '@/utils/error';
import { useMutation } from '@tanstack/react-query';

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm = () => {
    const params = useParams();
    const token = (params?.token as string) || '';
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ResetPasswordFormData>({
        mode: 'onChange',
        resolver: zodResolver(resetPasswordSchema),
    });

    const mutation = useMutation({
        mutationFn: (password: string) => authService.resetPassword(token!, password),
        onSuccess: () => {
            showToast.success('Password has been reset successfully');
            router.push('/login');
        },
        onError: (error) => {
            showToast.error(getErrorMessage(error));
        }
    });

    const onSubmit = (data: ResetPasswordFormData) => {
        if (token) {
            mutation.mutate(data.password);
        } else {
            showToast.error('Invalid token');
        }
    };

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                    Set New Password
                </h2>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <Input
                    label="New Password"
                    type="password"
                    error={errors.password?.message}
                    {...register('password')}
                    required
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                    required
                />

                <Button
                    type="submit"
                    className="w-full"
                    isLoading={mutation.isPending}
                    disabled={!isValid}
                >
                    Reset Password
                </Button>
            </form>
        </div>
    );
};

export default ResetPasswordForm;
