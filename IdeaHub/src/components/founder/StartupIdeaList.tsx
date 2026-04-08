'use client';

import { useState } from 'react';
import { useIdeas } from '@/hooks/useIdeas';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { PlusCircle, Search, Edit2, Trash2, Eye, ArrowLeft, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import type { IProjectIdea } from '@/types';
import { useChatNotifications } from '@/hooks/useChatNotifications';
import { cn } from '@/utils/cn';

export const StartupIdeaList = () => {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<string>('');
    const [search, setSearch] = useState('');
    const { unreadCounts } = useChatNotifications();

    const queryParams = {
        page,
        limit: 10,
        ...(status && { status }),
        ...(search && { search }),
    };

    const { ideas: response, isLoading, deleteIdea } = useIdeas(queryParams);

    const ideas = (response as any)?.data || (Array.isArray(response) ? response : []);
    const pagination = (response as any)?.pagination || {};
    const totalPages = pagination.pages || 1;

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value);
        setPage(1);
    };

    const handleDelete = (id: string) => {
        if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
            deleteIdea(id);
        }
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Link href="/founder">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Startup Ideas</h1>
                </div>
                <Link href="/founder/submit">
                    <Button>
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Submit New Idea
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="Search ideas..."
                        className="pl-10"
                        value={search}
                        onChange={handleSearch}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select
                        options={[
                            { value: '', label: 'All Status' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'approved', label: 'Approved' },
                            { value: 'rejected', label: 'Rejected' },
                        ]}
                        value={status}
                        onChange={handleStatusChange}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted On</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center">
                                        <div className="flex justify-center"><Loader size="lg" /></div>
                                    </td>
                                </tr>
                            ) : ideas.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                        No ideas found.
                                    </td>
                                </tr>
                            ) : (
                                ideas.map((idea: IProjectIdea) => (
                                    <tr key={idea._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/founder/ideas/${idea._id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium cursor-pointer">
                                                    {idea.title}
                                                </Link>
                                                {unreadCounts[idea._id] > 0 && (
                                                    <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none flex items-center justify-center min-w-[1.25rem]">
                                                        {unreadCounts[idea._id]}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(idea.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={cn(
                                                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                                                idea.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                idea.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            )}>
                                                {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Link href={`/founder/ideas/${idea._id}`}>
                                                    <Button size="sm" variant="ghost" title="View Details">
                                                        <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                    </Button>
                                                </Link>

                                            {(idea.status === 'pending' || idea.status === 'rejected') && (
                                                <>
                                                    <Link href={`/founder/ideas/${idea._id}/edit`}>
                                                        <Button size="sm" variant="ghost" title="Edit Idea">
                                                            <Edit2 className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        title="Delete Idea"
                                                        onClick={() => handleDelete(idea._id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                    </Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
};
