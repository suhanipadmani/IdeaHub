'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { useEffect, useState } from 'react';
import type { IProjectIdea } from '@/types';
import { X, Sparkles } from 'lucide-react';
import { AIAnalysisSection } from '@/components/common/AIAnalysisSection';
import { useAnalyzeIdea } from '@/hooks/useAnalyzeIdea';

const ideaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  problemStatement: z.string().min(20, 'Problem statement must be at least 20 characters'),
  solution: z.string().min(20, 'Solution must be at least 20 characters'),
  targetMarket: z.string().min(5, 'Target market is required'),
  techStack: z.array(z.string()).min(1, 'Select at least one technology'),
  teamDetails: z.string().min(10, 'Team details must be at least 10 characters'),
  pitchDeck: z.any().optional(),
});

export type IdeaFormData = z.infer<typeof ideaSchema>;

const TECH_OPTIONS = ['React', 'Node.js', 'Python', 'Django', 'Vue', 'Angular', 'Java', 'Spring', 'Go', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker'];

interface IdeaFormProps {
  initialData?: Partial<IProjectIdea>;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  submitLabel?: string;
}

export const IdeaForm = ({ initialData, onSubmit, isLoading, submitLabel = 'Submit Idea' }: IdeaFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<IdeaFormData>({
    mode: 'onChange',
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      techStack: [],
      ...initialData as any,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        techStack: [],
        ...initialData as any,
      });
    }
  }, [initialData, reset]);

  const selectedTechs = watch('techStack');

  const toggleTech = (tech: string) => {
    const current = selectedTechs || [];
    if (current.includes(tech)) {
      setValue('techStack', current.filter(t => t !== tech), { shouldValidate: true });
    } else {
      setValue('techStack', [...current, tech], { shouldValidate: true });
    }
  };

  const handleFormSubmit = (data: IdeaFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'techStack') {
        (value as string[]).forEach(tech => formData.append('techStack', tech));
      } else if (key === 'pitchDeck' && value?.[0]) {
        formData.append('pitchDeck', value[0]);
      } else {
        formData.append(key, value as string);
      }
    });

    if (previewAnalysis) {
      formData.append('aiAnalysis', JSON.stringify(previewAnalysis));
    }

    onSubmit(formData);
  };

  const [previewAnalysis, setPreviewAnalysis] = useState<any>(initialData?.aiAnalysis || null);
  const { analyze, isAnalyzing } = useAnalyzeIdea(initialData?._id);

  const watchedFields = watch();
  const isFormValid = !errors.title && !errors.problemStatement && !errors.solution && !errors.targetMarket && !errors.techStack && !errors.teamDetails && 
                     watchedFields.title && watchedFields.problemStatement && watchedFields.solution && watchedFields.targetMarket && watchedFields.techStack?.length > 0 && watchedFields.teamDetails;

  const handleAIAnalysis = async () => {
    const analysisInput = {
      title: watchedFields.title,
      problemStatement: watchedFields.problemStatement,
      solution: watchedFields.solution,
      targetMarket: watchedFields.targetMarket,
      techStack: watchedFields.techStack,
      teamDetails: watchedFields.teamDetails
    };

    const analysis = await analyze(analysisInput, true); 
    if (analysis) {
      setPreviewAnalysis(analysis);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        label="Project Title"
        placeholder="e.g., AI-Powered Logistics"
        error={errors.title?.message}
        {...register('title')}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Input
          label="Target Market"
          placeholder="e.g., Small Businesses"
          error={errors.targetMarket?.message}
          {...register('targetMarket')}
          required
        />
      </div>

      <Textarea
        label="Team Details"
        placeholder="Who is on your team and what are their roles?"
        rows={3}
        error={errors.teamDetails?.message}
        {...register('teamDetails')}
        required
      />

      <Textarea
        label="Problem Statement"
        placeholder="Describe the problem you are solving..."
        rows={3}
        error={errors.problemStatement?.message}
        {...register('problemStatement')}
        required
      />

      <Controller
        name="solution"
        control={control}
        render={({ field }) => (
          <RichTextEditor
            label="Proposed Solution"
            placeholder="Describe your solution..."
            value={field.value}
            onChange={field.onChange}
            error={errors.solution?.message}
            required
          />
        )}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Pitch Deck (PDF, optional)
        </label>
        <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF (MAX. 10MB)</p>
                </div>
                <input
                    type="file"
                    accept=".pdf"
                    {...register('pitchDeck')}
                    className="hidden"
                />
            </label>
        </div>
      </div>

      {/* Custom Multi-Select for Tech Stack */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Technology Stack <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {TECH_OPTIONS.map(tech => (
            <button
              key={tech}
              type="button"
              onClick={() => toggleTech(tech)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${selectedTechs?.includes(tech)
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              {tech}
              {selectedTechs?.includes(tech) && (
                <X size={14} className="hover:text-red-200 transition-colors" />
              )}
            </button>
          ))}
        </div>
        {errors.techStack && <p className="mt-1 text-xs text-red-500">{errors.techStack.message}</p>}
      </div>

      {/* AI Analysis Preview */}
      {previewAnalysis && (
        <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
          <AIAnalysisSection 
            data={previewAnalysis} 
            isAnalyzing={isAnalyzing}
            onAnalyze={handleAIAnalysis}
            showActions={false}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleAIAnalysis}
          isLoading={isAnalyzing}
          disabled={!isFormValid || isAnalyzing}
          className="w-full sm:w-auto border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900/50 dark:text-indigo-400"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {previewAnalysis ? 'Re-analyze with AI' : 'Analyze with AI'}
        </Button>

        <Button type="submit" size="lg" className="w-full sm:w-auto px-12" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
