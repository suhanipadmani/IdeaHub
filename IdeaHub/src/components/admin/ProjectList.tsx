'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ideaService } from '@/services/idea.api';
import { Loader } from '@/components/ui/Loader';
import { Eye, Search, Calendar, User, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import type { IProjectIdea } from '@/types';
import { useSocket } from '@/context/SocketContext';
import { useChatNotifications } from '@/hooks/useChatNotifications';
import { cn } from '@/utils/cn';

interface ProjectListProps {
    initialStatus?: string;
    showFilters?: boolean;
    showDateFilter?: boolean;
    title?: string;
    limit?: number;
}

const ProjectList = ({ initialStatus = '', showFilters = true, showDateFilter = false, limit: initialLimit = 10 }: ProjectListProps) => {
    const queryClient = useQueryClient();
    const { socket } = useSocket();
    const { unreadCounts } = useChatNotifications();

    useEffect(() => {
        if (!socket) return;

        const handleIdeaCreated = () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
        };

        socket.on('idea:created', handleIdeaCreated);

        return () => {
            socket.off('idea:created', handleIdeaCreated);
        };
    }, [socket, queryClient]);

    // Filters & Pagination
    const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
    const [techFilter, setTechFilter] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [limit] = useState<number>(initialLimit);

    const { data: paginationData, isLoading: isLoadingProjects } = useQuery({
        queryKey: ['admin', 'projects', statusFilter, techFilter, search, startDate, endDate, page, limit],
        queryFn: () => ideaService.getAdminIdeas({
            status: statusFilter || undefined,
            tech: techFilter || undefined,
            search: search || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            page,
            limit
        }),
    });

    const projectList = paginationData?.docs || [];
    const totalPages = paginationData?.totalPages || 1;

    // Filters & Pagination
    const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setPage(1);
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
        setPage(1);
    };

    const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
        setPage(1);
    };

    const clearFilters = () => {
        setStatusFilter(initialStatus);
        setTechFilter('');
        setSearch('');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <div className="flex flex-col gap-6">
            {showFilters && (
                <div className="p-2 transition-colors">
                    <div className="flex flex-wrap items-end justify-end gap-3">
                        <select
                            value={statusFilter}
                            onChange={handleStatusChange}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm py-2 px-4 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-gray-300 transition-all font-medium"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Title..."
                                value={search}
                                onChange={handleSearchChange}
                                className="pl-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-710 rounded-xl text-sm py-2 px-4 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-gray-300 transition-all font-medium w-full md:w-64"
                            />
                        </div>

                        <Button variant="ghost" size="sm" onClick={clearFilters} className="bg-white text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold ml-auto md:ml-0">
                            Reset
                        </Button>
                    </div>
                </div>
            )}

            {showDateFilter && (
                <div className="p-4 transition-colors">
                    <div className="flex flex-wrap items-end justify-end gap-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={handleStartDateChange}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm py-1.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-gray-300 transition-all font-medium"
                            />
                            <span className="text-gray-400 text-xs font-bold uppercase">To</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={handleEndDateChange}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm py-1.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-gray-300 transition-all font-medium"
                            />
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="bg-white text-gray-400 hover:text-indigo-500 font-bold">
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col transition-colors">
            

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Project</th>
                            <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Founder</th>
                            <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Status</th>
                            <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Date</th>
                            <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                        {isLoadingProjects ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex justify-center"><Loader size="md" /></div>
                                </td>
                            </tr>
                        ) : projectList.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 italic font-medium">No projects found matching filters</td>
                            </tr>
                        ) : (
                            projectList.map((idea: IProjectIdea) => (
                                <tr key={idea._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link href={`/admin/ideas/${idea._id}`} className="group/title">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 dark:text-white group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors">
                                                        {idea.title}
                                                    </span>
                                                    {unreadCounts[idea._id] > 0 && (
                                                        <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none flex items-center justify-center min-w-[1.25rem]">
                                                            {unreadCounts[idea._id]}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter truncate max-w-[200px]">{idea.techStack?.join(' • ')}</span>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] text-indigo-600 dark:text-indigo-400">
                                                <User className="w-3 h-3" />
                                            </div>
                                            {(idea.founderId && typeof idea.founderId === 'object' && 'name' in idea.founderId)
                                                ? (idea.founderId as any).name
                                                : 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={cn(
                                            'px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full',
                                            idea.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                            idea.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        )}>
                                            {idea.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(idea.createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <Link href={`/admin/ideas/${idea._id}`}>
                                            <Button size="sm" variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-bold">
                                                <Eye className="w-4 h-4 mr-1.5" /> Details
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!isLoadingProjects && totalPages > 1 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                
            )}
        </div>
    </div>
    );
};

export default ProjectList;
