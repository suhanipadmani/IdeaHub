'use client';

import { useParams } from 'next/navigation';
import { useIdea } from '@/hooks/useIdeas';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Calendar, Code, FileText, AlertCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/utils/cn';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { useAnalyzeIdea } from '@/hooks/useAnalyzeIdea';
import { AIAnalysisSection } from '@/components/common/AIAnalysisSection';
import { useChatNotifications } from '@/hooks/useChatNotifications';

export default function ProjectDetailsPage() {
    const params = useParams();
    const id = (params?.id as string) || '';
    const { data: idea, isLoading, error } = useIdea(id);
    const { analyze, isAnalyzing } = useAnalyzeIdea(id);
    const { unreadCounts } = useChatNotifications();
    const unreadCount = unreadCounts[id] || 0;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';

    if (isLoading) {
        return <div className="h-96 flex items-center justify-center"><Loader size="lg" /></div>;
    }

    if (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        if (axiosError.response?.status === 404) {
            return (
                <div className="flex flex-col items-center justify-center h-96 text-center px-4">
                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-6">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Project Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md font-medium text-lg leading-relaxed">
                        {axiosError.response.data?.message || "The project you are looking for does not exist or has been removed."}
                    </p>
                    <Link href="/founder/ideas">
                        <Button size="lg" className="px-10">
                            <ArrowLeft className="w-5 h-5 mr-3" />
                            Ideas
                        </Button>
                    </Link>
                </div>
            );
        }
        return <div className="text-center text-red-500 py-20 font-bold">Error loading project details.</div>;
    }

    if (!idea) return null;

    return (
        <div className="max-w-5xl mx-auto pb-20 px-4">
            <div className="mb-6">
                <Link href="/founder/ideas">
                    <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-indigo-600 flex items-center gap-2 group transition-all">
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-sm group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        </div>
                        <span className="font-bold text-gray-500 group-hover:text-indigo-600">Return to Previous Page </span>
                    </Button>
                </Link>
            </div>

            {/* Header Card */}
            <div className="relative bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 sm:p-10 mb-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                {/* Subtle Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 blur-3xl -ml-24 -mb-24" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                    <div className="space-y-6 flex-1">
                        <div className="space-y-4">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                                {idea.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                                    <Calendar className="h-4 w-4 text-indigo-500" />
                                    <span>Submitted {new Date(idea.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {idea.status === 'approved' && (
                        <div className="shrink-0">
                            <Link href={`/chat/${id}`}>
                                <Button className="relative bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 uppercase tracking-widest text-xs">
                                    <MessageSquare className="w-5 h-5" /> Chat with Admin
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full border-2 border-white dark:border-gray-900 shadow-sm">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] gap-8 items-start">
                {/* Left Column (Main Content) */}
                <div className="space-y-10 min-w-0">
                    <AIAnalysisSection
                        data={idea.aiAnalysis}
                        isAnalyzing={isAnalyzing}
                        onAnalyze={() => analyze()}
                        mode="founder"
                        showActions={false}
                    />

                    {/* Project Overview Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                        <div className="border-b border-gray-100 dark:border-gray-800 p-8 sm:px-10 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/10">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-4 uppercase tracking-tight">
                                <div className="p-3 bg-indigo-600/10 dark:bg-indigo-400/10 rounded-2xl">
                                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                Proposal Overview
                            </h3>
                        </div>
                        <div className="p-8 sm:p-12 space-y-20">
                            <section className="relative">
                                <div className="flex items-center gap-4 mb-8">
                                    <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] whitespace-nowrap">Problem Statement</h4>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent" />
                                </div>
                                <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap break-words">{idea.problemStatement}</p>
                            </section>

                            <section className="relative">
                                <div className="flex items-center gap-4 mb-8">
                                    <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] whitespace-nowrap">Integrated Solution</h4>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />
                                </div>
                                <div
                                    className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-medium prose dark:prose-invert max-w-none break-words prose-p:mt-0"
                                    dangerouslySetInnerHTML={{ __html: idea.solution }}
                                />
                            </section>

                            <section className="relative">
                                <div className="flex items-center gap-4 mb-8">
                                    <h4 className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.2em] whitespace-nowrap">Team & Vision</h4>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-orange-500/20 to-transparent" />
                                </div>
                                <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap break-words">{idea.teamDetails}</p>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <aside className="space-y-8 lg:sticky lg:top-8">
                    {/* Startup Attributes Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-8">
                        <div>
                            <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Target Market</h4>
                            <div className="inline-flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl border border-indigo-100/50 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300">
                                <span className="text-sm font-bold tracking-tight">{idea.targetMarket}</span>
                            </div>
                        </div>

                        <div className="h-[1px] bg-gray-100 dark:bg-gray-800" />

                        <div>
                            <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Tech Stack</h4>
                            <div className="flex flex-wrap gap-2">
                                {idea.techStack.map(tech => (
                                    <span key={tech} className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-default">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="h-[1px] bg-gray-100 dark:bg-gray-800" />

                        <div>
                            <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Pitch Assets</h4>
                            {idea.pitchDeckUrl ? (
                                <a
                                    href={`${apiBaseUrl}${idea.pitchDeckUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-600 hover:text-white transition-all duration-300"
                                >
                                    <span className="font-bold text-xs uppercase tracking-widest group-hover:text-white">View PDF Deck</span>
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        <ArrowLeft className="w-4 h-4 rotate-180" />
                                    </div>
                                </a>
                            ) : (
                                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 text-center border-dashed border-2 border-gray-100 dark:border-gray-700">
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest italic">No deck uploaded</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin Feedback */}
                    {idea.adminComment && (
                        <div className={cn(
                            "rounded-[2rem] border-2 p-8 transition-all shadow-sm",
                            idea.status === 'approved' ? 'bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-800 text-green-900 dark:text-green-300' :
                                idea.status === 'rejected' ? 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-800 text-red-900 dark:text-red-300' :
                                    'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300'
                        )}>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-60">Executive Feedback</h3>
                            <div className="p-6 bg-white dark:bg-black/20 rounded-2xl border border-current/10 shadow-sm">
                                <p className="text-sm leading-relaxed font-bold italic">"{idea.adminComment}"</p>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
