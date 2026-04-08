'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm = () => {
    const { register: registerUser, isRegistering } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<RegisterFormData>({
        mode: 'onChange',
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = (data: RegisterFormData) => {
        registerUser(data);
    };

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                    Create a new account
                </h2>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="relative">
                    <Input
                        label="Full Name"
                        type="text"
                        autoComplete="name"
                        error={errors.name?.message}
                        className="pl-10"
                        {...register('name')}
                        required
                    />
                    <User className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                </div>

                <div className="relative">
                    <Input
                        label="Email address"
                        type="email"
                        autoComplete="email"
                        error={errors.email?.message}
                        className="pl-10"
                        {...register('email')}
                        required
                    />
                    <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                </div>
                <div className="relative">
                    <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        error={errors.password?.message}
                        className="pl-10"
                        {...register('password')}
                        required
                    />
                    <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                    <button
                        type="button"
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    isLoading={isRegistering}
                    disabled={!isValid}
                >
                    Register
                </Button>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                    Already have an account?
                    <Link href="/login" className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                        Sign in
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default RegisterForm;
