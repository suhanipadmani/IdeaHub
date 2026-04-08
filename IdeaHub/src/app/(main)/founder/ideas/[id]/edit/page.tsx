'use client';

import { useParams, useRouter } from 'next/navigation';
import { useIdeas, useIdea } from '@/hooks/useIdeas';
import { IdeaForm } from '@/components/founder/IdeaForm';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EditIdeaPage() {
    const params = useParams();
    const id = (params?.id as string) || '';
    const router = useRouter();
    const { data: idea, isLoading: isLoadingIdea } = useIdea(id);
    const { updateIdea, isUpdating } = useIdeas();

    if (isLoadingIdea) {
        return <div className="h-96 flex items-center justify-center"><Loader size="lg" /></div>;
    }

    if (!idea) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Idea Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">This idea may have been deleted.</p>
                <Link href="/founder">
                    <Button>Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    if (idea.status !== 'pending' && idea.status !== 'rejected') {
        return (
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-full w-fit mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cannot Edit Idea</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">This idea has already been processed and cannot be edited.</p>
                <Link href="/founder">
                    <Button className="w-full sm:w-auto">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const onSubmit = (data: FormData) => {
        updateIdea({ id, data });
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <div className="mb-8">
                <Link href="/founder">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="pl-0 hover:bg-transparent hover:text-indigo-600 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Startup Idea</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Update your idea details and refine your pitch.</p>
                    <IdeaForm
                        initialData={idea}
                        onSubmit={onSubmit}
                        isLoading={isUpdating}
                        submitLabel="Update Idea"
                    />
                </div>
            </div>
        </div>
    );
}
