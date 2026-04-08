import mongoose, { Schema } from 'mongoose';

const reviewLogSchema = new Schema(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'ProjectIdea',
            required: true,
        },
        adminId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            enum: ['approved', 'rejected'],
            required: true,
        },
        comment: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const ReviewLog = mongoose.models.ReviewLog || mongoose.model('ReviewLog', reviewLogSchema);
