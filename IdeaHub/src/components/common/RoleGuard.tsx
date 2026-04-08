'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types';
import { Loader } from '../ui/Loader';

interface RoleGuardProps {
    children: React.ReactNode;
    role: Role;
}

const RoleGuard = ({ children, role }: RoleGuardProps) => {
    const { user, isLoadingUser } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoadingUser) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== role) {
                router.push(user.role === 'admin' ? '/admin' : '/founder');
            }
        }
    }, [user, isLoadingUser, router, role, mounted]);

    if (!mounted || isLoadingUser) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
                <Loader size="lg" />
            </div>
        );
    }

    if (!user || user.role !== role) {
        return null; // Let useEffect handle redirect
    }

    return <>{children}</>;
};

export default RoleGuard;
