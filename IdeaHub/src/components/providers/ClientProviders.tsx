'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from '../../context/SocketContext';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './ThemeProvider';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
        },
    },
});

export const ClientProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <SocketProvider>
                    <Toaster position="top-right" />
                    {children}
                </SocketProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};
