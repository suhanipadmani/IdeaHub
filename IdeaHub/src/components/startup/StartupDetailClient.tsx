"use client";

import Link from 'next/link';
import { 
    ArrowLeft, 
    Share2, 
    Twitter, 
    Linkedin, 
    Target, 
    Zap,  
    Star,
    ArrowUpRight,
    Search,
    Layers,
    Award,
    TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/utils/cn';

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const glassEffect = "bg-white/70 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]";

const SafeHTML = ({ content, className }: { content: string, className?: string }) => {
    return (
        <div 
            className={cn(
                "prose prose-indigo dark:prose-invert max-w-none whitespace-pre-wrap break-words leading-relaxed",
                !className?.includes('text-') && "text-gray-800 dark:text-gray-100",
                className
            )}
            dangerouslySetInnerHTML={{ __html: content }} 
        />
    );
};

const Markdown = ({ content, className }: { content: string, className?: string }) => {
    return (
        <div className={cn(
            "prose prose-indigo dark:prose-invert max-w-none whitespace-pre-wrap break-words leading-relaxed",
            !className?.includes('text-') && "text-gray-800 dark:text-gray-100",
            className
        )}>
            <ReactMarkdown>
                {content}
            </ReactMarkdown>
        </div>
    );
};

const Label = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
    <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
            {children}
        </span>
    </div>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

export default function StartupDetailClient({ idea }: { idea: any }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#030712] text-gray-900 dark:text-gray-100 selection:bg-indigo-500/30 font-sans">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <motion.div 
                initial="initial"
                animate="animate"
                variants={staggerContainer}
                className="relative z-10"
            >
                {/* Header Navigation */}
                <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
                    <motion.div variants={fadeInUp}>
                        <Link 
                            href="/explore" 
                            className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-500 transition-all"
                        >
                            <div className="p-2 rounded-full border border-gray-200 dark:border-gray-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30 transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            Back to Explore
                        </Link>
                    </motion.div>
                    
                    <motion.div variants={fadeInUp} className="flex items-center gap-4">
                        <button className="p-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all">
                            <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold transition-all shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] active:scale-95">
                            Connect with Founder <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                </div>

                {/* Hero Section */}
                <header className="max-w-7xl mx-auto px-6 pt-12 pb-20">
                    <div className="flex flex-col lg:flex-row gap-12 items-start justify-between">
                        <div className="flex-1 space-y-8">
                            <motion.div variants={fadeInUp} className="flex items-center gap-3">
                                <span className="px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                    {idea.targetMarket}
                                </span>
                                <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                                <span className="text-gray-500 dark:text-gray-500 text-xs font-bold">
                                    {new Date(idea.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                            </motion.div>

                            <motion.h1 
                                variants={fadeInUp}
                                className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight"
                            >
                                {idea.title}
                            </motion.h1>

                            <motion.p 
                                variants={fadeInUp}
                                className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-3xl"
                            >
                                {idea.tagline || 'Revolutionizing the industry with innovative solutions and AI-driven insights.'}
                            </motion.p>
                        </div>

                        {/* AI Readiness Sidebar Card */}
                        <motion.div 
                            variants={fadeInUp}
                            className={`lg:w-80 w-full p-8 rounded-[40px] ${glassEffect} relative group`}
                        >
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-600/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <Label icon={Award}>AI Readiness Score</Label>
                            
                            <div className="flex items-end gap-3 mt-4 mb-6">
                                <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-500 leading-none">
                                    {idea.aiAnalysis?.score || 0}
                                </span>
                                <span className="text-indigo-300 dark:text-indigo-900 font-black text-2xl mb-1">/100</span>
                            </div>

                            <div className="flex gap-1.5 mb-6">
                                {[1, 2, 3, 4, 5].map(i => {
                                    const rating = (idea.aiAnalysis?.score || 0) / 20;
                                    const fill = i <= Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 
                                                 i === Math.ceil(rating) && rating % 1 !== 0 ? 'text-amber-400 fill-amber-400/50' : 
                                                 'text-gray-200 dark:text-gray-800';
                                    return <Star key={i} className={`w-5 h-5 ${fill}`} />;
                                })}
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-500 font-medium leading-relaxed">
                                Our proprietary AI engine has analyzed this startup across 12 distinct viability vectors.
                            </p>
                        </motion.div>
                    </div>
                </header>

                {/* Main Content Sections */}
                <main className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Primary Content (Left/Center) */}
                        <div className="lg:col-span-8 space-y-24">
                            {/* Problem Section */}
                            <motion.section variants={fadeInUp}>
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 shadow-sm shadow-red-100 dark:shadow-none">
                                        <Target className="w-7 h-7" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">The Problem</h2>
                                </div>
                                <div className={`p-8 md:p-12 rounded-[3rem] ${glassEffect} relative overflow-hidden group border-2 border-transparent hover:border-red-500/10 transition-all cursor-default`}>
                                    <div className="absolute top-0 left-0 w-2 bg-red-600/40 h-full group-hover:w-3 transition-all duration-500"></div>
                                    <div className="relative z-10">
                                        <SafeHTML 
                                            content={idea.problemStatement} 
                                            className="text-xl md:text-2xl font-medium" 
                                        />
                                    </div>
                                </div>
                            </motion.section>

                            {/* Solution Section */}
                            <motion.section variants={fadeInUp}>
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20 shadow-sm shadow-green-100 dark:shadow-none">
                                        <Zap className="w-7 h-7" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Our Solution</h2>
                                </div>
                                <div className={`p-8 md:p-12 rounded-[3rem] ${glassEffect} relative overflow-hidden group border-2 border-transparent hover:border-green-500/10 transition-all cursor-default`}>
                                    <div className="absolute top-0 left-0 w-2 bg-green-600/40 h-full group-hover:w-3 transition-all duration-500"></div>
                                    <div className="relative z-10">
                                        <SafeHTML 
                                            content={idea.solution} 
                                            className="text-xl md:text-2xl font-medium" 
                                        />
                                    </div>
                                </div>
                            </motion.section>
                        </div>

                        {/* Sidebar Sections */}
                        <aside className="lg:col-span-4 space-y-12">
                            {/* Verified Insights Card */}
                            <motion.div 
                                variants={fadeInUp}
                                className="p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-50/80 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white border border-indigo-100/50 dark:border-white/10 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group"
                            >
                                <div className="absolute top-12 bottom-12 left-0 w-1 bg-indigo-500/20 dark:bg-indigo-500/40 rounded-full"></div>
                                
                                <h3 className="text-2xl font-black mb-10 flex items-center gap-3">
                                     <SparklesIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                     Verified Insights
                                </h3>
                                
                                <div className="space-y-10 relative z-10">
                                    <div className="space-y-4">
                                        <Label icon={Search}>Market Viability</Label>
                                        <Markdown 
                                            content={idea.aiAnalysis?.marketValidationSummary || 'Market data is being synthesized by our AI engine.'} 
                                            className="text-base leading-relaxed font-medium"
                                        />
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <Label icon={TrendingUp}>Growth Score</Label>
                                            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{idea.aiAnalysis?.score || 0}%</span>
                                        </div>
                                        <div className="h-4 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 p-1">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${idea.aiAnalysis?.score}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                                            ></motion.div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Tech Stack */}
                            <motion.div variants={fadeInUp} className="space-y-8">
                                <Label icon={Layers}>BUILT WITH</Label>
                                <div className="flex flex-wrap gap-3">
                                    {idea.techStack && idea.techStack.length > 0 ? idea.techStack.map((tech: string) => (
                                        <div 
                                            key={tech} 
                                            className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all cursor-default shadow-sm dark:shadow-none"
                                        >
                                            {tech}
                                        </div>
                                    )) : (
                                        <div className="text-gray-400 dark:text-gray-600 italic text-sm py-4 border-2 border-dashed border-gray-100 dark:border-gray-900 rounded-3xl w-full text-center">
                                            Proprietary technology stack
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Analytics & Social */}
                            <motion.div variants={fadeInUp} className="pt-12 space-y-10 border-t border-gray-200 dark:border-gray-900">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-[2rem] bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-white/5 shadow-sm">
                                        <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{idea.views}</p>
                                        <Label>VIEWS</Label>
                                    </div>
                                    <div className="p-6 rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">Active</p>
                                        </div>
                                        <Label>FUNDING STATUS</Label>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4">
                                    <button className="flex-1 p-4 flex items-center justify-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 hover:border-indigo-400 text-gray-600 dark:text-gray-400 hover:text-indigo-500 rounded-2xl transition-all shadow-sm group">
                                        <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Twitter</span>
                                    </button>
                                    <button className="flex-1 p-4 flex items-center justify-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 hover:border-blue-400 text-gray-600 dark:text-gray-400 hover:text-blue-500 rounded-2xl transition-all shadow-sm group">
                                        <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">LinkedIn</span>
                                    </button>
                                </div>
                            </motion.div>
                        </aside>
                    </div>
                </main>
            </motion.div>
            
            {/* Footer Pad */}
            <div className="h-32"></div>
        </div>
    );
}
