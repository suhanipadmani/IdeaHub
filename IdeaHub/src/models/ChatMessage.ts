import mongoose, { Schema } from 'mongoose';

const chatMessageSchema = new Schema(
    {
        ideaId: {
            type: Schema.Types.ObjectId,
            ref: 'ProjectIdea',
            required: true,
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
        },
        attachments: [{
            url: { type: String, required: true },
            name: { type: String, required: true },
            type: { type: String, required: true },
            size: { type: Number, required: true }
        }],
        isEdited: {
            type: Boolean,
            default: false
        },
        editedAt: {
            type: Date
        },
        replyTo: {
            type: Schema.Types.ObjectId,
            ref: 'ChatMessage',
            required: false
        },
        isPinned: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'seen'],
            default: 'sent',
            index: true
        }
    },
    { timestamps: true }
);

chatMessageSchema.index({ ideaId: 1, createdAt: -1 });

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
