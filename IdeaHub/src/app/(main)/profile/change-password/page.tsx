'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
    const { changePassword, isChangingPassword } = useUser();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ChangePasswordFormData>({
        mode: 'onChange',
        resolver: zodResolver(changePasswordSchema),
    });

    const onSubmit = (data: ChangePasswordFormData) => {
        changePassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword
        });
    };

    return (
        <div className="max-w-2xl mx-auto pb-20 px-4">
             <div className="mb-8 mt-2">
                <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-indigo-600 mb-4 flex items-center gap-2 group" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="font-semibold">Return to Settings</span>
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
                        <ShieldCheck className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">Change Password</h1>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Rotate your encrypted access credentials</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-6">
                        <Input
                            label="Current password"
                            type="password"
                            error={errors.currentPassword?.message}
                            {...register('currentPassword')}
                            required
                            placeholder="••••••••"
                        />

                        <div className="h-[1px] bg-gray-50 dark:bg-gray-800" />

                        <Input
                            label="New password"
                            type="password"
                            error={errors.newPassword?.message}
                            {...register('newPassword')}
                            required
                            placeholder="At least 6 characters"
                        />

                        <Input
                            label="Confirm new password"
                            type="password"
                            error={errors.confirmNewPassword?.message}
                            {...register('confirmNewPassword')}
                            required
                            placeholder="Confirm your new password"
                        />
                    </div>

                    <div className="pt-4">
                        <Button 
                            type="submit" 
                            isLoading={isChangingPassword} 
                            disabled={!isValid}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-red-200 dark:shadow-none transition-all"
                        >
                            Update Password
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
