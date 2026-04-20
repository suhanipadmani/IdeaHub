import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { Notification } from '@/models/Notification';
import { ChatMessage } from '@/models/ChatMessage';
import { ChatReadStatus } from '@/models/ChatReadStatus';
import { ProjectIdea } from '@/models/ProjectIdea';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export const GET = withAuth(async (req, { auth }) => {
    await connectDB();
    const userId = new mongoose.Types.ObjectId(auth.userId);

    // 1. Fetch persistent notifications
    const storedNotifications = await Notification.find({ userId: auth.userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

    // 2. Fetch unread chat summaries (to show as "virtual" notifications)
    let projectFilter: any = {};
    if (auth.role !== 'admin') {
        projectFilter.founderId = userId;
    }
    const projects = await ProjectIdea.find(projectFilter, '_id title').lean();
    const projectIds = projects.map(p => p._id);

    let chatNotifications: any[] = [];
    let totalChatUnread = 0;

    if (projectIds.length > 0) {
        const unreadData = await ChatMessage.aggregate([
            { 
                $match: { 
                    ideaId: { $in: projectIds },
                    senderId: { $ne: userId }
                } 
            },
            {
                $lookup: {
                    from: 'chatreadstatuses',
                    let: { idea: '$ideaId' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$ideaId', '$$idea'] }, { $eq: ['$userId', userId] }] } } }
                    ],
                    as: 'readStatus'
                }
            },
            {
                $addFields: {
                    lastReadAt: { 
                        $ifNull: [{ $arrayElemAt: ['$readStatus.lastReadAt', 0] }, new Date(0)] 
                    }
                }
            },
            { $match: { $expr: { $gt: ['$createdAt', '$lastReadAt'] } } },
            {
                $group: {
                    _id: '$ideaId',
                    count: { $sum: 1 },
                    lastMessage: { $last: '$message' },
                    lastCreatedAt: { $last: '$createdAt' }
                }
            }
        ]);

        const projectMap = new Map(projects.map(p => [p._id.toString(), p.title]));

        chatNotifications = unreadData.map(item => ({
            _id: `chat-${item._id}`, 
            title: 'New Message',
            message: `${item.count} new message${item.count > 1 ? 's' : ''} in "${projectMap.get(item._id.toString()) || 'Your Project'}"`,
            type: 'chat',
            link: `/chat/${item._id}`, 
            isRead: false,
            createdAt: item.lastCreatedAt
        }));

        totalChatUnread = unreadData.reduce((acc, item) => acc + item.count, 0);
    }

    // 3. Combine and Sort
    const combined = [
        ...storedNotifications,
        ...chatNotifications
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

    const storedUnreadCount = await Notification.countDocuments({ 
        userId: auth.userId, 
        isRead: false 
    });

    return NextResponse.json({
        notifications: combined,
        unreadCount: storedUnreadCount + totalChatUnread
    });
});

export const PATCH = withAuth(async (req, { auth }) => {
    await connectDB();
    const { notificationId, markAll } = await req.json();

    if (markAll) {
        await Notification.updateMany(
            { userId: auth.userId, isRead: false },
            { isRead: true }
        );
    } else if (notificationId) {
        await Notification.findOneAndUpdate(
            { _id: notificationId, userId: auth.userId },
            { isRead: true }
        );
    }

    return NextResponse.json({ success: true });
});
