import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { ProjectIdea } from '@/models/ProjectIdea';
import { ChatMessage } from '@/models/ChatMessage';

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

export default async function SocketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  await connectDB();

  const io = new Server(res.socket.server, {
    path: '/socket.io',
    addTrailingSlash: false,
  });
  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join room
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
      } catch (err) {
        socket.emit('error_message', 'Internal server error during join');
      }
    });

    // Send message
    socket.on('send_message', async ({ ideaId, token, message, attachment }: { ideaId: string; token: string; message?: string; attachment?: any }) => {
        try {
            const decoded = verifyToken(token);
            if (!decoded) return;

            const idea = await ProjectIdea.findById(ideaId);
            if (!idea || (decoded.role !== 'admin' && idea.founderId.toString() !== decoded.userId)) return;

            // Enforce that at least a message or attachment exists
            if (!message && !attachment) return;

            const newMessage = await ChatMessage.create({
                ideaId,
                senderId: decoded.userId,
                senderRole: decoded.role,
                message: message || "", // Fallback empty string if just attachment
                attachment
            });

            const broadcastPayload = {
                _id: newMessage._id,
                ideaId,
                senderId: decoded.userId,
                senderRole: decoded.role,
                message: newMessage.message,
                attachment: newMessage.attachment,
                createdAt: newMessage.createdAt
            };

            io.to(ideaId).emit('receive_message', broadcastPayload);
        } catch (err) {
            console.error('Socket send_message error:', err);
        }
    });

    // Delete messages
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

    // Typing indicators
    socket.on('typing_status', ({ ideaId, isTyping, userId, role }: { ideaId: string; isTyping: boolean; userId: string; role: string }) => {
        socket.to(ideaId).emit('user_typing', { userId, role, isTyping });
    });

    socket.on('mark_chat_read', async ({ ideaId, token }: { ideaId: string; token: string }) => {
        try {
            const decoded = verifyToken(token);
            if (!decoded) return;
            socket.to(ideaId).emit('chat_read', { ideaId, userId: decoded.userId });
        } catch (err) {
        }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  res.end();
}
