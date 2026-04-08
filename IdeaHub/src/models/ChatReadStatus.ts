import mongoose, { Schema } from 'mongoose';

const chatReadStatusSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        ideaId: {
            type: Schema.Types.ObjectId,
            ref: 'ProjectIdea',
            required: true,
        },
        lastReadAt: {
            type: Date,
            default: Date.now,
            required: true,
        }
    },
    { timestamps: true }
);

// Compound index for fast lookups by user and project
chatReadStatusSchema.index({ userId: 1, ideaId: 1 }, { unique: true });

export const ChatReadStatus = mongoose.models.ChatReadStatus || mongoose.model('ChatReadStatus', chatReadStatusSchema);
