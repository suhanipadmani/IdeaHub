'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.api';
import { showToast } from '@/utils/toast';
import { useMutation } from '@tanstack/react-query';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ForgotPasswordFormData>({
        mode: 'onChange',
        resolver: zodResolver(forgotPasswordSchema),
    });

    const mutation = useMutation({
        mutationFn: (email: string) => authService.forgotPassword(email),
        onSuccess: () => {
            showToast.success('Password reset link sent to your email');
        },
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        mutation.mutate(data.email);
    };

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                    Reset Password
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <Input
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register('email')}
                    required
                />

                <Button
                    type="submit"
                    className="w-full"
                    isLoading={mutation.isPending}
                    disabled={!isValid}
                >
                    Send Reset Link
                </Button>

                <div className="text-center">
                    <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                        Back to Sign In
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default ForgotPasswordForm;
