import { withAuth } from '@/lib/auth-middleware';
import { ideaService } from '@/services/idea.service';
import { ideaSchema } from '@/lib/validations/idea';
import { NextResponse } from 'next/server';

export const POST = withAuth(async (req, { auth }) => {
    const formData = await req.formData();
    
    const title = formData.get('title') as string;
    const problemStatement = formData.get('problemStatement') as string;
    const solution = formData.get('solution') as string;
    const targetMarket = formData.get('targetMarket') as string;
    const techStack = formData.getAll('techStack') as string[];
    const teamDetails = formData.get('teamDetails') as string;
    const aiAnalysis = formData.get('aiAnalysis') as string;
    const file = formData.get('pitchDeck') as File;

    // Validate with Zod
    const validatedData = ideaSchema.parse({ title, problemStatement, solution, targetMarket, techStack, teamDetails });

    const newIdea = await ideaService.createIdeaWithFile({
        ...validatedData,
        founderId: auth.userId,
        aiAnalysis
    }, file);

    return NextResponse.json(newIdea, { status: 201 });
}, 'founder');

export const GET = withAuth(async (req, { auth }) => {
    const { searchParams } = new URL(req.url);
    const filter: any = {};

    // If founder, only show their ideas
    if (auth.role === 'founder') {
        filter.founderId = auth.userId;
    }

    const status = searchParams.get('status');
    if (status) filter.status = status;

    const ideas = await ideaService.findIdeas(filter, { createdAt: -1 }, auth.userId);
    return NextResponse.json(ideas);
});
