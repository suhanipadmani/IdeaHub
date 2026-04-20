import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { ideaService } from '@/services/idea.service';

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        const body = await req.json();
        const { ideaId, ideaData } = body;


        if (!ideaId && !ideaData) {
            return NextResponse.json(
                { error: 'Either ideaId or ideaData is required' },
                { status: 400 }
            );
        }

        const analysis = await ideaService.analyzeIdeaWithAI(ideaId || ideaData, auth.userId);

        return NextResponse.json({ success: true, aiAnalysis: analysis }, { status: 200 });
    } catch (error: any) {
        console.error("DEBUG: AI API Route Error:", error);
        
        const isAiUnavailable = error.message?.includes('AI System Unavailable') || 
                               error.message?.includes('high demand') ||
                               error.message?.includes('quota');

        return NextResponse.json(
            { 
                error: error.message || 'Failed to analyze idea',
                details: error.response?.data || error.toString()
            },
            { status: isAiUnavailable ? 503 : 500 }
        );
    }
}, 'founder');
