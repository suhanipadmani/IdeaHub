'use client';

import { useMemo } from 'react';
import { Sparkles, RefreshCcw, ShieldAlert, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/utils/cn';

const getScoreLabel = (score: number, mode: 'founder' | 'admin') => {
    if (mode === 'admin') {
        if (score >= 85) return "High Potential";
        if (score >= 70) return "Promising";
        if (score >= 50) return "Average";
        return "High Risk";
    }
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Improvement";
    return "Weak";
};

const EmptyAIState = ({ onAnalyze, isLoading, mode }: { onAnalyze: () => void, isLoading: boolean, mode: 'founder' | 'admin' }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-indigo-100 dark:border-indigo-900/30 p-8 text-center space-y-4 mb-8 focus-visible:outline-none focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <div className="mx-auto w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {mode === 'admin' ? 'AI Evaluation' : 'AI Analysis Not Generated'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium">
                {mode === 'admin'
                    ? 'Generate an internal AI-powered evaluation to assist in your decision-making process.'
                    : 'Get instant feedback on your startup idea including market validation and improvement suggestions.'}
            </p>
        </div>
        <Button
            onClick={onAnalyze}
            isLoading={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md px-8 rounded-xl font-bold"
        >
            <Sparkles className="w-4 h-4 mr-2" />
            {mode === 'admin' ? 'Run AI Evaluation' : 'Analyze with AI'}
        </Button>
    </div>
);

interface AIAnalysisSectionProps {
    data?: any;
    isAnalyzing: boolean;
    onAnalyze: () => void;
    mode?: 'founder' | 'admin';
    showActions?: boolean;
}

export const AIAnalysisSection = ({
    data,
    isAnalyzing,
    onAnalyze,
    mode = 'founder',
    showActions = true
}: AIAnalysisSectionProps) => {
    const score = data?.score || 0;
    const scoreLabel = useMemo(() => getScoreLabel(score, mode), [score, mode]);

    const analyzedDate = useMemo(() =>
        data?.analyzedAt
            ? new Date(data.analyzedAt).toLocaleDateString()
            : null
        , [data?.analyzedAt]);

    const isAnalyzed = useMemo(() => {
        if (!data || typeof data !== 'object') return false;
        return !!(data.analyzedAt || data.ideaQuality || data.evaluation || data.recommendations || (data.score > 0));
    }, [data]);

    if (!isAnalyzed && !isAnalyzing) {
        if (!showActions) return null;
        return <EmptyAIState onAnalyze={onAnalyze} isLoading={isAnalyzing} mode={mode} />;
    }

    return (
        <div className={cn(
            "rounded-3xl border shadow-sm overflow-hidden mb-8 transition-all duration-500",
            mode === 'admin'
                ? "bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900/40 dark:to-indigo-900/40 border-indigo-100 dark:border-indigo-800/50"
                : "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800/50"
        )}>
            <div className="border-b border-indigo-100 dark:border-indigo-800/50 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-black/20">
                <h3 className="text-lg font-black text-indigo-900 dark:text-indigo-100 flex items-center gap-3 uppercase tracking-tight">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    {mode === 'admin' ? 'Executive AI Evaluation' : 'AI Startup Analysis'}
                </h3>
                {showActions && (
                    <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        {analyzedDate && (
                            <div className="text-xs font-black whitespace-nowrap text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 uppercase tracking-widest">
                                Updated {analyzedDate}
                            </div>
                        )}
                        <Button
                            onClick={onAnalyze}
                            isLoading={isAnalyzing}
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4"
                        >
                            <RefreshCcw className="w-3 h-3 mr-1.5" />
                            Re-run
                        </Button>
                    </div>
                )}
            </div>

            <div className="p-6 sm:p-8 space-y-8">
                {/* Score Section */}
                <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-indigo-100/50 dark:border-indigo-800/30 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1">
                            {mode === 'admin' ? 'Investment Confidence' : 'AI Readiness Score'}
                        </p>
                        <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{score}</p>
                    </div>
                    <div className="text-right">
                        <span className={cn(
                            "text-xs sm:text-sm font-black px-5 py-2.5 rounded-full shadow-sm border uppercase tracking-widest",
                            score >= 80 ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50' :
                                score >= 60 ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50' :
                                    score >= 40 ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/50' :
                                        'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50'
                        )}>
                            {scoreLabel}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="space-y-4">
                        <h4 className="text-xs font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                            {mode === 'admin' ? 'Strategic Evaluation' : 'Idea Quality'}
                        </h4>
                        <div className="bg-white/40 dark:bg-black/10 rounded-2xl p-5 leading-relaxed text-gray-700 dark:text-gray-300 text-base border border-white/20 dark:border-white/5 prose dark:prose-invert max-w-none shadow-inner">
                            <ReactMarkdown>
                                {String((mode === 'admin' ? data?.evaluation : data?.ideaQuality) || "Analysis content unavailable.")}
                            </ReactMarkdown>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h4 className={cn(
                            "text-xs font-black uppercase tracking-widest flex items-center gap-2",
                            mode === 'admin' ? "text-purple-800 dark:text-purple-300" : "text-emerald-800 dark:text-emerald-300"
                        )}>
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(var(--color),0.5)]",
                                mode === 'admin' ? "bg-purple-500" : "bg-emerald-500"
                            )} />
                            {mode === 'admin' ? 'Executive Recommendations' : 'Market Validation'}
                        </h4>
                        <div className="bg-white/40 dark:bg-black/10 rounded-2xl p-5 leading-relaxed text-gray-700 dark:text-gray-300 text-base border border-white/20 dark:border-white/5 prose dark:prose-invert max-w-none shadow-inner">
                            <ReactMarkdown>
                                {String((mode === 'admin' ? data?.recommendations : data?.marketValidationSummary) || "Validation summary unavailable.")}
                            </ReactMarkdown>
                        </div>
                    </section>
                </div>

                {/* Bullet Points Section */}
                {(mode === 'admin' ? (data?.risks?.length > 0 || data?.opportunities?.length > 0) : data?.autoImprovementSuggestions?.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mode === 'admin' ? (
                            <>
                                <HighlightList
                                    title="Potential Risks"
                                    items={data.risks}
                                    icon={<ShieldAlert className="w-4 h-4 text-red-500" />}
                                    color="red"
                                />
                                <HighlightList
                                    title="Strategic Opportunities"
                                    items={data.opportunities}
                                    icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                                    color="emerald"
                                />
                            </>
                        ) : (
                            <div className="md:col-span-2">
                                <HighlightList
                                    title="Improvement roadmap"
                                    items={data.autoImprovementSuggestions}
                                    icon={<Zap className="w-4 h-4 text-amber-500" />}
                                    color="amber"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const HighlightList = ({ title, items, icon, color }: { title: string, items: string[], icon: React.ReactNode, color: string }) => (
    <section className={cn(
        "rounded-2xl p-6 border transition-all hover:shadow-md",
        color === 'red' ? 'bg-red-50/30 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' :
            color === 'emerald' ? 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' :
                color === 'amber' ? 'bg-amber-50/30 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30' :
                    'bg-indigo-50/30 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30'
    )}>
        <h4 className={cn(
            "text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2",
            color === 'red' ? 'text-red-700 dark:text-red-400' :
                color === 'emerald' ? 'text-emerald-700 dark:text-emerald-400' :
                    color === 'amber' ? 'text-amber-700 dark:text-amber-400' :
                        'text-indigo-700 dark:text-indigo-400'
        )}>
            {icon}
            {title}
        </h4>
        <ul className="space-y-3">
            {items.map((item: string, idx: number) => (
                <li key={idx} className="flex gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug group">
                    <div className={cn(
                        "mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-125",
                        color === 'red' ? 'bg-red-400' :
                            color === 'emerald' ? 'bg-emerald-400' :
                                color === 'amber' ? 'bg-amber-400' :
                                    'bg-indigo-400'
                    )} />
                    <ReactMarkdown>{item}</ReactMarkdown>
                </li>
            ))}
        </ul>
    </section>
);
