import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['review', 'chat', 'system'],
            default: 'system',
        },
        link: {
            type: String,
            default: '',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        }
    },
    { timestamps: true }
);

// Index for performance on listing notifications
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
