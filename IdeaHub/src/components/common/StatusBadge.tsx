import type { ProjectStatus } from '@/types';
import { cn } from '@/utils/cn';

export default function StatusBadge({ status }: { status: ProjectStatus }) {
    const styles: Record<ProjectStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize transition-colors',
                styles[status]
            )}
        >
            {status}
        </span>
    );
}
