'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat, IMessage } from '@/hooks/useChat';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Send, User, Trash2, Paperclip, FileText, Download } from 'lucide-react';
import { cn } from '@/utils/cn';
import { showToast } from '@/utils/toast';

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
        uploadFile
    } = useChat(ideaId);

    const [inputValue, setInputValue] = useState('');
    const [pendingAttachment, setPendingAttachment] = useState<IMessage['attachment'] | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, messageId: string, attachment?: IMessage['attachment'], senderId: string } | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const topSentinalRef = useRef<HTMLDivElement>(null);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);

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

    const isNearBottom = () => {
        if (!scrollRef.current) return false;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        return scrollHeight - (scrollTop + clientHeight) < 100;
    };

    const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'auto') => {
        if (bottomAnchorRef.current) {
            bottomAnchorRef.current.scrollIntoView({ behavior, block: 'end' });
        }
    }, []);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const text = inputValue.trim();
        if (!text && !pendingAttachment) return;

        try {
            await sendMessage(text, pendingAttachment || undefined);
            setInputValue('');
            setPendingAttachment(null);
            setTyping(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            // Scroll to bottom after state update
            setTimeout(() => scrollToBottom('smooth'), 50);
        } catch (error) {
            showToast.error("Failed to send message. Please try again.");
            console.error("SendMessage Error:", error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const attachment = await uploadFile(file);
            setPendingAttachment(attachment);

            // Refocus input if they want to type alongside it
            // Small delay to let React process the update first
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
        if (topSentinalRef.current) {
            observerRef.current = new IntersectionObserver(handleObserver, { threshold: 1.0 });
            observerRef.current.observe(topSentinalRef.current);
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

    const userId = user?.id;

    if (isLoading && page === 1) {
        return (
            <div className="flex items-center justify-center h-[500px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <Loader />
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-[600px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden", className)}>
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Project Chat</h3>
                        <p className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Live Engagement
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth custom-scrollbar"
            >
                <div ref={topSentinalRef} className="h-4 flex items-center justify-center">
                    {isLoadingMore && <Loader size="sm" />}
                    {!hasMore && messages.length > 0 && (
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-2">Beginning of communication</p>
                    )}
                </div>

                {sortedMessages.map((msg, idx) => {
                    const isMe = String(msg.senderId) === String(userId);
                    const isFirstInGroup = idx === 0 || String(sortedMessages[idx - 1].senderId) !== String(msg.senderId);

                    return (
                        <div
                            key={msg._id}
                            className={cn(
                                "flex flex-col max-w-[85%]",
                                isMe ? "ml-auto items-end" : "mr-auto items-start"
                            )}
                        >
                            {isFirstInGroup && (
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 mx-1">
                                    {isMe ? 'You' : msg.senderRole === 'admin' ? 'Admin' : 'Founder'}
                                </span>
                            )}
                            <div
                                onContextMenu={(e) => {
                                    if (isMe || msg.attachment) {
                                        e.preventDefault();
                                        setContextMenu({
                                            x: e.clientX,
                                            y: e.clientY,
                                            messageId: msg._id,
                                            attachment: msg.attachment,
                                            senderId: msg.senderId
                                        });
                                    }
                                }}
                                className={cn(
                                    "px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm relative group transition-all",
                                    isMe
                                        ? "bg-indigo-600 text-white rounded-tr-none"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-700/50",
                                    (isMe || msg.attachment) && "cursor-context-menu"
                                )}
                            >
                                {msg.message && <div className={cn(msg.attachment && "mb-3 leading-snug")}>{msg.message}</div>}
                                {msg.attachment && (
                                    <div className="text-left w-full mt-1">
                                        {msg.attachment.type.startsWith('image/') ? (
                                            <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="block max-w-[240px] max-h-[240px] overflow-hidden rounded-xl shadow-sm hover:opacity-90 transition-opacity">
                                                <img src={msg.attachment.url} alt={msg.attachment.name} className="w-full h-full object-cover" />
                                            </a>
                                        ) : (
                                            <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all hover:opacity-90", isMe ? "bg-indigo-700 border-indigo-500 text-white" : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600")}>
                                                <div className={cn("shrink-0 p-2 rounded-lg flex items-center justify-center", isMe ? "bg-indigo-600 text-indigo-100" : "bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400")}>
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className="text-sm font-bold truncate max-w-[150px]">{msg.attachment.name}</p>
                                                    <p className={cn("text-[10px] font-medium uppercase tracking-wider mt-0.5", isMe ? "text-indigo-200" : "text-gray-500 dark:text-gray-400")}>
                                                        {(msg.attachment.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <div className={cn("shrink-0 p-2 rounded-full", isMe ? "bg-indigo-600 hover:bg-indigo-500" : "bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500")}>
                                                    <Download className="w-4 h-4" />
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 mx-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
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

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/5 relative">
                {pendingAttachment && !isUploading && (
                    <div className="absolute -top-14 left-5 bg-white dark:bg-gray-800 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-200 dark:border-gray-700 p-2 pr-4 flex items-center gap-3 text-sm animate-in slide-in-from-bottom-2 z-10 w-max max-w-[calc(100%-40px)]">
                        <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shrink-0">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 truncate">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{pendingAttachment.name}</span>
                            <span className="text-xs text-gray-500 ml-2">{(pendingAttachment.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setPendingAttachment(null)}
                            className="ml-2 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {isUploading && (
                    <div className="absolute -top-10 left-5 right-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 px-4 flex items-center justify-between text-xs font-semibold animate-in slide-in-from-bottom-2">
                        <span className="flex items-center gap-2">
                            <Loader size="sm" className="w-3 h-3 text-indigo-500" />
                            Uploading attachment...
                        </span>
                        <span className="text-gray-400">Please wait</span>
                    </div>
                )}
                <div className="h-5 mb-1 px-1 flex items-center">
                    {typingList.length > 0 && (
                        <p className="text-[10px] font-bold text-indigo-500 animate-pulse italic">
                            {typingList.join(', ')} {typingList.length > 1 ? 'are' : 'is'} typing...
                        </p>
                    )}
                </div>

                <form className="flex gap-2" onSubmit={handleSendMessage}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="rounded-2xl w-12 h-12 flex items-center justify-center p-0 flex-shrink-0 text-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="relative flex-1">
                        <input
                            id="chat-input"
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Draft a message..."
                            disabled={isUploading}
                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white shadow-inner disabled:opacity-50"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="rounded-2xl w-12 h-12 flex items-center justify-center p-0 shadow-lg shadow-indigo-200 dark:shadow-none disabled:bg-gray-200 disabled:text-gray-400"
                        disabled={(!inputValue.trim() && !pendingAttachment) || isUploading}
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
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
                            href={contextMenu.attachment.url}
                            download={contextMenu.attachment.name}
                            onClick={() => setContextMenu(null)}
                            className="w-full min-w-[200px] text-left px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                        >
                            <Download className="w-[18px] h-[18px]" />
                            Download Document
                        </a>
                    )}
                    {String(contextMenu.senderId) === String(userId) && (
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
                    )}
                </div>
            )}


        </div>
    );
};
