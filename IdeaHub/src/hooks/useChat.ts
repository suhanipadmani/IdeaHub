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
    attachments?: {
        url: string;
        name: string;
        type: string;
        size: number;
    }[];
    isEdited?: boolean;
    isPinned?: boolean;
    editedAt?: string;
    replyTo?: {
        _id: string;
        message: string;
        senderId: string;
        senderRole: string;
        attachment?: any;
    };
    status?: 'sent' | 'delivered' | 'seen';
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

        socket.emit('join_room', { ideaId, token });

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

                    socket.emit('message_delivered', { 
                        ideaId: ideaIdRef.current, 
                        messageId: msg._id, 
                        token 
                    });
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

        const handleMessageEdited = ({ messageId, newText, isEdited, editedAt }: { messageId: string, newText: string, isEdited: boolean, editedAt: string }) => {
            setMessages(prev => prev.map(m => 
                m._id === messageId 
                    ? { ...m, message: newText, isEdited, editedAt } 
                    : m
            ));
        };

        const handleMessagePinned = ({ messageId, isPinned }: { messageId: string, isPinned: boolean }) => {
            setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isPinned } : m));
        };

        const handleMessageUnpinned = ({ messageId, isPinned }: { messageId: string, isPinned: boolean }) => {
            setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isPinned } : m));
        };

        const handleMessageStatusUpdate = (payload: { messageId?: string, ideaId?: string, status: 'sent' | 'delivered' | 'seen', updatedBy?: string }) => {
            setMessages(prev => prev.map(m => {
                if (payload.messageId && m._id === payload.messageId) {
                    return { ...m, status: payload.status };
                }
                if (payload.ideaId && !payload.messageId && m.senderId !== payload.updatedBy) {
                    const statusRank = { sent: 1, delivered: 2, seen: 3 };
                    const currentStatus = m.status || 'sent';
                    if (statusRank[payload.status] > statusRank[currentStatus]) {
                        return { ...m, status: payload.status };
                    }
                }
                return m;
            }));
        };

        socket.on('receive_message', handleNewMessage);
        socket.on('user_typing', handleTyping);
        socket.on('messages_deleted', handleMessagesDeleted);
        socket.on('message_edited', handleMessageEdited);
        socket.on('message_pinned', handleMessagePinned);
        socket.on('message_unpinned', handleMessageUnpinned);
        socket.on('message_status_update', handleMessageStatusUpdate);

        return () => {
            socket.off('receive_message', handleNewMessage);
            socket.off('user_typing', handleTyping);
            socket.off('messages_deleted', handleMessagesDeleted);
            socket.off('message_edited', handleMessageEdited);
            socket.off('message_pinned', handleMessagePinned);
            socket.off('message_unpinned', handleMessageUnpinned);
            socket.off('message_status_update', handleMessageStatusUpdate);
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

    const sendMessage = useCallback(async (text: string, attachments?: IMessage['attachments'], replyToInfo?: IMessage['replyTo']) => {
        if (!socket || !ideaId || !user) {
            throw new Error('Chat session not ready');
        }

        if (!text.trim() && (!attachments || attachments.length === 0)) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized');

        const payloads: { message?: string, attachments?: IMessage['attachments'], replyTo?: string }[] = [];

        if (attachments && attachments.length > 0) {
            attachments.forEach((att, idx) => {
                payloads.push({
                    message: idx === 0 ? text.trim() : "",
                    attachments: [att]
                });
            });
        } else if (text.trim()) {
            payloads.push({ message: text.trim() });
        }

        if (payloads.length > 0 && replyToInfo) {
            payloads[0].replyTo = replyToInfo._id;
        }

        const now = Date.now();
        const optimisticMessages: IMessage[] = payloads.map((p, idx) => ({
            _id: `temp-${now}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
            ideaId,
            senderId: user.id,
            senderRole: user.role as any,
            message: p.message || "",
            attachments: p.attachments,
            replyTo: p.replyTo ? replyToInfo : undefined,
            createdAt: new Date(now + idx).toISOString()
        }));

        setMessages(prev => [...[...optimisticMessages].reverse(), ...prev]);


        payloads.forEach(payload => {
            socket.emit('send_message', { 
                ideaId, 
                token, 
                message: payload.message, 
                attachments: payload.attachments, 
                replyTo: payload.replyTo 
            });
        });
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

    const editMessage = useCallback(async (messageId: string, newText: string) => {
        if (!socket || !ideaId || !user) {
            throw new Error('Chat session not ready');
        }

        if (!newText.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized');

        setMessages(prev => prev.map(m => 
            m._id === messageId 
                ? { ...m, message: newText, isEdited: true, editedAt: new Date().toISOString() } 
                : m
        ));
        socket.emit('edit_message', { ideaId, token, messageId, newText });
    }, [socket, ideaId, user]);

    const pinMessage = useCallback(async (messageId: string) => {
        if (!socket || !ideaId || !user || user.role !== 'admin') {
            throw new Error('Unauthorized or chat session not ready');
        }

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized');

        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isPinned: true } : m));

        socket.emit('pin_message', { ideaId, token, messageId });
    }, [socket, ideaId, user]);

    const unpinMessage = useCallback(async (messageId: string) => {
        if (!socket || !ideaId || !user || user.role !== 'admin') {
            throw new Error('Unauthorized or chat session not ready');
        }

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized');

        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isPinned: false } : m));

        socket.emit('unpin_message', { ideaId, token, messageId });
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
        editMessage,
        pinMessage,
        unpinMessage,
        setTyping,
        loadMore,
        isUploading,
        uploadFile
    };
};
