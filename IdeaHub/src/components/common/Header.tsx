import { Menu, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import NotificationDropdown from './NotificationDropdown';
import Link from 'next/link';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
    const { user } = useAuth();

    return (
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200 shrink-0">
            <button
                className="p-1 -ml-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                onClick={onMenuClick}
            >
                <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center ml-auto gap-4">
                {/* Notification Bell */}
                <NotificationDropdown />

                <Link href="/profile" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center transition-colors">
                        <UserIcon className="w-5 h-5 text-gray-500" />
                    </div>
                    <span className="hidden sm:inline-block font-medium">{user?.role === 'admin' ? 'Admin' : user?.name}</span>
                </Link>
            </div>
        </header>
    );
};

export default Header;
