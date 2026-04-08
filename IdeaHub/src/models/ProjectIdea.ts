import mongoose, { Schema } from 'mongoose';

const projectIdeaSchema = new Schema(
    {
        founderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        problemStatement: {
            type: String,
            required: true
        },
        solution: {
            type: String,
            required: true
        },
        targetMarket: {
            type: String,
            required: true
        },
        techStack: {
            type: [String],
            default: []
        },
        teamDetails: {
            type: String,
            required: true
        },
        pitchDeckUrl: {
            type: String,
            default: ""
        },
        documents: [{
            name: String,
            url: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        adminComment: {
            type: String,
            default: ""
        },
        aiAnalysis: {
            score: { type: Number, default: 0 },
            ideaQuality: { type: String, default: null },
            autoImprovementSuggestions: { type: [String], default: [] },
            marketValidationSummary: { type: String, default: null },
            analyzedAt: { type: Date, default: null }
        },
        adminAiAnalysis: {
            score: { type: Number, default: 0 },
            evaluation: { type: String, default: null },
            recommendations: { type: String, default: null },
            risks: { type: [String], default: [] },
            opportunities: { type: [String], default: [] },
            analyzedAt: { type: Date, default: null }
        }
    },
    { timestamps: true }
);

// Force model refresh in development to pick up schema changes
if (process.env.NODE_ENV === 'development' && mongoose.models.ProjectIdea) {
    delete (mongoose.models as any).ProjectIdea;
}

export const ProjectIdea = mongoose.models.ProjectIdea || mongoose.model('ProjectIdea', projectIdeaSchema);
