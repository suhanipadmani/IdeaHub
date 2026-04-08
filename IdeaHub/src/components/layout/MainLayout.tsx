'use client';

import { useState } from 'react';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import { cn } from '@/utils/cn';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-950 overflow-hidden transition-colors duration-200">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className={cn(
                "flex flex-col flex-1 overflow-hidden shrink-0 transition-all duration-300",
                sidebarOpen ? "md:pl-64" : "md:pl-0"
            )}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
