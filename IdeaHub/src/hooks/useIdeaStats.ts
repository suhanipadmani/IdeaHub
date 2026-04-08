'use client';

import { useQuery } from '@tanstack/react-query';
import { ideaService } from '@/services/idea.api';

export const useIdeaStats = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['idea-stats'],
        queryFn: ideaService.getIdeaStats,
    });

    const stats = data || { total: 0, pending: 0, approved: 0, rejected: 0 };

    return { stats, isLoading, error };
};
