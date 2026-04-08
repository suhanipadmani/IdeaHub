'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '../ui/Loader';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoadingUser } = useAuth();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isLoadingUser && user && isMounted) {
            router.push(user.role === 'admin' ? '/admin' : '/founder');
        }
    }, [user, isLoadingUser, router, isMounted]);

    const content = (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                {children}
            </div>
        </div>
    );

    if (!isMounted) {
        return content;
    }

    if (isLoadingUser) {
        return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors"><Loader size="lg" /></div>;
    }

    if (user) {
        return null; // Let useEffect handle redirect
    }

    return content;
};

export default AuthLayout;
