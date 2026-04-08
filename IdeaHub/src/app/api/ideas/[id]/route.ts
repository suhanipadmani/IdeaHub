export const dynamic = 'force-dynamic';
import { withAuth } from '@/lib/auth-middleware';
import { ideaService } from '@/services/idea.service';
import { ideaUpdateSchema } from '@/lib/validations/idea';
import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';

export const GET = withAuth(async (req, { params, auth }) => {
    const { id } = await params;
    const idea = await ideaService.findOneIdea({ _id: id });

    if (!idea) {
        throw new AppError("Idea not found", 404);
    }

    // Only founder or admin can view
    if (auth.role !== 'admin' && idea.founderId._id.toString() !== auth.userId) {
        throw new AppError("Forbidden: Access denied", 403);
    }

    return NextResponse.json(idea);
});

export const PUT = withAuth(async (req, { params, auth }) => {
    const { id } = await params;
    const formData = await req.formData();

    const title = formData.get('title') as string;
    const problemStatement = formData.get('problemStatement') as string;
    const solution = formData.get('solution') as string;
    const targetMarket = formData.get('targetMarket') as string;
    const techStack = formData.getAll('techStack') as string[];
    const teamDetails = formData.get('teamDetails') as string;
    const aiAnalysis = formData.get('aiAnalysis') as string;
    const file = formData.get('pitchDeck') as File;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (problemStatement) updateData.problemStatement = problemStatement;
    if (solution) updateData.solution = solution;
    if (targetMarket) updateData.targetMarket = targetMarket;
    if (techStack && techStack.length > 0) updateData.techStack = techStack;
    if (teamDetails) updateData.teamDetails = teamDetails;
    if (aiAnalysis) updateData.aiAnalysis = aiAnalysis;

    // Validate if any fields are present
    if (Object.keys(updateData).length > 0) {
        ideaUpdateSchema.parse(updateData);
    }

    const updatedIdea = await ideaService.updateIdeaWithFile(id, { founderId: auth.userId }, updateData, file);

    if (!updatedIdea) {
        throw new AppError("Idea not found or unauthorized", 404);
    }

    return NextResponse.json(updatedIdea);
}, 'founder');

export const DELETE = withAuth(async (_req, { params, auth }) => {
    const { id } = await params;
    const idea = await ideaService.deleteIdea(id, auth.userId);

    if (!idea) {
        throw new AppError("Idea not found or unauthorized", 404);
    }

    return NextResponse.json({ message: "Idea deleted successfully" });
}, 'founder');
