import { withAuth } from '@/lib/auth-middleware';
import dbConnect from '@/lib/db';
import { ProjectIdea } from '@/models/ProjectIdea';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (req, { auth }) => {
    await dbConnect();

    // 1. Leaderboard (Top 10 AI Scoring Ideas that are public/approved)
    const leaderboard = await ProjectIdea.find({ status: 'approved' })
        .sort({ 'aiAnalysis.score': -1, 'adminAiAnalysis.score': -1 })
        .limit(10)
        .select('title aiAnalysis.score adminAiAnalysis.score targetMarket')
        .exec();

    // 2. Category-wise Trends
    const categoryGroup = await ProjectIdea.aggregate([
        {
            $group: {
                _id: "$targetMarket",
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);
    
    const categoryTrends = categoryGroup.map((c: any) => ({
        name: c._id || 'Uncategorized',
        value: c.count
    }));

    // 3. Approval Rate Analytics 
    const approvalStats = await ProjectIdea.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    const approvalRates = approvalStats.map((a: any) => ({
        name: a._id.charAt(0).toUpperCase() + a._id.slice(1),
        value: a.count
    }));

    return NextResponse.json({
        leaderboard: leaderboard.map(idea => ({
            id: idea._id,
            title: idea.title,
            aiScore: idea.aiAnalysis?.score || 0,
            adminScore: idea.adminAiAnalysis?.score || 0,
            category: idea.targetMarket
        })),
        categoryTrends,
        approvalRates
    });
}, 'admin');
