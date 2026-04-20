'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, TrendingUp, Clock, Star, ArrowRight, Eye, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Startup {
    _id: string;
    title: string;
    tagline: string;
    targetMarket: string;
    aiAnalysis: { score: number };
    views: number;
    publishedAt: string;
    slug: string;
    founderId: { name: string };
}

export default function ExplorePage() {
    const [startups, setStartups] = useState<Startup[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('latest');

    const fetchStartups = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ search, category, sort });
            const res = await fetch(`/api/public/ideas?${params}`);
            const data = await res.json();
            setStartups(data);
        } catch (error) {
            console.error('Failed to fetch startups:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStartups();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, category, sort]);

    const categories = ['All', 'SaaS', 'Fintech', 'Healthtech', 'AI/ML', 'E-commerce', 'Web3', 'EdTech'];

    return (
        <div className="py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Header */}
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Discovery Platform
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight"
                    >
                        Explore the next <br />
                        <span className="text-indigo-600 dark:text-indigo-400">Startup ideas</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                    >
                        Join the community of founders and builders discovering verified startup concepts validated by AI and experts.
                    </motion.p>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col lg:flex-row gap-6 mb-12 items-center justify-between">
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Search by title, tagline or problem..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-x-auto scrollbar-hide max-w-full">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${category === cat ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <select 
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="px-4 py-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        >
                            <option value="latest">Latest</option>
                            <option value="trending">Trending</option>
                            <option value="top-rated">Top Rated</option>
                        </select>
                    </div>
                </div>

                {/* Results Grid */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-[380px] bg-gray-100 dark:bg-gray-900 animate-pulse rounded-3xl border border-gray-200 dark:border-gray-800"></div>
                            ))}
                        </motion.div>
                    ) : startups.length > 0 ? (
                        <motion.div 
                            key="grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {startups.map((startup, idx) => (
                                <Link href={`/startup/${startup.slug}`} key={startup._id}>
                                    <motion.div 
                                        layoutId={startup._id}
                                        whileHover={{ y: -8 }}
                                        className="group h-full bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 transition-all hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:shadow-2xl hover:shadow-indigo-100 dark:hover:shadow-none flex flex-col"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                                {startup.targetMarket}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                                                <Star className="w-4 h-4 fill-amber-500" />
                                                <span>{startup.aiAnalysis.score}</span>
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {startup.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">
                                            {startup.tagline || 'No tagline provided for this startup idea.'}
                                        </p>

                                        <div className="pt-6 border-t border-gray-50 dark:border-gray-900 flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-500 text-xs">
                                                    <Eye className="w-4 h-4" />
                                                    <span>{startup.views}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-500 text-xs">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{new Date(startup.publishedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-20 text-center"
                        >
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No startups found</h3>
                            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters to find what you're looking for.</p>
                            <button 
                                onClick={() => { setSearch(''); setCategory('All'); }}
                                className="mt-6 text-indigo-600 font-medium hover:underline"
                            >
                                Clear all filters
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
