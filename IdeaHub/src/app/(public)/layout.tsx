'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Rocket, Sparkles, Globe } from 'lucide-react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-200">
            {/* High-End Navigation */}
            <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-gray-950/70 border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
                                    <Rocket className="text-white w-5 h-5" />
                                </div>
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                    IdeaHub
                                </span>
                            </Link>

                            <div className="hidden md:flex items-center gap-6">
                                <Link 
                                    href="/explore" 
                                    className={`text-sm font-medium transition-colors ${pathname === '/explore' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Explore Startups
                                </Link>
                                <span className="text-gray-300 dark:text-gray-700 text-xs text uppercase tracking-widest font-bold px-2 py-0.5 border border-gray-200 dark:border-gray-800 rounded-md">Alpha</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            {user ? (
                                <Link 
                                    href={user.role === 'admin' ? '/admin' : '/founder'} 
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-xl font-medium transition-all shadow-md shadow-indigo-200 dark:shadow-none"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link 
                                    href="/" 
                                    className="px-4 py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-medium rounded-xl transition-all"
                                >
                                    Join Community
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1">
                {children}
            </main>

            {/* Premium Footer */}
            <footer className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2">
                            <Link href="/" className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                    <Rocket className="text-white w-4 h-4" />
                                </div>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">IdeaHub</span>
                            </Link>
                            <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-8">
                                The ultimate launchpad for innovative startups. Discover, validate, and scale your breakthrough ideas with the help of industry experts and AI-driven analysis.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-indigo-600 dark:text-indigo-400">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-indigo-600 dark:text-indigo-400">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Platform</h4>
                            <ul className="space-y-4">
                                <li><Link href="/explore" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Explore</Link></li>
                                <li><Link href="/#features" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</Link></li>
                                <li><Link href="/#security" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Security</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Legal</h4>
                            <ul className="space-y-4">
                                <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                                <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            © {new Date().getFullYear()} IdeaHub. Built for the founders of tomorrow.
                        </p>
                        <div className="flex items-center gap-6">
                            <span className="text-xs text-gray-400">v0.1.0-alpha</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
