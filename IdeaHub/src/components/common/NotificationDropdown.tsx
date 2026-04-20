'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, MessageSquare, Info, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

const formatTime = (dateString: string) => {
    try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
        return 'Recently';
    }
};

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
    switch (type) {
        case 'review':
            return <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full text-indigo-600 dark:text-indigo-400"><CheckCircle2 className="w-4 h-4" /></div>;
        case 'chat':
            return <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-full text-emerald-600 dark:text-emerald-400"><MessageSquare className="w-4 h-4" /></div>;
        default:
            return <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400"><Info className="w-4 h-4" /></div>;
    }
};

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, loading } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleMarkAllRead = async () => {
        await markAsRead();
    };

    const handleNotificationClick = async (id: string) => {
        await markAsRead(id);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Trigger */}
            <button
                onClick={toggleDropdown}
                className={`relative group p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none ${isOpen ? 'bg-gray-100 dark:bg-gray-800 ring-2 ring-indigo-500/20' : ''}`}
            >
                <Bell className={`w-5 h-5 transition-colors duration-200 ${isOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-indigo-600'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center bg-red-600 text-white text-[10px] font-black rounded-full border-2 border-white dark:border-gray-900 shadow-sm animate-in fade-in zoom-in duration-300">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 max-h-[32rem] overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 origin-top-right flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md z-10">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] rounded-full">
                                        {unreadCount} New
                                    </span>
                                )}
                            </h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={handleMarkAllRead}
                                    className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar max-h-[24rem]">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">Loading notifications...</p>
                                </div>
                            ) : notifications.length > 0 ? (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {notifications.map((notification) => (
                                        <div 
                                            key={notification._id}
                                            onClick={() => handleNotificationClick(notification._id)}
                                            className={`p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative cursor-pointer group ${!notification.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                        >
                                            <NotificationIcon type={notification.type} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <p className={`text-sm font-semibold truncate ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap pt-1">
                                                        {formatTime(notification.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                                {notification.link && (
                                                    <Link 
                                                        href={notification.link}
                                                        className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline"
                                                    >
                                                        View details
                                                        <ExternalLink className="w-2.5 h-2.5" />
                                                    </Link>
                                                )}
                                            </div>
                                            {!notification.isRead && (
                                                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-full" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 px-6 text-center">
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bell className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">All caught up!</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">You have no new notifications.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 text-center sticky bottom-0">
                            <button className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                View all activity
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
