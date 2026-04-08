'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { User, Mail, Calendar, PenTool, Lock, Trash2, AlertTriangle, Shield, ArrowRight } from 'lucide-react';
import { Loader } from '@/components/ui/Loader';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';

export default function ProfilePage() {
    const { user, isLoadingUser } = useAuth();
    const { deleteAccount, isDeletingAccount } = useUser();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeleteAccount = () => {
        deleteAccount();
    };

    if (isLoadingUser) {
        return <div className="h-96 flex items-center justify-center"><Loader size="lg" /></div>;
    }

    if (!user) {
        return (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Failed to synchronize profile data</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-20 px-4">
            <div className="mb-8 mt-2">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Account Settings</h1>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Manage your identity and security</p>
            </div>

            <div className="space-y-8">
                {/* Profile Overview Card */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
                    <div className="p-8">
                        <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                            <div className="relative group">
                                <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center border-2 border-indigo-100 dark:border-indigo-800 transition-transform group-hover:scale-105">
                                    <User className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                                    <Shield className={cn(
                                        "w-4 h-4",
                                        user.role === 'admin' ? "text-purple-600" : "text-indigo-600"
                                    )} />
                                </div>
                            </div>
                            <div className="text-center sm:text-left space-y-2">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{user.name}</h2>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                    <span className={cn(
                                        "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                        user.role === 'admin'
                                            ? "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800"
                                            : "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800"
                                    )}>
                                        {user.role} Authorization
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 dark:border-gray-800 pt-10">
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Email Address
                                </h4>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{user.email}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> Registry Date
                                </h4>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50/50 dark:bg-gray-800/30 px-8 py-6 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/profile/edit" className="flex-1">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest h-12 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all group">
                                    <PenTool className="w-4 h-4 mr-2" />
                                    Edit Profile
                                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </Button>
                            </Link>
                            <Link href="/profile/change-password">
                                <Button variant="outline" className="w-full border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold h-12 rounded-2xl">
                                    <Lock className="w-4 h-4 mr-2" />
                                    Change Password
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50/50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-2">
                            <h3 className="text-red-600 dark:text-red-400 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Delete account
                            </h3>
                            <p className="text-sm text-red-900/80 dark:text-red-300/80 font-medium leading-relaxed max-w-md">
                                Permanently delete your account and all data. This action is irreversible and cannot be undone.
                            </p>
                    </div>
                    <Button
                        variant="danger"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest whitespace-nowrap h-12 px-8 rounded-2xl shadow-lg shadow-red-200 dark:shadow-none"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                    </Button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Account"
            >
                <div className="space-y-6 pt-2">
                    <div className="flex items-center space-x-4 text-red-600 bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl border border-red-100 dark:border-red-900/30">
                        <AlertTriangle className="w-8 h-8 flex-shrink-0" />
                        <p className="text-sm font-bold uppercase tracking-tight leading-tight">
                            Warning: This operation will permanently erase all data clusters associated with your identity.
                        </p>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                        Are you certain you wish to proceed? All submitted ideas, documents, and historical records will be strictly purged from our encrypted storage arrays.
                    </p>

                    <div className="flex items-center gap-3 pt-4">
                        <Button
                            variant="ghost"
                            className="flex-1 font-bold h-12 rounded-2xl"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isDeletingAccount}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            className="flex-[2] bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest h-12 rounded-2xl shadow-lg shadow-red-200 dark:shadow-none"
                            onClick={handleDeleteAccount}
                            isLoading={isDeletingAccount}
                        >
                            Delete Account
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
