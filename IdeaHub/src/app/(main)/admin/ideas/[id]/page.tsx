'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ideaService } from '@/services/idea.api';
import { useIdea } from '@/hooks/useIdeas';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { showToast } from '@/utils/toast';
import { ArrowLeft, Calendar, FileText, Check, X, User, AlertCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/error';
import Link from 'next/link';
import { AIAnalysisSection } from '@/components/common/AIAnalysisSection';
import { ProjectDocuments } from '@/components/common/ProjectDocuments';
import { useChatNotifications } from '@/hooks/useChatNotifications';

export default function AdminProjectDetailsPage() {
    const params = useParams();
    const id = (params?.id as string) || '';
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: idea, isLoading, error } = useIdea(id);
    const { unreadCounts } = useChatNotifications();
    const unreadCount = unreadCounts[id] || 0;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';

    const [action, setAction] = useState<'approve' | 'reject' | null>(null);
    const [comment, setComment] = useState('');

    const reviewMutation = useMutation({
        mutationFn: async () => {
            if (!idea || !action) return;
            if (action === 'approve') {
                return ideaService.approveIdea(idea._id, comment);
            } else if (action === 'reject') {
                return ideaService.rejectIdea(idea._id, comment);
            }
        },
        onSuccess: () => {
            showToast.success(`Action processed successfully`);
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['idea', id] });
            closeActionModal();
            router.push('/admin');
        },
        onError: (error) => {
            showToast.error(getErrorMessage(error));
        }
    });

    const adminAnalyzeMutation = useMutation({
        mutationFn: async () => {
            return ideaService.analyzeIdeaForAdmin(id);
        },
        onSuccess: (data) => {
            showToast.success('AI Evaluation completed');
            queryClient.invalidateQueries({ queryKey: ['idea', id] });
        },
        onError: (error) => {
            showToast.error(getErrorMessage(error));
        }
    });

    const openActionModal = (actionType: 'approve' | 'reject') => {
        setAction(actionType);
        setComment('');
    };

    const closeActionModal = () => {
        setAction(null);
        setComment('');
    };

    if (isLoading) {
        return <div className="h-96 flex items-center justify-center"><Loader size="lg" /></div>;
    }

    if (error || !idea) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center px-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-6">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Project Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md font-medium">
                    The project you are looking for does not exist or has been removed from the records.
                </p>
                <Link href="/admin">
                    <Button size="lg" className="px-10">
                        <ArrowLeft className="w-5 h-5 mr-3" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-24 px-4">
            <div className="mb-8 mt-2">
                <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-indigo-600 mb-4 flex items-center gap-2 group" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="font-semibold">Return to Previous Page</span>
                </Button>
            </div>

            {/* Header Card */}
            <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 sm:p-10 mb-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                {/* Subtle Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 blur-3xl -ml-24 -mb-24" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-10">
                    <div className="space-y-6 flex-1 min-w-0">
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight break-words">
                                    {idea.title}
                                </h1>
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-sm border",
                                    idea.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' :
                                        idea.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' :
                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                                )}>
                                    {idea.status}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                                    <Calendar className="h-4 w-4 text-indigo-500" />
                                    <span>Submitted {new Date(idea.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl border border-indigo-100/50 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400">
                                    <User className="h-4 w-4" />
                                    <span>Founder: {(idea.founderId && typeof idea.founderId === 'object' && 'name' in idea.founderId)
                                        ? (idea.founderId as any).name
                                        : 'Anonymous'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 shrink-0">
                        {idea.status === 'approved' && (
                            <Link href={`/chat/${id}`}>
                                <Button className="relative bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 uppercase tracking-widest text-xs">
                                    <MessageSquare className="w-5 h-5" /> Chat with Founder
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full border-2 border-white dark:border-gray-900 shadow-sm">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        )}

                        {idea.status === 'pending' && (
                            <div className="flex items-center gap-4">
                                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20 font-black px-8 h-14 rounded-2xl uppercase tracking-widest text-xs" onClick={() => openActionModal('reject')}>
                                    <X className="w-4 h-4 mr-2" /> Reject
                                </Button>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-indigo-500/20 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs" onClick={() => openActionModal('approve')}>
                                    <Check className="w-4 h-4 mr-2" /> Approve
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] gap-8 items-start">
                <div className="space-y-10 min-w-0">
                    {/* Admin AI Analysis Section */}
                    <AIAnalysisSection
                        data={idea.adminAiAnalysis}
                        isAnalyzing={adminAnalyzeMutation.isPending}
                        onAnalyze={() => adminAnalyzeMutation.mutate()}
                        mode="admin"
                    />

                    {/* Project Overview Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                        <div className="border-b border-gray-100 dark:border-gray-800 p-8 sm:px-10 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/10">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-4 uppercase tracking-tight">
                                <div className="p-3 bg-indigo-600/10 dark:bg-indigo-400/10 rounded-2xl">
                                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                Startup Proposal
                            </h3>
                        </div>
                        <div className="p-8 sm:p-12 space-y-20">
                            <section className="relative">
                                <div className="flex items-center gap-4 mb-8">
                                    <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] whitespace-nowrap">Problem Analysis</h4>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent" />
                                </div>
                                <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap break-words">{idea.problemStatement}</p>
                            </section>

                            <section className="relative">
                                <div className="flex items-center gap-4 mb-8">
                                    <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] whitespace-nowrap">Proposed Solution</h4>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />
                                </div>
                                <div
                                    className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-medium prose dark:prose-invert max-w-none break-words prose-p:mt-0"
                                    dangerouslySetInnerHTML={{ __html: idea.solution }}
                                />
                            </section>

                            <section className="relative">
                                <div className="flex items-center gap-4 mb-8">
                                    <h4 className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.2em] whitespace-nowrap">Founder Experience</h4>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-orange-500/20 to-transparent" />
                                </div>
                                <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap break-words">{idea.teamDetails}</p>
                            </section>
                        </div>
                    </div>

                    {/* Project Documents Section */}
                    {idea.documents && idea.documents.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                            <ProjectDocuments documents={idea.documents} />
                        </div>
                    )}
                </div>

                <aside className="space-y-8 lg:sticky lg:top-8">
                    {/* Visual Attributes */}
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-8">
                        <div>
                            <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Target Market</h4>
                            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                <p className="text-sm font-black text-indigo-700 dark:text-indigo-300 tracking-tight">{idea.targetMarket}</p>
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

                    {/* Review Result / Feedback */}
                    {idea.status !== 'pending' ? (
                        <div className={cn(
                            "rounded-3xl border-2 p-8 transition-all flex flex-col gap-4",
                            idea.status === 'approved' ? 'bg-green-100/100 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-800'
                        )}>
                            <h3 className={cn(
                                "text-xs font-black uppercase tracking-widest",
                                idea.status === 'approved' ? 'text-green-600' : 'text-red-600'
                            )}>Executive Decision</h3>
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {idea.status === 'approved' ? 'Successfully Approved' : 'Rejected Submission'}
                                </p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Processed on {new Date(idea.updatedAt!).toLocaleDateString()}</p>
                            </div>
                            {idea.adminComment && (
                                <div className="mt-2 p-4 bg-white/100 dark:bg-black/20 rounded-2xl border border-current opacity-80">
                                    <p className="text-sm font-medium leading-relaxed italic">"{idea.adminComment}"</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        idea.adminComment && (
                            <div className="rounded-3xl border-2 p-8 bg-yellow-100/50 border-yellow-300 dark:bg-yellow-900/10 dark:border-yellow-800 transition-all flex flex-col gap-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-yellow-600">Previous Feedback</h3>
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        Action Required / Revision
                                    </p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Last reviewed on {new Date(idea.updatedAt!).toLocaleDateString()}</p>
                                </div>
                                <div className="mt-2 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-yellow-200 dark:border-yellow-700/50 shadow-inner">
                                    <p className="text-sm font-semibold leading-relaxed text-gray-800 dark:text-gray-200 italic">"{idea.adminComment}"</p>
                                </div>
                            </div>
                        )
                    )}
                </aside>
            </div>

            {/* Action Modal */}
            <Modal
                isOpen={!!action}
                onClose={closeActionModal}
                title={action === 'approve' ? 'Finalize Approval' : 'Confirm Rejection'}
            >
                <div className="space-y-6 pt-2">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            You are about to issue a formal <span className="font-bold text-gray-900 dark:text-white uppercase">{action}</span> for <strong>{idea.title}</strong>. This decision will be immediately visible to the founder.
                        </p>
                    </div>

                    <Textarea
                        label="Executive Feedback"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={6}
                        placeholder="Provide detailed reasoning for this decision..."
                        required
                    />

                    <div className="flex items-center gap-3 pt-4">
                        <Button variant="ghost" className="flex-1 font-bold h-12 rounded-2xl" onClick={closeActionModal} disabled={reviewMutation.isPending}>Cancel</Button>
                        <Button
                            variant={action === 'approve' ? 'primary' : 'danger'}
                            className={cn(
                                "flex-[2] font-black uppercase tracking-widest h-12 rounded-2xl shadow-lg",
                                action === 'approve' ? 'shadow-indigo-500/20 dark:shadow-none' : 'shadow-red-500/20 dark:shadow-none'
                            )}
                            onClick={() => reviewMutation.mutate()}
                            isLoading={reviewMutation.isPending}
                            disabled={!comment.trim()}
                        >
                            Execute {action}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
