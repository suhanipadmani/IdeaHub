'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.api';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Trash2, Edit2, Search, Download, User, Mail, Shield, AlertCircle } from 'lucide-react';
import { showToast } from '@/utils/toast';
import { getErrorMessage } from '@/utils/error';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/utils/cn';

const userSchema = z.object({
    name: z.string().min(2, 'Name is too short'),
    email: z.string().email('Invalid email'),
    role: z.enum(['admin', 'founder']),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UsersListPage() {
    const queryClient = useQueryClient();
    const [editingUser, setEditingUser] = useState<any | null>(null);

    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const limit = 10;

    const { data: usersData, isLoading } = useQuery({
        queryKey: ['admin', 'users', page, debouncedSearch, 'founder'],
        queryFn: () => userService.getAllUsers({ page, limit, search: debouncedSearch, role: 'founder' }),
    });

    const users = usersData?.docs || [];
    const totalPages = usersData?.totalPages || 1;

    const deleteMutation = useMutation({
        mutationFn: userService.deleteUser,
        onSuccess: () => {
            showToast.success('User deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
        onError: (error) => {
            showToast.error(getErrorMessage(error));
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: UserFormData) => userService.updateUser(editingUser._id, data),
        onSuccess: () => {
            showToast.success('User updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            setEditingUser(null);
        },
        onError: (error) => {
            showToast.error(getErrorMessage(error));
        }
    });

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
    });

    const currentRole = watch('role');
    const isFounder = currentRole === 'founder';

    const handleEdit = (user: any) => {
        setEditingUser(user);
        reset({
            name: user.name,
            email: user.email,
            role: user.role
        });
    };

    const handleDelete = (id: string) => {
        if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            deleteMutation.mutate(id);
        }
    };

    const onUpdate = (data: UserFormData) => {
        updateMutation.mutate(data);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleExport = async () => {
        try {
            await userService.exportUsers({ search: debouncedSearch, role: 'founder' });
            showToast.success('Users exported successfully');
        } catch (error) {
            showToast.error(getErrorMessage(error));
        }
    };

    return (
        <div className="space-y-8 pb-24 px-4 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">User Directory</h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Platform Access Governance</p>
                </div>
                <Button variant="outline" onClick={handleExport} className="rounded-2xl border-gray-200 dark:border-gray-800 font-bold hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Download className="w-4 h-4 mr-2" />
                    Export Global Data
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 p-2 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 max-w-md">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        placeholder="Search entities by name or email..."
                        className="w-full pl-12 pr-4 py-3 bg-transparent text-sm font-medium outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Identity</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Contact</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Authorization</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center">
                                        <div className="flex justify-center"><Loader size="lg" /></div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full">
                                                <Search className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No entities detected</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user: any) => (
                                    <tr key={user._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="font-extrabold text-gray-900 dark:text-white transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400">
                                                <Mail className="w-4 h-4" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className={cn(
                                                "px-4 py-1.5 inline-flex text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                                user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shadow-sm shadow-purple-100 dark:shadow-none'
                                                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-sm shadow-indigo-100 dark:shadow-none'
                                            )}>
                                                <Shield className="w-3 h-3 mr-2" />
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right space-x-2">
                                            <Button size="sm" variant="ghost" className="rounded-xl hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm" onClick={() => handleEdit(user)}>
                                                <Edit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDelete(user._id)}>
                                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center pt-8">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}

            {/* Edit Modal */}
            <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Modify Authorization">
                <form onSubmit={handleSubmit(onUpdate)} className="space-y-6 pt-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800 mb-2">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-relaxed">Identity Updates will take effect immediately across all active sessions.</p>
                    </div>

                    <div className="space-y-4">
                        <Input label="Identity Name" error={errors.name?.message} {...register('name')} placeholder="Full display name" />
                        <Input label="Primary Email" type="email" disabled={isFounder} error={errors.email?.message} {...register('email')} placeholder="email@example.com" />
                        <Select
                            label="Authorization Tier"
                            options={[
                                { value: 'founder', label: 'Founder Level' },
                                { value: 'admin', label: 'Executive Admin' }
                            ]}
                            error={errors.role?.message}
                            {...register('role')}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="button" variant="ghost" className="flex-1 font-bold h-12 rounded-2xl" onClick={() => setEditingUser(null)}>Dismiss</Button>
                        <Button type="submit" className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest h-12 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none" isLoading={updateMutation.isPending}>Commit Changes</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
