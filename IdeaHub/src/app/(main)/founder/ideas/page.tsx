import { StartupIdeaList } from '@/components/founder/StartupIdeaList';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Startup Ideas | IdeaHub',
    description: 'Manage and track your startup ideas',
};

export default function FounderIdeasPage() {
    return <StartupIdeaList />;
}
