'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Zap, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function LandingPage() {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-200">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">I</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">IdeaHub</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href={user.role === 'admin' ? '/admin' : '/founder'} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">Go to Dashboard</Link>
          ) : (
            <div className="flex items-center gap-4">
               <button 
                onClick={() => setAuthMode('login')}
                className={`text-sm font-medium transition-colors ${authMode === 'login' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
               >
                Log in
               </button>
               <button 
                onClick={() => setAuthMode('register')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
               >
                Sign up
               </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero & Auth Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left Side: Hero Content */}
          <div className="text-center lg:text-left mb-12 lg:mb-0">
            {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
              Now in Public Beta
            </div> */}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
              Platform for <br className="hidden md:block" />
              <span className="text-indigo-600 dark:text-indigo-400">startup validation</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Manage roles, evaluate startup ideas, and connect founders with expert reviewers. Built for speed, security, and scale.
            </p>

            <div className="hidden lg:flex flex-col gap-6 max-w-md">
                <div className="flex gap-4 items-start">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Shield className="w-5 h-5"/>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Role-Based Access</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Secure environment for founders & reviewers.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Zap className="w-5 h-5"/>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Instant Validation</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Submit your pitch and get feedback fast.</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Side: Auth Form */}
          <div className="flex justify-center">
            {user ? (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 text-center w-full max-w-md shadow-xl">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Users className="w-8 h-8"/>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">You are currently logged in as {user.name}.</p>
                    <Link href={user.role === 'admin' ? '/admin' : '/founder'} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                        Go to Dashboard <ArrowRight className="w-5 h-5"/>
                    </Link>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex border-b border-gray-100 dark:border-gray-800">
                        <button 
                            onClick={() => setAuthMode('login')}
                            className={`flex-1 py-4 text-sm font-bold transition-all ${authMode === 'login' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-gray-400 hover:text-gray-600 bg-gray-50/30'}`}
                        >
                            Log In
                        </button>
                        <button 
                            onClick={() => setAuthMode('register')}
                            className={`flex-1 py-4 text-sm font-bold transition-all ${authMode === 'register' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-gray-400 hover:text-gray-600 bg-gray-50/30'}`}
                        >
                            Sign Up
                        </button>
                    </div>
                    <div className="p-8">
                        {authMode === 'login' ? <LoginForm /> : <RegisterForm />}
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Features Mobile (Visible only on small screens) */}
        <div className="mt-20 lg:hidden grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Role-Based Access</h3>
            <p className="text-gray-600 dark:text-gray-400">Secure environment with distinct permissions.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Instant Validation</h3>
            <p className="text-gray-600 dark:text-gray-400">Structured feedback fast from industry professionals.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Vibrant Community</h3>
            <p className="text-gray-600 dark:text-gray-400">Join founders launching their next big idea.</p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 text-sm">
        <p>© {new Date().getFullYear()} IdeaHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
