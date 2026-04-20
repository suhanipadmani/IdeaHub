import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { ChatMessage } from '@/models/ChatMessage';
import { ChatReadStatus } from '@/models/ChatReadStatus';
import { ProjectIdea } from '@/models/ProjectIdea';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export const GET = withAuth(async (req, { auth }) => {
    await connectDB();
    const userId = new mongoose.Types.ObjectId(auth.userId);

    // 1. Get all project IDs the user has access to
    let projectFilter: any = {};
    if (auth.role !== 'admin') {
        projectFilter.founderId = userId;
    }
    
    const projects = await ProjectIdea.find(projectFilter, '_id').lean();
    const projectIds = projects.map(p => p._id);

    if (projectIds.length === 0) {
        return NextResponse.json({ total: 0, unreadCounts: {} });
    }

    // 2. Optimized Aggregation to get unread counts for all projects at once
    const unreadData = await ChatMessage.aggregate([
        { 
            $match: { 
                ideaId: { $in: projectIds },
                senderId: { $ne: userId }
            } 
        },
        // Join with ChatReadStatus for this specific user and project
        {
            $lookup: {
                from: 'chatreadstatuses',
                let: { idea: '$ideaId' },
                pipeline: [
                    { 
                        $match: { 
                            $expr: { 
                                $and: [
                                    { $eq: ['$ideaId', '$$idea'] },
                                    { $eq: ['$userId', userId] }
                                ]
                            }
                        } 
                    }
                ],
                as: 'readStatus'
            }
        },
        // Add a default lastReadAt if no status exists (beginning of time)
        {
            $addFields: {
                lastReadAt: { 
                    $ifNull: [
                        { $arrayElemAt: ['$readStatus.lastReadAt', 0] }, 
                        new Date(0) 
                    ] 
                }
            }
        },
        // Filter messages created after lastReadAt
        {
            $match: {
                $expr: { $gt: ['$createdAt', '$lastReadAt'] }
            }
        },
        // Group by ideaId to get counts per project
        {
            $group: {
                _id: '$ideaId',
                count: { $sum: 1 }
            }
        }
    ]);

    const unreadCounts: Record<string, number> = {};
    let total = 0;

    unreadData.forEach(item => {
        const count = item.count || 0;
        unreadCounts[item._id.toString()] = count;
        total += count;
    });

    return NextResponse.json({ total, unreadCounts });
});
