import mongoose, { Schema } from 'mongoose';

const chatMessageSchema = new Schema(
    {
        ideaId: {
            type: Schema.Types.ObjectId,
            ref: 'ProjectIdea',
            required: true,
            index: true
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        senderRole: {
            type: String,
            enum: ['admin', 'founder'],
            required: true,
        },
        message: {
            type: String,
            required: false,
            trim: true
        },
        attachment: {
            url: { type: String, required: false },
            name: { type: String, required: false },
            type: { type: String, required: false },
            size: { type: Number, required: false }
        }
    },
    { timestamps: true }
);

chatMessageSchema.index({ ideaId: 1, createdAt: -1 });

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
