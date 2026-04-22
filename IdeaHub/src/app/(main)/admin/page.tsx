'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader } from '@/components/ui/Loader';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, FileText, Clock, CheckCircle, ArrowRight, BrainCircuit, Target, PieChartIcon } from 'lucide-react';
import api from '@/services/api-client';
import ProjectList from '@/components/admin/ProjectList';
import { useSocket } from '@/context/SocketContext';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardPage() {
    const queryClient = useQueryClient();
    const { socket } = useSocket();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!socket) return;

        const handleIdeaCreated = () => {
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        };

        socket.on('idea:created', handleIdeaCreated);

        return () => {
            socket.off('idea:created', handleIdeaCreated);
        };
    }, [socket, queryClient]);

    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: async () => {
            const res = await api.get('/admin/analytics/stats');
            return res.data;
        }
    });

    const { data: growth, isLoading: isLoadingGrowth } = useQuery({
        queryKey: ['admin', 'growth'],
        queryFn: async () => {
            const res = await api.get('/admin/analytics/growth');
            return res.data;
        }
    });

    const { data: trends, isLoading: isLoadingTrends } = useQuery({
        queryKey: ['admin', 'trends'],
        queryFn: async () => {
            const res = await api.get('/admin/analytics/trends');
            return res.data;
        }
    });

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800' },
        { label: 'Total Ideas', value: stats?.totalIdeas, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', borderColor: 'border-purple-200 dark:border-purple-800' },
        { label: 'Pending Reviews', value: stats?.pendingIdeas, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', borderColor: 'border-yellow-200 dark:border-yellow-800' },
        { label: 'Approved Ideas', value: stats?.approvedIdeas, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-800' },
    ];

    const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#3B82F6'];
    const APPROVAL_COLORS = ['#10B981', '#EF4444', '#F59E0B']; // Approved, Rejected, Pending

    if (!mounted) return null;

    return (
        <div className="space-y-8 pb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">System Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className={cn(
                        "bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md min-h-[140px] flex flex-col justify-between group",
                        stat.borderColor
                    )}>
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <div className={cn("p-2.5 rounded-xl transition-colors", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                        </div>
                        {isLoadingStats ? (
                            <div className="mt-4 h-10 w-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"></div>
                        ) : (
                            <p className={cn("text-4xl font-black mt-2 tracking-tighter", stat.color)}>{stat.value || 0}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Advanced Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors lg:col-span-2">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Data Trajectory
                            <span className="text-[10px] font-black text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full uppercase tracking-widest">Platform Pulse</span>
                        </h2>
                    </div>
                    <div className="p-6 h-[400px] flex flex-col">
                        {isLoadingGrowth ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader size="md" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={Array.isArray(growth) ? growth : []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorIdeas" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-800" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                                    <Area type="monotone" dataKey="ideas" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#colorIdeas)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Approval Rates */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-indigo-500" />
                            Approval Rates
                        </h2>
                    </div>
                    <div className="p-6 h-[400px] flex flex-col items-center justify-center relative">
                        {isLoadingTrends ? (
                            <Loader size="md" />
                        ) : trends?.approvalRates?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={trends.approvalRates}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {trends.approvalRates.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={APPROVAL_COLORS[index % APPROVAL_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-sm text-gray-500">No data available</p>
                        )}
                    </div>
                </div>

                {/* AI Idea Scoring Leaderboard */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden lg:col-span-2">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5 text-purple-500" />
                            Top Ideas AI Leaderboard
                        </h2>
                    </div>
                    <div className="p-6 h-[400px]">
                        {isLoadingTrends ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader size="md" />
                            </div>
                        ) : trends?.leaderboard?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trends.leaderboard} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-800" />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis dataKey="title" type="category" width={150} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 600 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="aiScore" radius={[0, 8, 8, 0]} barSize={20}>
                                        {trends.leaderboard.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                <p>No top scoring ideas found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Trends */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-pink-500" />
                            Market Focus
                        </h2>
                    </div>
                    <div className="p-6 h-[400px]">
                        {isLoadingTrends ? (
                            <div className="h-full flex items-center justify-center"><Loader size="md" /></div>
                        ) : trends?.categoryTrends?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={trends.categoryTrends}
                                        cx="50%"
                                        cy="45%"
                                        outerRadius={100}
                                        dataKey="value"
                                        label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                                        labelLine={false}
                                        stroke="none"
                                    >
                                        {trends.categoryTrends.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">No category data</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pending Reviews Section */}
            <div className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Pending Reviews</h2>
                    <Link href="/admin/reviews/pending">
                        <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-bold group">
                            View All <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                    </Link>
                </div>
                <ProjectList
                    initialStatus="pending"
                    showFilters={false}
                    limit={5}
                />
            </div>
        </div>
    );
}
