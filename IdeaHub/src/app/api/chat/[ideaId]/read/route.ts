import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { ChatReadStatus } from '@/models/ChatReadStatus';
import { ProjectIdea } from '@/models/ProjectIdea';
import { AppError } from '@/lib/errors';
import connectDB from '@/lib/db';

export const POST = withAuth(async (req, { params, auth }) => {
    await connectDB();
    const { ideaId } = await params;

    const idea = await ProjectIdea.findById(ideaId);
    if (!idea) {
        throw new AppError("Project not found", 404);
    }

    // Check access
    const isOwner = idea.founderId.toString() === auth.userId;
    const isAdmin = auth.role === 'admin';
    
    if (!isAdmin && !isOwner) {
        throw new AppError("Forbidden: Access denied", 403);
    }

    // Update or Create read status
    const status = await ChatReadStatus.findOneAndUpdate(
        { userId: auth.userId, ideaId },
        { lastReadAt: new Date() },
        { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ success: true, lastReadAt: status.lastReadAt });
});
