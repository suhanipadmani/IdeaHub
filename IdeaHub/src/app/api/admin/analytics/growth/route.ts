import { withAuth } from '@/lib/auth-middleware';
import { userService } from '@/services/user.service';
import { ideaService } from '@/services/idea.service';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (req) => {
    const monthsCount = 6;
    const userGrowthData = await userService.getMonthlyGrowth(monthsCount, { role: 'founder' });
    const projectGrowthData = await ideaService.getMonthlyGrowth(monthsCount);

    // Helper to get month name
    const getMonthName = (monthNum: number) => {
        const date = new Date();
        date.setDate(1);
        date.setMonth(monthNum - 1);
        return date.toLocaleString('default', { month: 'short' });
    };

    const months = [];
    for (let i = 0; i < monthsCount; i++) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - (monthsCount - 1) + i);
        months.push(d.getMonth() + 1);
    }

    let currentUserCount = userGrowthData.baseCount || 0;
    let currentIdeaCount = projectGrowthData.baseCount || 0;

    const formattedGrowth = months.map(month => {
        const userStat = userGrowthData.monthlyData.find(u => u._id === month);
        const projectStat = projectGrowthData.monthlyData.find(p => p._id === month);
        
        currentUserCount += (userStat?.count || 0);
        currentIdeaCount += (projectStat?.count || 0);

        return {
            date: getMonthName(month),
            users: currentUserCount,
            ideas: currentIdeaCount
        };
    });

    return NextResponse.json(formattedGrowth);
}, 'admin');
