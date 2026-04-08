import { withAuth } from '@/lib/auth-middleware';
import { ideaService } from '@/services/idea.service';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (req, { auth }) => {
    const stats = await ideaService.getFounderStats(auth.userId);
    return NextResponse.json(stats);
}, 'founder');
