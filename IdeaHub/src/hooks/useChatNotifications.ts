import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from './useAuth';
import { chatService } from '@/services/chat.api';

export const useChatNotifications = () => {
    const { socket } = useSocket();
    const { user } = useAuth();
    const userId = user?.id; 
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

    const fetchCounts = useCallback(async () => {
        if (!userId) return;
        try {
            const counts = await chatService.getUnreadCounts();
            setUnreadCounts(counts);
        } catch (error) {
            console.error('Failed to fetch unread counts:', error);
        }
    }, [userId]);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    useEffect(() => {
        if (!socket || !userId) return;

        const handleNewMessage = (msg: any) => {
            if (msg.senderId !== userId) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [msg.ideaId]: (prev[msg.ideaId] || 0) + 1
                }));
            }
        };

        const handleMessageRead = ({ ideaId, userId: readUserId }: { ideaId: string, userId: string }) => {
            if (readUserId === userId) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [ideaId]: 0
                }));
            }
        };

        socket.on('receive_message', handleNewMessage);
        socket.on('chat_read', handleMessageRead);

        return () => {
            socket.off('receive_message', handleNewMessage);
            socket.off('chat_read', handleMessageRead);
        };
    }, [socket, userId]);

    const markAsRead = useCallback(async (ideaId: string) => {
        if (!userId) return;
        
        setUnreadCounts(prev => ({
            ...prev,
            [ideaId]: 0
        }));

        try {
            await chatService.markRead(ideaId);
            // Notify other components/tabs in the same socket connection that this chat was read
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
        markAsRead,
        refreshCounts: fetchCounts
    };
};
