import { useState } from 'react';
import { ideaService } from '@/services/idea.api';
import { useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/utils/toast';
import { getErrorMessage } from '@/utils/error';

export const useAnalyzeIdea = (ideaId?: string) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const analyze = async (rawData?: any, forceRaw: boolean = false) => {
    setIsAnalyzing(true);
    try {
      const response = await ideaService.analyzeIdea(forceRaw ? rawData : (ideaId || rawData));
      const analysis = response.aiAnalysis;
      
      showToast.success('Idea analyzed successfully!');
      if (ideaId) {
        await queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
      }
      return analysis;
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error));
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyze, isAnalyzing };
};
