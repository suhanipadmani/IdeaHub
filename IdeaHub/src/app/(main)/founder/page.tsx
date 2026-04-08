'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { PlusCircle, FileText, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { useIdeaStats } from '@/hooks/useIdeaStats';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useSocket } from '@/context/SocketContext';
import { cn } from '@/utils/cn';

export default function FounderDashboard() {
    const queryClient = useQueryClient();
    const { socket } = useSocket();
    const { stats, isLoading } = useIdeaStats();

    useEffect(() => {
        if (!socket) return;

        const handleUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['idea-stats'] });
            queryClient.invalidateQueries({ queryKey: ['ideas'] });
        };

        socket.on('idea:created', handleUpdate);
        socket.on('project:updated', handleUpdate);

        return () => {
            socket.off('idea:created', handleUpdate);
            socket.off('project:updated', handleUpdate);
        };
    }, [socket, queryClient]);

    if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader size="lg" /></div>;

    const statCards = [
        { label: 'Total Ideas', value: stats.total || 0, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', borderColor: 'border-indigo-200 dark:border-indigo-800' },
        { label: 'Pending', value: stats.pending || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', borderColor: 'border-yellow-200 dark:border-yellow-800' },
        { label: 'Approved', value: stats.approved || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-800' },
        { label: 'Rejected', value: stats.rejected || 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800' },
    ];

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Founder Dashboard</h1>
                <Link href="/founder/submit">
                    <Button>
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Submit New Idea
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className={cn(
                        "bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md flex items-center justify-between group",
                        stat.borderColor
                    )}>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-full ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                    <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Idea Status Distribution</h2>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="w-full h-[300px] min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart
                                    data={[
                                        { name: 'Pending', value: stats.pending, fill: '#CA8A04' },
                                        { name: 'Approved', value: stats.approved, fill: '#16A34A' },
                                        { name: 'Rejected', value: stats.rejected, fill: '#DC2626' },
                                    ]}
                                    margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#88909eff', fontSize: 12 }} />
                                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#88909eff', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#f1f3f7ff', color: '#303132ff' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50} >
                                        {
                                            [
                                                { name: 'Pending', value: stats.pending, fill: '#CA8A04' },
                                                { name: 'Approved', value: stats.approved, fill: '#16A34A' },
                                                { name: 'Rejected', value: stats.rejected, fill: '#DC2626' },
                                            ].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-center transition-colors">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl w-fit mb-6">
                        <PlusCircle className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Launch your next disruptor</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        Have a groundbreaking idea? Submit it today and get validation from our team of experts. Every great startup starts with a single pitch.
                    </p>
                    <Link href="/founder/submit">
                        <Button size="lg" className="w-full sm:w-auto px-10">
                            Submit Idea <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Actions / Recent Activity */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Startup Ideas</h2>
                    <Link href="/founder/ideas">
                        <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                            View All Ideas <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                    Manage and track the status of your submitted startup ideas. Click "View All Ideas" to see the full list of your innovations.
                </p>
            </div>
        </div>
    );
}
