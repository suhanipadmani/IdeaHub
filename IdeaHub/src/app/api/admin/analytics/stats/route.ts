import { withAuth } from '@/lib/auth-middleware';
import { userService } from '@/services/user.service';
import { ideaService } from '@/services/idea.service';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (req) => {
    const totalUsers = await userService.count({ role: 'founder' });
    const stats = await ideaService.getStats();

    return NextResponse.json({
        totalUsers,
        totalIdeas: stats.total,
        pendingIdeas: stats.pending,
        approvedIdeas: stats.approved,
    });
}, 'admin');
