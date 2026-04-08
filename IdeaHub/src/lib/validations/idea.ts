import { z } from 'zod';

export const ideaSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    problemStatement: z.string().min(20, 'Problem statement must be at least 20 characters'),
    solution: z.string().min(20, 'Solution must be at least 20 characters'),
    targetMarket: z.string().min(5, 'Target market is required'),
    techStack: z.array(z.string()).min(1, 'Select at least one technology'),
    teamDetails: z.string().min(10, 'Team details must be at least 10 characters'),
});

export const ideaUpdateSchema = ideaSchema.partial();

export const adminReviewSchema = z.object({
    comment: z.string().min(5, 'Review comment must be at least 5 characters'),
});
