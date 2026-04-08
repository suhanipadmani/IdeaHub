import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { ChatMessage } from '@/models/ChatMessage';
import { ChatReadStatus } from '@/models/ChatReadStatus';
import { ProjectIdea } from '@/models/ProjectIdea';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export const GET = withAuth(async (req, { auth }) => {
    await connectDB();

    // 1. Get all project IDs the user has access to
    let projectFilter: any = {};
    if (auth.role !== 'admin') {
        projectFilter.founderId = new mongoose.Types.ObjectId(auth.userId);
    }
    
    const projects = await ProjectIdea.find(projectFilter, '_id').lean();
    const projectIds = projects.map(p => p._id);

    // 2. Fetch all read statuses for this user
    const readStatuses = await ChatReadStatus.find({
        userId: new mongoose.Types.ObjectId(auth.userId),
        ideaId: { $in: projectIds }
    }).lean();

    const readStatusMap = new Map(
        readStatuses.map(s => [s.ideaId.toString(), s.lastReadAt])
    );

    // 3. Count unread messages for each project
    const unreadCounts: Record<string, number> = {};

    await Promise.all(projectIds.map(async (ideaId) => {
        const lastReadAt = readStatusMap.get(ideaId.toString()) || new Date(0);
        
        const count = await ChatMessage.countDocuments({
            ideaId,
            senderId: { $ne: new mongoose.Types.ObjectId(auth.userId) },
            createdAt: { $gt: lastReadAt }
        });

        unreadCounts[ideaId.toString()] = count;
    }));

    return NextResponse.json({ unreadCounts });
});
