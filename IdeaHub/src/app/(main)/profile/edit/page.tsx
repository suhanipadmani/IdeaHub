'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const editProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export default function EditProfilePage() {
    const { user } = useAuth();
    const { updateProfile, isUpdating } = useUser();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<EditProfileFormData>({
        mode: 'onChange',
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
        },
    });

    const onSubmit = (data: EditProfileFormData) => {
        updateProfile(data);
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
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                        <UserCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">Edit Profile</h1>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Configure your public facing profile</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-6">
                        <Input
                            label="Name"
                            error={errors.name?.message}
                            {...register('name')}
                            required
                            placeholder="Enter your name"
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            error={errors.email?.message}
                            {...register('email')}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="pt-4">
                        <Button 
                            type="submit" 
                            isLoading={isUpdating} 
                            disabled={!isValid}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all"
                        >
                            Update Profile
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
