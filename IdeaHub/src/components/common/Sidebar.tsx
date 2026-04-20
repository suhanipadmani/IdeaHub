'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronsLeft, Home, Users, PlusCircle, Settings, LogOut, FileText, ChevronDown, ChevronRight, Clock, History } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useChatNotifications } from '@/hooks/useChatNotifications';
import { cn } from '@/utils/cn';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const { user, logout } = useAuth();
    const pathname = usePathname() || '';
    const { totalUnread } = useChatNotifications();
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
        'reviews': true
    });

    const toggleMenu = (key: string) => {
        setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLogout = () => {
        if (typeof window !== 'undefined' && window.confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    const founderLinks = [
        { name: 'Dashboard', to: '/founder', icon: Home, end: true },
        { name: 'My Ideas', to: '/founder/ideas', icon: FileText },
        { name: 'Submit Idea', to: '/founder/submit', icon: PlusCircle },
        { name: 'My Profile', to: '/profile', icon: Settings },
    ];

    const adminLinks = [
        { name: 'Dashboard', to: '/admin', icon: Home, end: true },
        {
            name: 'Reviews',
            icon: FileText,
            key: 'reviews',
            children: [
                { name: 'Pending Reviews', to: '/admin/reviews/pending', icon: Clock },
                { name: 'Review History', to: '/admin/reviews/history', icon: History },
            ]
        },
        { name: 'Users', to: '/admin/users', icon: Users },
        { name: 'My Profile', to: '/profile', icon: Settings },
    ];

    const links = user?.role === 'admin' ? adminLinks : founderLinks;

    const renderLink = (link: any) => {
        if (link.children) {
            const isExpanded = expandedMenus[link.key];
            const isActive = link.children.some((child: any) => pathname === child.to);

            return (
                <div key={link.name}>
                    <button
                        onClick={() => toggleMenu(link.key)}
                        className={cn(
                            "w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-colors",
                            isActive ? "text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <link.icon className="w-5 h-5 mr-3" />
                                {link.name}
                            </div>
                            {link.key === 'reviews' && totalUnread > 0 && (
                                <span className="flex items-center justify-center bg-red-600 text-white text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full shadow-sm">
                                    {totalUnread}
                                </span>
                            )}
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {isExpanded && (
                        <div className="mt-1 ml-4 space-y-1 pl-4 border-l border-gray-200 dark:border-gray-800">
                            {link.children.map((child: any) => {
                                const isChildActive = pathname === child.to;
                                return (
                                    <Link
                                        key={child.to}
                                        href={child.to}
                                        onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 768) onClose() }}
                                        className={cn(
                                            "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                                            isChildActive
                                                ? "text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                                        )}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center">
                                                <child.icon className="w-4 h-4 mr-3" />
                                                {child.name}
                                            </div>
                                            {child.name === 'Review History' && totalUnread > 0 && (
                                                <span className="flex items-center justify-center bg-red-600 text-white text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full shadow-sm">
                                                    {totalUnread}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        const isActive = link.end ? pathname === link.to : pathname.startsWith(link.to);

        return (
            <Link
                key={link.to}
                href={link.to}
                onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 768) onClose() }}
                className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
            >
                <link.icon className="w-5 h-5 mr-3" />
                <span className="flex-1">{link.name}</span>
                {link.name === 'My Ideas' && totalUnread > 0 && (
                    <span className="flex items-center justify-center bg-red-600 text-white text-[10px] font-black h-5 min-w-[20px] px-1.5 rounded-full shadow-sm">
                        {totalUnread}
                    </span>
                )}
                {link.name === 'Dashboard'}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-950 border-r dark:border-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between h-16 px-6 border-b dark:border-gray-800 shrink-0">
                    <Link 
                        href="/" 
                        className="text-xl font-bold text-gray-800 dark:text-white"
                        onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 768) onClose() }}
                    >
                        IdeaHub
                    </Link>
                    <button 
                        onClick={onClose}
                        className="p-1 px-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <ChevronsLeft className="w-6 h-6" />
                    </button>
                </div>

                <nav className="px-4 py-6 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                    {links.map((link) => renderLink(link))}
                </nav>

                <div className="p-4 border-t dark:border-gray-800 flex items-center justify-between gap-2">
                    <button
                        onClick={handleLogout}
                        className="flex-1 flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors text-left"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                    <ThemeToggle />
                </div>
            </div>
        </>
    );
};

export default Sidebar;
