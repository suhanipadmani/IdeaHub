import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { ideaService } from '@/services/idea.service';

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        const body = await req.json();
        const { ideaId, ideaData } = body;

        console.log("AI Analysis Request for user:", auth.userId, { ideaId, hasData: !!ideaData });

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
        return NextResponse.json(
            { 
                error: error.message || 'Failed to analyze idea',
                details: error.response?.data || error.toString(),
                stack: error.stack
            },
            { status: 500 }
        );
    }
}, 'founder');
