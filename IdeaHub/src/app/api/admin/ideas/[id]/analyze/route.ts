import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { ideaService } from '@/services/idea.service';

export const POST = withAuth(async (req: NextRequest, { params, auth }) => {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
        }


        const analysis = await ideaService.analyzeIdeaForAdmin(id as string, auth.userId);

        return NextResponse.json({ success: true, adminAiAnalysis: analysis }, { status: 200 });
    } catch (error: any) {
        console.error("Admin AI API Route Error:", error);
        
        const isAiUnavailable = error.message?.includes('AI System Unavailable') || 
                               error.message?.includes('high demand') ||
                               error.message?.includes('quota');
        
        return NextResponse.json(
            { 
                error: error.message || 'Failed to analyze idea for admin',
                details: error.toString()
            },
            { status: isAiUnavailable ? 503 : 500 }
        );
    }
}, 'admin');
