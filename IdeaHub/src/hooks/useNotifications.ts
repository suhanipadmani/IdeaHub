import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from './useAuth';

export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'review' | 'chat' | 'system';
    link: string;
    isRead: boolean;
    createdAt: string;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const { user } = useAuth();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const response = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user, token]);

    const markAsRead = async (notificationId?: string) => {
        try {
            await axios.patch('/api/notifications', {
                notificationId,
                markAll: !notificationId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!notificationId) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            } else {
                setNotifications(prev => prev.map(n => 
                    n._id === notificationId ? ({ ...n, isRead: true }) : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (!socket || !user) return;

        const handleNewNotification = (notification: Notification) => {
            setNotifications(prev => [notification, ...prev].slice(0, 20));
            setUnreadCount(prev => prev + 1);
        };

        socket.on('new_notification', handleNewNotification);

        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket, user]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        refresh: fetchNotifications
    };
};
