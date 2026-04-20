'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat, IMessage } from '@/hooks/useChat';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Send, User, Trash2, Paperclip, FileText, Download, Edit2, Reply, X, Pin, PinOff, Check, CheckCheck, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { showToast } from '@/utils/toast';
import { isSameDay, formatChatSeparator } from '@/utils/date';

const DateSeparator: React.FC<{ date: string }> = ({ date }) => (
    <div className="flex items-center justify-center my-6 top-2 z-20 pointer-events-none">
        <div className="bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm pointer-events-auto">
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none">
                {formatChatSeparator(date)}
            </span>
        </div>
    </div>
);

interface ChatPanelProps {
    ideaId: string;
    className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ ideaId, className }) => {
    const { user } = useAuth();
    const {
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
        uploadFile,
        editMessage,
        pinMessage,
        unpinMessage
    } = useChat(ideaId);

    const [inputValue, setInputValue] = useState('');
    const [pendingAttachments, setPendingAttachments] = useState<NonNullable<IMessage['attachments']>>([]);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, messageId: string, attachment?: IMessage['attachment'], senderId: string } | null>(null);
    const [replyingTo, setReplyingTo] = useState<IMessage | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const topSentinelRef = useRef<HTMLDivElement>(null);
    const bottomAnchorRef = useRef<HTMLDivElement>(null);
    const lastScrollHeightRef = useRef<number>(0);
    const initialScrollDone = useRef(false);

    // Typing debounce
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTypingRef = useRef<number>(0);

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        const handleScroll = () => setContextMenu(null);
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            window.removeEventListener('click', handleClick);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);

        // Auto-resize textarea
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 140) + 'px';

        const now = Date.now();
        if (now - lastTypingRef.current > 1000) {
            setTyping(true);
            lastTypingRef.current = now;
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
        }, 2000);
    };

    const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'auto') => {
        if (bottomAnchorRef.current) {
            bottomAnchorRef.current.scrollIntoView({ behavior, block: 'end' });
        }
    }, []);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const text = inputValue.trim();
        if (!text && pendingAttachments.length === 0) return;

        try {
            await sendMessage(text, pendingAttachments.length > 0 ? pendingAttachments : undefined, replyingTo || undefined);
            setInputValue('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
            setPendingAttachments([]);
            setReplyingTo(null);
            setTyping(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            // Scroll to bottom after state update
            setTimeout(() => scrollToBottom('smooth'), 50);
        } catch (error) {
            showToast.error("Failed to send message. Please try again.");
            console.error("SendMessage Error:", error);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingMessageId || !editText.trim()) return;
        try {
            await editMessage(editingMessageId, editText);
            setEditingMessageId(null);
            setEditText('');
        } catch (error) {
            showToast.error("Failed to edit message");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        try {
            // Process all selected files sequentially
            for (const file of files) {
                const attachment = await uploadFile(file);
                setPendingAttachments(prev => [...prev, attachment]);
            }

            setTimeout(() => {
                const inputEl = document.getElementById('chat-input');
                if (inputEl) inputEl.focus();
            }, 10);

        } catch (error: any) {
            showToast.error(error.message || "Failed to upload file");
        } finally {
            if (e.target) e.target.value = '';
        }
    };

    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
            if (scrollRef.current) {
                lastScrollHeightRef.current = scrollRef.current.scrollHeight;
            }
            loadMore();
        }
    }, [hasMore, isLoadingMore, isLoading, loadMore]);

    useEffect(() => {
        if (topSentinelRef.current) {
            observerRef.current = new IntersectionObserver(handleObserver, { threshold: 1.0 });
            observerRef.current.observe(topSentinelRef.current);
        }
        return () => observerRef.current?.disconnect();
    }, [handleObserver]);

    useEffect(() => {
        if (!isLoadingMore && lastScrollHeightRef.current && scrollRef.current) {
            const newHeight = scrollRef.current.scrollHeight;
            const diff = newHeight - lastScrollHeightRef.current;
            scrollRef.current.scrollTop = diff;
            lastScrollHeightRef.current = 0;
        }
    }, [isLoadingMore]);

    useEffect(() => {
        if (!isLoading && messages.length > 0 && !initialScrollDone.current) {
            setTimeout(() => scrollToBottom('auto'), 100);
            initialScrollDone.current = true;
        }
    }, [isLoading, messages, scrollToBottom]);

    const typingList = Object.entries(typingUsers)
        .filter(([_, status]) => status.isTyping)
        .map(([_, status]) => status.role === 'admin' ? 'Admin' : 'Founder');

    const sortedMessages = useMemo(() => {
        return [...messages].reverse();
    }, [messages]);

    const pinnedMessages = useMemo(() => {
        return messages.filter(m => m.isPinned);
    }, [messages]);

    const userId = user?.id;
    const isAdmin = user?.role === 'admin';

    if (isLoading && page === 1) {
        return (
            <div className="flex items-center justify-center h-[500px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <Loader />
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-[550px] sm:h-[650px] bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden", className)}>
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Project Chat</h3>
                        {typingList.length > 0 && (
                            <p className="text-[10px] font-bold text-indigo-500 animate-pulse italic leading-none mt-1">
                                {typingList.join(', ')} {typingList.length > 1 ? 'are' : 'is'} typing...
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Pinned Messages Section */}
            {pinnedMessages.length > 0 && (
                <div className="bg-amber-50/50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30 p-2 overflow-hidden">
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar-hide pb-1">
                        {pinnedMessages.map((msg) => (
                            <div
                                key={`pinned-${msg._id}`}
                                onClick={() => document.getElementById(`message-${msg._id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                className="flex-shrink-0 max-w-[200px] bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800/50 rounded-xl p-2 px-3 shadow-sm cursor-pointer hover:border-amber-400 transition-colors flex items-start gap-2 group"
                            >
                                <Pin className="w-3 h-3 text-amber-500 mt-1 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase truncate">
                                        Pinned by {msg.senderRole === 'admin' ? 'Admin' : 'Founder'}
                                    </p>
                                    <p className="text-[11px] text-gray-600 dark:text-gray-300 truncate">
                                        {msg.message || (msg.attachment ? "Attachment" : "...")}
                                    </p>
                                </div>
                                {isAdmin && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            unpinMessage(msg._id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-amber-100 dark:hover:bg-amber-800 rounded transition-all"
                                    >
                                        <X className="w-3 h-3 text-amber-600" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4 scroll-smooth custom-scrollbar"
            >
                <div ref={topSentinelRef} className="h-4 flex items-center justify-center">
                    {isLoadingMore && <Loader size="sm" />}
                    {!hasMore && messages.length > 0 && (
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-2">Beginning of communication</p>
                    )}
                </div>

                {sortedMessages.map((msg, idx) => {
                    const isMe = String(msg.senderId) === String(userId);
                    const isFirstInGroup = idx === 0 || String(sortedMessages[idx - 1].senderId) !== String(msg.senderId);

                    const showDateSeparator = idx === 0 || !isSameDay(msg.createdAt, sortedMessages[idx - 1].createdAt);

                    return (
                        <React.Fragment key={msg._id}>
                            {showDateSeparator && <DateSeparator date={msg.createdAt} />}
                            <div
                                id={`message-${msg._id}`}
                                className={cn(
                                    "flex flex-col max-w-[92%] sm:max-w-[85%] relative",
                                    isMe ? "ml-auto items-end pr-3" : "mr-auto items-start pl-3"
                                )}
                            >
                                {isFirstInGroup && (
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 mx-1">
                                        {isMe ? 'You' : msg.senderRole === 'admin' ? 'Admin' : 'Founder'}
                                    </span>
                                )}
                                <div
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        setContextMenu({
                                            x: e.clientX,
                                            y: e.clientY,
                                            messageId: msg._id,
                                            attachment: msg.attachment,
                                            senderId: msg.senderId
                                        });
                                    }}
                                    className={cn(
                                        "px-4 py-2.5 text-sm font-medium leading-relaxed shadow-sm relative group transition-all",
                                        isMe
                                            ? cn("bg-indigo-600 text-white", isFirstInGroup ? "rounded-2xl rounded-tr-none" : "rounded-2xl")
                                            : cn("bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700/50", isFirstInGroup ? "rounded-2xl rounded-tl-none" : "rounded-2xl"),
                                        msg.isPinned && "border-2 border-amber-400 dark:border-amber-500 shadow-amber-100 dark:shadow-none"
                                    )}
                                >
                                    {msg.isPinned && (
                                        <div className="absolute -left-2 -top-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-md z-10">
                                            <Pin className="w-3.5 h-3.5 text-white fill-white" />
                                        </div>
                                    )}
                                    {msg.replyTo && (
                                        <div
                                            onClick={() => {
                                                if (msg.replyTo) {
                                                    document.getElementById(`message-${msg.replyTo._id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }
                                            }}
                                            className={cn(
                                                "mb-2 p-2 rounded-lg cursor-pointer border-l-4 text-xs select-none transition-colors",
                                                isMe
                                                    ? "bg-indigo-900/50 border-indigo-400 hover:bg-indigo-700/70 text-indigo-100"
                                                    : "bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                                            )}
                                        >
                                            <div className="flex items-center gap-1.5 mb-1 opacity-80">
                                                <Reply className="w-3 h-3" />
                                                <span className="font-bold capitalize">{String(msg.replyTo.senderId) === String(userId) ? 'You' : msg.replyTo.senderRole === 'admin' ? 'Admin' : 'Founder'}</span>
                                            </div>
                                            <p className="truncate opacity-90">
                                                {msg.replyTo.message || (msg.replyTo.attachment ? 'Attachment' : '')}
                                            </p>
                                        </div>
                                    )}
                                    {editingMessageId === msg._id ? (
                                        <div className="flex flex-col gap-2 min-w-[200px]">
                                            <input
                                                type="text"
                                                autoFocus
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveEdit();
                                                    if (e.key === 'Escape') {
                                                        setEditingMessageId(null);
                                                        setEditText('');
                                                    }
                                                }}
                                                className={cn(
                                                    "w-full rounded-xl px-3 py-1.5 text-sm outline-none transition-colors",
                                                    isMe
                                                        ? "bg-indigo-700/50 border border-indigo-400 placeholder-indigo-300 text-white"
                                                        : "bg-gray-200/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-100"
                                                )}
                                            />
                                            <div className="flex justify-end gap-2 mt-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingMessageId(null);
                                                        setEditText('');
                                                    }}
                                                    className={cn(
                                                        "px-2 py-1 rounded text-[11px] font-bold transition-colors",
                                                        isMe ? "hover:bg-indigo-500 text-indigo-100" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                                                    )}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveEdit}
                                                    disabled={!editText.trim()}
                                                    className={cn(
                                                        "px-2 py-1 rounded text-[11px] font-black transition-colors disabled:opacity-50",
                                                        isMe ? "bg-indigo-500 text-white hover:bg-indigo-400" : "bg-indigo-600 text-white hover:bg-indigo-500"
                                                    )}
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        msg.message && <div className={cn(((msg.attachment && msg.attachment.url) || (msg.attachments && msg.attachments.length > 0)) && "mb-3 leading-snug whitespace-pre-wrap")}>{msg.message}</div>
                                    )}

                                    {/* Handle legacy attachment */}
                                    {(msg.attachment && msg.attachment.url) && (
                                        <div className="text-left w-full mt-1">
                                            {msg.attachment.type?.startsWith('image/') ? (
                                                <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="block max-w-[180px] sm:max-w-[240px] max-h-[180px] sm:max-h-[240px] overflow-hidden rounded-xl shadow-sm hover:opacity-90 transition-opacity">
                                                    <img src={msg.attachment.url} alt={msg.attachment.name} className="w-full h-full object-cover" />
                                                </a>
                                            ) : (
                                                <a
                                                    href={msg.attachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all hover:opacity-90", isMe ? "bg-indigo-700 border-indigo-500 text-white" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700/50")}
                                                >
                                                    <div className={cn("shrink-0 p-2 rounded-lg flex items-center justify-center", isMe ? "bg-indigo-600 text-indigo-100" : "bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400")}>
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <p className="text-sm font-bold truncate max-w-[150px]">{msg.attachment.name}</p>
                                                        <p className={cn("text-[10px] font-medium uppercase tracking-wider mt-0.5", isMe ? "text-indigo-200" : "text-gray-500 dark:text-gray-400")}>
                                                            {((msg.attachment.size || 0) / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                    <div className={cn("shrink-0 p-2 rounded-full", isMe ? "bg-indigo-600 hover:bg-indigo-500" : "bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500")}>
                                                        <Download className="w-4 h-4" />
                                                    </div>
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {/* Handle new attachments array */}
                                    {msg.attachments && msg.attachments?.length > 0 && (
                                        <div className={cn(
                                            "grid gap-2 mt-2",
                                            msg.attachments?.length === 1 ? "grid-cols-1 w-fit" : "grid-cols-1 sm:grid-cols-2 w-full"
                                        )}>
                                            {msg.attachments.map((att, i) => (
                                                <div key={`${msg._id}-att-${i}`} className="w-full">
                                                    {att.type?.startsWith('image/') ? (
                                                        <a
                                                            href={att.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={cn(
                                                                "block overflow-hidden rounded-xl shadow-sm hover:opacity-90 transition-opacity",
                                                                msg.attachments?.length === 1
                                                                    ? "max-w-[180px] sm:max-w-[240px] max-h-[180px] sm:max-h-[320px]"
                                                                    : "aspect-video w-full"
                                                            )}
                                                        >
                                                            <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                                                        </a>
                                                    ) : (
                                                        <a
                                                            href={att.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 rounded-xl border transition-all hover:opacity-90 h-full min-w-[200px] max-w-[280px] sm:max-w-[320px]",
                                                                isMe ? "bg-indigo-700 border-indigo-500 text-white" : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700"
                                                            )}
                                                        >
                                                            <div className={cn("shrink-0 p-2 rounded-lg flex items-center justify-center", isMe ? "bg-indigo-600 text-indigo-100" : "bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400")}>
                                                                <FileText className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold truncate">{att.name}</p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <p className={cn("text-[8px] font-black uppercase tracking-wider px-1 rounded bg-gray-100 dark:bg-gray-800", isMe ? "text-indigo-200 bg-indigo-500/30" : "text-gray-500")}>
                                                                        {att.name.split('.').pop()?.toUpperCase() || 'FILE'}
                                                                    </p>
                                                                    <p className={cn("text-[9px] font-medium uppercase tracking-wider", isMe ? "text-indigo-200" : "text-gray-500 dark:text-gray-400")}>
                                                                        {((att.size || 0) / 1024 / 1024).toFixed(2)} MB
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className={cn("flex items-center gap-1.5 mt-1 mx-1", isMe ? "justify-end" : "justify-start")}>
                                    {msg.isEdited && (
                                        <span className="text-[9px] font-medium text-gray-400 italic">
                                            (edited)
                                        </span>
                                    )}
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && (
                                        <div className="flex items-center ml-0.5" title={msg.status || 'sent'}>
                                            {msg.status === 'seen' ? (
                                                <CheckCheck className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" />
                                            ) : msg.status === 'delivered' ? (
                                                <CheckCheck className="w-3.5 h-3.5 text-gray-400 stroke-[3]" />
                                            ) : (
                                                <Check className="w-3.5 h-3.5 text-gray-400 stroke-[3]" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}

                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">No messages yet</p>
                        <p className="text-[10px] mt-2">Send the first message to start collaborating!</p>
                    </div>
                )}
                <div ref={bottomAnchorRef} className="h-2 w-full flex-shrink-0" />
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 relative">
                <div className="flex flex-col gap-2 max-w-4xl mx-auto">
                    {replyingTo && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-2 flex items-center justify-between border border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom-1">
                            <div className="flex-1 min-w-0 pr-4 border-l-2 border-indigo-500 pl-3">
                                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 capitalize flex items-center gap-1.5">
                                    <Reply className="w-3 h-3" />
                                    Replying to {
                                        String(replyingTo.senderId) === String(userId) ? 'You' : replyingTo.senderRole === 'admin' ? 'Admin' : 'Founder'
                                    }
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-0.5">
                                    {replyingTo.message || (replyingTo.attachments?.[0]?.name || replyingTo.attachment?.name || 'Attachment')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setReplyingTo(null)}
                                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="relative group bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl border border-gray-200 dark:border-gray-700/50 transition-all focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 focus-within:bg-white dark:focus-within:bg-gray-800 p-2">
                        {/* Attachments Area */}
                        <AnimatePresence>
                            {pendingAttachments.length > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="flex flex-wrap gap-2 px-2 pt-2 pb-3 overflow-hidden"
                                >
                                    {pendingAttachments.map((att, idx) => (
                                        <motion.div
                                            key={`pending-${idx}`}
                                            layout
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                            className="relative group/att"
                                        >
                                            {att.type.startsWith('image/') ? (
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm relative">
                                                    <img src={att.url} alt="preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/10 transition-opacity" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 p-2 pr-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm max-w-[200px]">
                                                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shrink-0">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate">{att.name}</p>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                                                            {att.name.split('.').pop()?.toUpperCase() || 'FILE'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setPendingAttachments(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-red-500 hover:scale-110 transition-all z-10"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Uploading State */}
                        {isUploading && (
                            <div className="px-4 py-2 flex items-center gap-3 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl mb-2 animate-pulse mx-2 mt-2">
                                <Loader size="sm" className="w-3 h-3" />
                                Uploading attachment...
                            </div>
                        )}

                        <form className="flex items-end gap-2 px-1" onSubmit={handleSendMessage}>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all shrink-0 mb-1"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>

                            <div className="flex-1 min-h-[44px] flex items-end">
                                <textarea
                                    ref={textareaRef}
                                    id="chat-input"
                                    rows={1}
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    autoComplete="off"
                                    placeholder={pendingAttachments.length > 0 ? '' : 'Type a message...'}
                                    className="w-full bg-transparent border-none py-3 px-2 text-sm font-medium outline-none text-gray-800 dark:text-white placeholder-gray-400 resize-none overflow-y-auto leading-relaxed max-h-[140px]"
                                    style={{ height: 'auto' }}
                                />
                            </div>

                            <div className="flex items-center gap-1 mb-1 shrink-0">

                                <Button
                                    type="submit"
                                    disabled={(!inputValue.trim() && pendingAttachments.length === 0) || isUploading}
                                    className="w-12 h-12 rounded-full p-0 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 flex items-center justify-center"
                                >
                                    <Send className="w-6 h-6" />
                                </Button>
                            </div>
                        </form>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileUpload}
                            multiple
                            accept="image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        />
                    </div>
                </div>
            </div>

            {/* Context Menu Overlay */}
            {contextMenu && (
                <div
                    className="fixed z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-gray-100 dark:border-gray-700 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.attachment && (
                        <a
                            href={contextMenu.attachment.url.includes('ik.imagekit.io') ? `${contextMenu.attachment.url}${contextMenu.attachment.url.includes('?') ? '&' : '?'}ik-attachment=true` : contextMenu.attachment.url}
                            download={contextMenu.attachment.name}
                            onClick={() => setContextMenu(null)}
                            className="w-full min-w-[200px] text-left px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                        >
                            <Download className="w-[18px] h-[18px]" />
                            Download Document
                        </a>
                    )}
                    <button
                        onClick={() => {
                            const msgToReply = messages.find(m => m._id === contextMenu.messageId);
                            if (msgToReply) setReplyingTo(msgToReply);
                            setContextMenu(null);
                            setTimeout(() => document.getElementById('chat-input')?.focus(), 10);
                        }}
                        className="w-full min-w-[200px] text-left px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                        <Reply className="w-[18px] h-[18px]" />
                        Reply
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                const msg = messages.find(m => m._id === contextMenu.messageId);
                                if (msg?.isPinned) {
                                    unpinMessage(contextMenu.messageId);
                                } else {
                                    pinMessage(contextMenu.messageId);
                                }
                                setContextMenu(null);
                            }}
                            className="w-full min-w-[200px] text-left px-5 py-3 text-sm font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center gap-3"
                        >
                            {messages.find(m => m._id === contextMenu.messageId)?.isPinned ? (
                                <>
                                    <PinOff className="w-[18px] h-[18px]" />
                                    Unpin Message
                                </>
                            ) : (
                                <>
                                    <Pin className="w-[18px] h-[18px]" />
                                    Pin Message
                                </>
                            )}
                        </button>
                    )}
                    {String(contextMenu.senderId) === String(userId) && (
                        <>
                            <button
                                onClick={() => {
                                    setEditingMessageId(contextMenu.messageId);
                                    const msgToEdit = messages.find(m => m._id === contextMenu.messageId);
                                    setEditText(msgToEdit?.message || '');
                                    setContextMenu(null);
                                }}
                                className="w-full min-w-[200px] text-left px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                            >
                                <Edit2 className="w-[18px] h-[18px]" />
                                Edit Message
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await deleteMessages([contextMenu.messageId]);
                                        showToast.success("Message deleted");
                                        setContextMenu(null);
                                    } catch (err) {
                                        console.error('Failed to delete message', err);
                                        showToast.error("Failed to delete message");
                                    }
                                }}
                                className="w-full min-w-[200px] text-left px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                            >
                                <Trash2 className="w-[18px] h-[18px]" />
                                Delete Message
                            </button>
                        </>
                    )}
                </div>
            )}


        </div>
    );
};
