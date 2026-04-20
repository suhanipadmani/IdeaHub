import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { ProjectIdea } from '@/models/ProjectIdea';
import { ChatMessage } from '@/models/ChatMessage';
import { Notification } from '@/models/Notification';

interface SocketServer extends HTTPServer {
    io?: Server | undefined;
}

interface SocketWithIO extends NetSocket {
    server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO;
}

export const config = {
    api: {
        bodyParser: false,
    },
};

let isInitializing = false;

export default async function SocketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
    if (res.socket.server.io) {
        res.end();
        return;
    }

    if (isInitializing) {
        res.end();
        return;
    }

    isInitializing = true;
    try {
        await connectDB();

        const io = new Server(res.socket.server, {
            path: '/socket.io',
            addTrailingSlash: false,
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });
        res.socket.server.io = io;

        io.on('connection', (socket) => {

            socket.on('join_room', async ({ ideaId, token }: { ideaId: string; token: string }) => {
                try {
                    const decoded = verifyToken(token);
                    if (!decoded) {
                        socket.emit('error_message', 'Invalid token');
                        return;
                    }

                    const idea = await ProjectIdea.findById(ideaId);
                    if (!idea) {
                        socket.emit('error_message', 'Project not found');
                        return;
                    }

                    if (decoded.role !== 'admin' && idea.founderId.toString() !== decoded.userId) {
                        socket.emit('error_message', 'Forbidden: You do not have access to this room');
                        return;
                    }

                    if (idea.status !== 'approved') {
                        socket.emit('error_message', 'Chat only available for approved projects');
                        return;
                    }

                    socket.join(ideaId);
                    socket.emit('joined_room', { ideaId });

                    // Mark messages from others as delivered when someone joins
                    const updateResult = await ChatMessage.updateMany(
                        {
                            ideaId,
                            senderId: { $ne: decoded.userId },
                            status: 'sent'
                        },
                        { status: 'delivered' }
                    );

                    // Notify others that messages are delivered
                    io.to(ideaId).emit('message_status_update', {
                        ideaId,
                        status: 'delivered',
                        updatedBy: decoded.userId
                    });

                } catch (err) {
                    socket.emit('error_message', 'Internal server error during join');
                }
            });

            socket.on('send_message', async ({ ideaId, token, message, attachments, replyTo }: { ideaId: string; token: string; message?: string; attachments?: any[]; replyTo?: string }) => {
                try {
                    const decoded = verifyToken(token);
                    if (!decoded) return;

                    const idea = await ProjectIdea.findById(ideaId);
                    if (!idea || (decoded.role !== 'admin' && idea.founderId.toString() !== decoded.userId)) return;

                    if (!message && (!attachments || attachments.length === 0)) return;

                    const payload: any = {
                        ideaId,
                        senderId: decoded.userId,
                        senderRole: decoded.role,
                        message: message || ""
                    };

                    if (attachments && attachments.length > 0) {
                        payload.attachments = attachments;
                    }

                    if (replyTo) {
                        payload.replyTo = replyTo;
                    }

                    const newMessage = await ChatMessage.create(payload);

                    let populatedReplyTo = undefined;
                    if (newMessage.replyTo) {
                        const parentMsg = await ChatMessage.findById(newMessage.replyTo).lean();
                        if (parentMsg) {
                            populatedReplyTo = {
                                _id: parentMsg._id.toString(),
                                message: parentMsg.message,
                                senderId: parentMsg.senderId.toString(),
                                senderRole: parentMsg.senderRole,
                                attachment: parentMsg.attachment,
                                attachments: parentMsg.attachments
                            };
                        }
                    }

                    const broadcastPayload = {
                        _id: newMessage._id,
                        ideaId,
                        senderId: decoded.userId,
                        senderRole: decoded.role,
                        message: newMessage.message,
                        attachment: newMessage.attachment,
                        attachments: newMessage.attachments,
                        isEdited: newMessage.isEdited,
                        editedAt: newMessage.editedAt,
                        replyTo: populatedReplyTo,
                        status: newMessage.status,
                        createdAt: newMessage.createdAt
                    };

                    io.to(ideaId).emit('receive_message', broadcastPayload);

                    // If there are other people in the room, mark as delivered immediately
                    const clients = await io.in(ideaId).fetchSockets();

                    if (clients.length > 1) {
                        await ChatMessage.findByIdAndUpdate(newMessage._id, { status: 'delivered' });
                        io.to(ideaId).emit('message_status_update', {
                            messageId: newMessage._id.toString(),
                            status: 'delivered'
                        });
                    } else {
                        const recipientId = decoded.role === 'admin' ? idea.founderId : null; // In this simple model, we notify the founder if admin sends

                        if (recipientId) {
                            const notification = await Notification.create({
                                userId: recipientId,
                                title: 'New Message',
                                message: `Admin sent a message in "${idea.title}"`,
                                type: 'chat',
                                link: `/chat/${idea._id}`,
                                metadata: {
                                    ideaId: idea._id,
                                    messageId: newMessage._id
                                }
                            });

                            // Broadcast the notification to the recipient specifically if they are connected on other rooms/pages
                            // We need a way to find all sockets for a userId. 
                            // For now, we'll just emit globally or trust the client to refetch if they see a generic 'update' 
                            // or we can emit to a user-specific room.
                            io.emit('new_notification', notification);
                        }
                    }
                } catch (err) {
                    console.error('Socket send_message error:', err);
                }
            });

            socket.on('delete_messages', async ({ ideaId, token, messageIds }: { ideaId: string; token: string; messageIds: string[] }) => {
                try {
                    const decoded = verifyToken(token);
                    if (!decoded || !Array.isArray(messageIds)) return;

                    const realIds = messageIds.filter(id => !id.startsWith('temp-'));

                    if (realIds.length > 0) {
                        await Promise.all(realIds.map(async (id) => {
                            await ChatMessage.findOneAndDelete({
                                _id: id,
                                ideaId: ideaId,
                                senderId: decoded.userId
                            });
                        }));
                    }

                    io.to(ideaId).emit('messages_deleted', { messageIds });

                    messageIds.forEach(id => {
                        io.to(ideaId).emit('message_deleted', { messageId: id });
                    });
                } catch (err) {
                }
            });

            socket.on('edit_message', async ({ ideaId, token, messageId, newText }: { ideaId: string; token: string; messageId: string; newText: string }) => {
                try {
                    const decoded = verifyToken(token);
                    if (!decoded || !messageId || !newText.trim()) return;

                    if (messageId.startsWith('temp-')) return;

                    const existingMessage = await ChatMessage.findOne({
                        _id: messageId,
                        ideaId: ideaId,
                        senderId: decoded.userId
                    });

                    if (!existingMessage) return;

                    existingMessage.message = newText.trim();
                    existingMessage.isEdited = true;
                    existingMessage.editedAt = new Date();

                    await existingMessage.save();

                    io.to(ideaId).emit('message_edited', {
                        messageId: existingMessage._id.toString(),
                        newText: existingMessage.message,
                        isEdited: existingMessage.isEdited,
                        editedAt: existingMessage.editedAt
                    });
                } catch (err) {
                    console.error('Socket edit_message error:', err);
                }
            });

            socket.on('pin_message', async ({ ideaId, token, messageId }: { ideaId: string; token: string; messageId: string }) => {
                try {
                    const decoded = verifyToken(token);
                    if (!decoded || decoded.role !== 'admin' || !messageId) return;

                    const message = await ChatMessage.findOneAndUpdate(
                        { _id: messageId, ideaId: ideaId },
                        { isPinned: true },
                        { returnDocument: 'after' }
                    );

                    if (message) {
                        io.to(ideaId).emit('message_pinned', { messageId, isPinned: true });
                    }
                } catch (err) {
                    console.error('Socket pin_message error:', err);
                }
            });

            socket.on('unpin_message', async ({ ideaId, token, messageId }: { ideaId: string; token: string; messageId: string }) => {
                try {
                    const decoded = verifyToken(token);
                    if (!decoded || decoded.role !== 'admin' || !messageId) return;

                    const message = await ChatMessage.findOneAndUpdate(
                        { _id: messageId, ideaId: ideaId },
                        { isPinned: false },
                        { returnDocument: 'after' }
                    );

                    if (message) {
                        io.to(ideaId).emit('message_unpinned', { messageId, isPinned: false });
                    }
                } catch (err) {
                    console.error('Socket unpin_message error:', err);
                }
            });

            socket.on('typing_status', ({ ideaId, isTyping, userId, role }: { ideaId: string; isTyping: boolean; userId: string; role: string }) => {
                socket.to(ideaId).emit('user_typing', { userId, role, isTyping });
            });

            socket.on('mark_chat_read', async ({ ideaId, token }: { ideaId: string; token: string }) => {
                try {
                    const decoded = verifyToken(token);
                    if (!decoded) return;

                    // Update messages from others to 'seen'
                    const updateResult = await ChatMessage.updateMany(
                        {
                            ideaId,
                            senderId: { $ne: decoded.userId },
                            status: { $ne: 'seen' }
                        },
                        { status: 'seen' }
                    );

                    io.to(ideaId).emit('chat_read', { ideaId, userId: decoded.userId });

                    // Notify others that their messages were seen
                    io.to(ideaId).emit('message_status_update', {
                        ideaId,
                        status: 'seen',
                        updatedBy: decoded.userId
                    });
                } catch (err) {
                    console.error('Socket mark_chat_read error:', err);
                }
            });

            socket.on('message_delivered', async ({ ideaId, messageId, token }: { ideaId: string; messageId: string; token: string }) => {
                try {
                    const decoded = verifyToken(token);
                    if (!decoded || !messageId || messageId.startsWith('temp-')) return;

                    const message = await ChatMessage.findOneAndUpdate(
                        { _id: messageId, ideaId, senderId: { $ne: decoded.userId }, status: 'sent' },
                        { status: 'delivered' },
                        { new: true }
                    );

                    if (message) {
                        io.to(ideaId).emit('message_status_update', {
                            messageId: messageId,
                            status: 'delivered'
                        });
                    }
                } catch (err) {
                    console.error('Socket message_delivered error:', err);
                }
            });

            socket.on('disconnect', () => { });
        });

        res.end();
    } catch (err) {
        console.error('Socket initialization error:', err);
        res.status(500).end();
    } finally {
        isInitializing = false;
    }
}
