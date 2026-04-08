'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ideaService } from '@/services/idea.api';
import { showToast } from '@/utils/toast';
import { useRouter } from 'next/navigation';

export const useIdeas = (params?: any) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: ideasData, isLoading, error } = useQuery({
        queryKey: ['ideas', params],
        queryFn: () => ideaService.getAllIdeas(params),
    });

    const createIdeaMutation = useMutation({
        mutationFn: (data: FormData) => ideaService.createIdea(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ideas'] });
            queryClient.invalidateQueries({ queryKey: ['idea-stats'] });
            showToast.success('Idea submitted successfully');
            router.push('/founder');
        },
    });

    const deleteIdeaMutation = useMutation({
        mutationFn: (id: string) => ideaService.deleteIdea(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ideas'] });
            queryClient.invalidateQueries({ queryKey: ['idea-stats'] });
            showToast.success('Idea deleted successfully');
        },
    });

    const updateIdeaMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData }) => ideaService.updateIdea(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ideas'] });
            queryClient.invalidateQueries({ queryKey: ['idea'] });
            queryClient.invalidateQueries({ queryKey: ['idea-stats'] });
            showToast.success('Idea updated successfully');
            router.push('/founder');
        },
    });

    return {
        ideas: ideasData,
        isLoading,
        error,
        createIdea: createIdeaMutation.mutate,
        isCreating: createIdeaMutation.isPending,
        deleteIdea: deleteIdeaMutation.mutate,
        isDeleting: deleteIdeaMutation.isPending,
        updateIdea: updateIdeaMutation.mutate,
        isUpdating: updateIdeaMutation.isPending,
    };
};

export const useIdea = (id: string) => {
    return useQuery({
        queryKey: ['idea', id],
        queryFn: () => ideaService.getIdeaById(id),
        enabled: !!id,
    });
};
