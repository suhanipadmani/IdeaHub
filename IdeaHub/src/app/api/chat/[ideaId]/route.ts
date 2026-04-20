import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { ideaService } from '@/services/idea.service';
import { ChatMessage } from '@/models/ChatMessage';
import { AppError } from '@/lib/errors';

export const GET = withAuth(async (req, { params, auth }) => {
    const { ideaId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const idea = await ideaService.findOneIdea({ _id: ideaId });
    if (!idea) {
        throw new AppError("Project not found", 404);
    }

    const isOwner = idea.founderId._id.toString() === auth.userId;
    const isAdmin = auth.role === 'admin';
    
    if (!isAdmin && !isOwner) {
        throw new AppError("Forbidden: Access denied", 403);
    }

    if (idea.status !== 'approved') {
        throw new AppError("Chat is only available for approved projects", 400);
    }

    // Fetch messages with pagination
    const messages = await ChatMessage.find({ ideaId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('replyTo', 'message senderId senderRole attachment')
        .lean();

    const totalMessages = await ChatMessage.countDocuments({ ideaId });
    const hasMore = totalMessages > skip + messages.length;

    return NextResponse.json({
        messages,
        hasMore,
        totalMessages,
        currentPage: page
    });
});
