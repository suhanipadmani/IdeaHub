'use client';

import { useIdeas } from '@/hooks/useIdeas';
import { IdeaForm } from '@/components/founder/IdeaForm';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SubmitIdeaPage() {
    const { createIdea, isCreating } = useIdeas();

    const onSubmit = (data: FormData) => {
        createIdea(data);
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <div className="mb-8">
                <Link href="/founder">
                    <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-indigo-600 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Submit New Startup Idea</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Tell us about your next big thing. Be descriptive and clear.</p>
                    <IdeaForm onSubmit={onSubmit} isLoading={isCreating} />
                </div>
            </div>
        </div>
    );
}
