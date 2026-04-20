import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from './useAuth';
import { chatService } from '@/services/chat.api';
import { showToast } from '@/utils/toast';
import { usePathname } from 'next/navigation';

export const useChatNotifications = () => {
    const { socket } = useSocket();
    const { user } = useAuth();
    const pathname = usePathname() || '';
    const userId = user?.id; 
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [totalUnread, setTotalUnread] = useState(0);

    const fetchCounts = useCallback(async () => {
        if (!userId) return;
        try {
            const data = await chatService.getUnreadCounts();
            setUnreadCounts(data.unreadCounts || {});
            setTotalUnread(data.total || 0);
        } catch (error) {
            console.error('Failed to fetch unread counts:', error);
        }
    }, [userId]);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    useEffect(() => {
        // Request browser notification permission
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }, []);

    useEffect(() => {
        if (!socket || !userId) return;

        const handleNewMessage = (msg: any) => {
            if (msg.senderId === userId) return;

            // Update counts
            setUnreadCounts(prev => {
                const newCounts = {
                    ...prev,
                    [msg.ideaId]: (prev[msg.ideaId] || 0) + 1
                };
                const total = Object.values(newCounts).reduce((acc: number, val: any) => acc + (val || 0), 0);
                setTotalUnread(total);
                return newCounts;
            });

            // Trigger Notifications
            const isInThisChat = pathname.includes(`/chat/${msg.ideaId}`);
            const isWindowHidden = document.hidden;

            if (!isInThisChat || isWindowHidden) {

                setUnreadCounts(prev => {
                    const newCounts = {
                        ...prev,
                        [msg.ideaId]: (prev[msg.ideaId] || 0) + 1
                    };
                    return newCounts;
                });

                // In-app Toast
                showToast.success(`Message from ${msg.senderRole === 'admin' ? 'Admin' : 'Founder'}: ${msg.message || 'Sent an attachment'}`);

                // Browser Notification
                if (isWindowHidden && 'Notification' in window && Notification.permission === 'granted') {
                    new Notification('IdeaHub - New Message', {
                        body: `${msg.senderRole === 'admin' ? 'Admin' : 'Founder'}: ${msg.message || 'Sent an attachment'}`,
                        icon: '/favicon.ico'
                    });
                }
            }
        };

        const handleMessageRead = ({ ideaId, userId: readUserId }: { ideaId: string, userId: string }) => {
            if (readUserId === userId) {
                setUnreadCounts(prev => {
                    const newCounts = { ...prev, [ideaId]: 0 };
                    const total = Object.values(newCounts).reduce((acc: number, val: any) => acc + (val || 0), 0);
                    setTotalUnread(total);
                    return newCounts;
                });
            }
        };

        socket.on('receive_message', handleNewMessage);
        socket.on('chat_read', handleMessageRead);

        return () => {
            socket.off('receive_message', handleNewMessage);
            socket.off('chat_read', handleMessageRead);
        };
    }, [socket, userId, pathname]);

    const markAsRead = useCallback(async (ideaId: string) => {
        if (!userId) return;
        
        setUnreadCounts(prev => {
            const newCounts = { ...prev, [ideaId]: 0 };
            setTotalUnread(Object.values(newCounts).reduce((a, b) => a + b, 0));
            return newCounts;
        });

        try {
            await chatService.markRead(ideaId);
            if (socket) {
                const token = localStorage.getItem('token');
                if (token) {
                    socket.emit('mark_chat_read', { ideaId, token });
                }
            }
        } catch (error) {
            console.error('Failed to mark chat as read:', error);
        }
    }, [userId, socket]);

    return {
        unreadCounts,
        totalUnread,
        markAsRead,
        refreshCounts: fetchCounts
    };
};
