import ProjectList from '@/components/admin/ProjectList';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pending Reviews | IdeaHub Admin',
    description: 'Review pending startup ideas',
};

export default function PendingReviewsPage() {
    return (
        <div className="space-y-8 pb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Pending Reviews</h1>
            <ProjectList
                initialStatus="pending"
                showFilters={false}
                showDateFilter={true}
            />
        </div>
    );
}
