'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '../ui/Loader';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoadingUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoadingUser && !user) {
      router.push(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoadingUser, router, pathname, mounted]);

  if (!mounted || isLoadingUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    return null; // Let useEffect handle redirect
  }

  return <>{children}</>;
};

export default ProtectedRoute;
