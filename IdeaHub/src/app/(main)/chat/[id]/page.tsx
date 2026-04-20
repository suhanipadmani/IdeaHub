'use client';

import { useParams, useRouter } from 'next/navigation';
import { useIdea } from '@/hooks/useIdeas';
import { useAuth } from '@/hooks/useAuth';
import { ChatPanel } from '@/components/chat/ChatPanel'; 
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, MessageSquare, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
    const params = useParams();
    const id = (params?.id as string) || '';
    const router = useRouter();
    const { data: idea, isLoading, error } = useIdea(id);
    const { user } = useAuth();

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-200px)] flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (error || !idea) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center px-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md font-medium">
                    We couldn't locate the project chat you're looking for.
                </p>
                <Button onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    // RBAC & Status Check
    const userId = user?._id || (user as any)?.id;
    const ideaFounderId = typeof idea.founderId === 'object' ? idea.founderId._id : idea.founderId;
    
    const isOwner = ideaFounderId === userId;
    const isAdmin = user?.role === 'admin';
    const isApproved = idea.status === 'approved';

    if (!isApproved) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center px-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-full mb-6">
                    <MessageSquare className="w-10 h-10 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chat Not Available</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md font-medium text-lg leading-relaxed">
                    Communication channels for <strong className="text-gray-900 dark:text-white">"{idea.title}"</strong> are only opened once the project is formally approved.
                </p>
                <Button onClick={() => router.back()} variant="outline" className="font-bold border-yellow-200 text-yellow-700">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Return to Project
                </Button>
            </div>
        );
    }

    if (!isOwner && !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center px-4">
                <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-2">Access Denied</h2>
                <p className="text-gray-400 font-bold mb-8">You are not authorized to view this collaboration channel.</p>
                <Button onClick={() => router.back()}>Exit</Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 pb-12">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 h-auto hover:bg-transparent text-gray-400 hover:text-indigo-600 transition-colors shrink-0"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-1 truncate">
                            {idea.title}
                        </h1>
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-indigo-600 dark:text-indigo-400 truncate">
                            Active Collaboration Channel
                        </p>
                    </div>
                </div>
                
                <div className="flex shrink-0">
                    <Link href={isAdmin ? `/admin/ideas/${id}` : `/founder/ideas/${id}`} className="w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto font-bold px-6 border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm">
                            View Project Scope
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Chat Container */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ChatPanel 
                    ideaId={id} 
                    className="h-[75vh] min-h-[600px] border-indigo-100 dark:border-indigo-900/30 shadow-2xl shadow-indigo-100/50 dark:shadow-none" 
                />
            </div>
        </div>
    );
}
