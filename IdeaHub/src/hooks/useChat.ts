'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from './useAuth';
import { chatService } from '../services/chat.api';

export interface IMessage {
    _id: string;
    ideaId: string;
    senderId: string;
    senderRole: 'admin' | 'founder';
    message: string;
    attachment?: {
        url: string;
        name: string;
        type: string;
        size: number;
    };
    createdAt: string;
}

export const useChat = (ideaId: string) => {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [typingUsers, setTypingUsers] = useState<Record<string, { role: string; isTyping: boolean }>>({});
    const [isUploading, setIsUploading] = useState(false);

    const ideaIdRef = useRef(ideaId);
    useEffect(() => { ideaIdRef.current = ideaId; }, [ideaId]);

    const fetchHistory = useCallback(async (pageNum: number, isMore: boolean = false) => {
        try {
            if (isMore) setIsLoadingMore(true);
            else setIsLoading(true);

            const data = await chatService.getHistory(ideaId, pageNum);

            if (isMore) {
                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => m._id));
                    const newMessages = data.messages.filter((m: IMessage) => !existingIds.has(m._id));
                    return [...prev, ...newMessages];
                });
            } else {
                setMessages(data.messages);
            }

            setHasMore(data.hasMore);
            setPage(data.currentPage);
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [ideaId]);

    useEffect(() => {
        if (!ideaId) return;
        fetchHistory(1);
    }, [ideaId, fetchHistory]);

    useEffect(() => {
        if (!socket || !ideaId || !user) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        // Join the room
        socket.emit('join_room', { ideaId, token });

        // Mark as read when entering the chat
        chatService.markRead(ideaId).then(() => {
            socket.emit('mark_chat_read', { ideaId, token });
        }).catch(() => { });

        const handleNewMessage = (msg: IMessage) => {
            if (msg.ideaId === ideaIdRef.current) {
                setMessages(prev => {
                    if (prev.some(m => m._id === msg._id)) return prev;

                    const tempIdx = prev.findIndex(m =>
                        m._id.startsWith('temp-') &&
                        m.senderId === msg.senderId &&
                        (!msg.message || m.message === msg.message)
                    );

                    if (tempIdx !== -1) {
                        const next = [...prev];
                        next[tempIdx] = msg;
                        return next;
                    }

                    return [msg, ...prev];
                });

                if (msg.senderId !== user.id) {
                    chatService.markRead(ideaIdRef.current).then(() => {
                        socket.emit('mark_chat_read', { ideaId: ideaIdRef.current, token });
                    }).catch(() => { });
                }
            }
        };

        const handleTyping = ({ userId, role, isTyping }: { userId: string, role: string, isTyping: boolean }) => {
            if (userId === user.id) return;
            setTypingUsers(prev => ({
                ...prev,
                [userId]: { role, isTyping }
            }));
        };

        const handleMessagesDeleted = ({ messageIds }: { messageIds: string[] }) => {
            setMessages(prev => prev.filter(m => !messageIds.includes(m._id)));
        };

        socket.on('receive_message', handleNewMessage);
        socket.on('user_typing', handleTyping);
        socket.on('messages_deleted', handleMessagesDeleted);

        return () => {
            socket.off('receive_message', handleNewMessage);
            socket.off('user_typing', handleTyping);
            socket.off('messages_deleted', handleMessagesDeleted);
        };
    }, [socket, ideaId, user]);

    const uploadFile = useCallback(async (file: File) => {
        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Unauthorized");

            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`/api/chat/${ideaId}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to upload file");
            }

            return await res.json();
        } finally {
            setIsUploading(false);
        }
    }, [ideaId]);

    const sendMessage = useCallback(async (text: string, attachment?: IMessage['attachment']) => {
        if (!socket || !ideaId || !user) {
            throw new Error('Chat session not ready');
        }

        if (!text.trim() && !attachment) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized');

        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const optimisticMsg: IMessage = {
            _id: tempId,
            ideaId,
            senderId: user.id,
            senderRole: user.role as any,
            message: text,
            attachment,
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [optimisticMsg, ...prev]);

        // Emit to server
        socket.emit('send_message', { ideaId, token, message: text, attachment });
    }, [socket, ideaId, user]);

    const deleteMessages = useCallback(async (messageIds: string[]) => {
        if (!socket || !ideaId || !user) {
            throw new Error('Chat session not ready');
        }

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized');

        setMessages(prev => prev.filter(m => !messageIds.includes(m._id)));

        socket.emit('delete_messages', { ideaId, token, messageIds });
    }, [socket, ideaId, user]);



    const setTyping = useCallback((isTyping: boolean) => {
        if (!socket || !ideaId || !user) return;
        socket.emit('typing_status', {
            ideaId,
            isTyping,
            userId: user.id,
            role: user.role
        });
    }, [socket, ideaId, user]);

    const loadMore = useCallback(() => {
        if (hasMore && !isLoadingMore) {
            fetchHistory(page + 1, true);
        }
    }, [hasMore, isLoadingMore, page, fetchHistory]);

    return {
        messages,
        isLoading,
        isLoadingMore,
        hasMore,
        page,
        typingUsers,
        sendMessage,
        deleteMessages,
        setTyping,
        loadMore,
        isUploading,
        uploadFile
    };
};
