import ProjectList from '@/components/admin/ProjectList';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Review History | IdeaHub Admin',
    description: 'Archive of processed reviews',
};

export default function ReviewHistoryPage() {
    return (
        <div className="space-y-8 pb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Review History</h1>
            <ProjectList
                initialStatus="approved,rejected"
                title="Historical Decision Record"
                showFilters={true}
            />
        </div>
    );
}


