import { ProjectIdea } from '@/models/ProjectIdea';
import { ReviewLog } from '@/models/ReviewLog';
import { ChatMessage } from '@/models/ChatMessage';
import { Notification } from '@/models/Notification';
import { BaseService } from './base.service';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import { generateSlug } from '@/utils/slug';
import { callAiWithFallback } from '@/lib/ai-retry';
import sendEmail from '@/lib/email';
import { getIdeaStatusEmailTemplate } from '@/utils/emailTemplates';

export class IdeaService extends BaseService<any> {
    constructor() {
        super(ProjectIdea);
    }

    async findIdeas(filter: any = {}, sort: any = { createdAt: -1 }, userId?: string) {
        await this.connect();
        const ideas = await this.model.find(filter)
            .populate('founderId', 'name email')
            .sort(sort)
            .exec();

        if (userId && ideas.length > 0) {
            return await this.attachUnreadCounts(ideas, userId);
        }

        return ideas;
    }

    async attachUnreadCounts(ideas: any[], userId: string) {
        if (!ideas.length) return ideas;
        const ideaIds = ideas.map(i => i._id);
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        // Optimized Aggregation:
        // 1. Match messages for these ideas NOT sent by the current user
        // 2. Lookup the read status for this user/idea
        // 3. Count messages where createdAt > lastReadAt
        const unreadStats = await ChatMessage.aggregate([
            { 
                $match: { 
                    ideaId: { $in: ideaIds },
                    senderId: { $ne: userObjectId }
                } 
            },
            {
                $lookup: {
                    from: 'chatreadstatuses',
                    let: { idea: '$ideaId' },
                    pipeline: [
                        { 
                            $match: { 
                                $expr: { 
                                    $and: [
                                        { $eq: ['$ideaId', '$$idea'] },
                                        { $eq: ['$userId', userObjectId] }
                                    ]
                                }
                            } 
                        }
                    ],
                    as: 'status'
                }
            },
            {
                $addFields: {
                    lastReadAt: { 
                        $ifNull: [
                            { $arrayElemAt: ['$status.lastReadAt', 0] }, 
                            new Date(0) 
                        ] 
                    }
                }
            },
            {
                $match: {
                    $expr: { $gt: ['$createdAt', '$lastReadAt'] }
                }
            },
            {
                $group: {
                    _id: '$ideaId',
                    count: { $sum: 1 }
                }
            }
        ]);

        const countsMap = new Map(unreadStats.map(s => [s._id.toString(), s.count]));

        return ideas.map(idea => {
            const ideaObj = idea.toObject ? idea.toObject() : idea;
            return {
                ...ideaObj,
                unreadCount: countsMap.get(idea._id.toString()) || 0
            };
        });
    }

    async getStats() {
        await this.connect();
        const results = await this.model.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const stats = { total: 0, pending: 0, approved: 0, rejected: 0 };
        results.forEach(r => {
            if (r._id === 'pending') stats.pending = r.count;
            if (r._id === 'approved') stats.approved = r.count;
            if (r._id === 'rejected') stats.rejected = r.count;
            stats.total += r.count;
        });
        return stats;
    }

    async getFounderStats(founderId: string) {
        await this.connect();
        const results = await this.model.aggregate([
            { $match: { founderId: new mongoose.Types.ObjectId(founderId) } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const stats = { total: 0, pending: 0, approved: 0, rejected: 0 };
        results.forEach(r => {
            if (r._id === 'pending') stats.pending = r.count;
            if (r._id === 'approved') stats.approved = r.count;
            if (r._id === 'rejected') stats.rejected = r.count;
            stats.total += r.count;
        });
        return stats;
    }

    async processFileUpload(file: File) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) { }

        const filename = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        return `/uploads/${filename}`;
    }

    async findOneIdea(filter: any) {
        await this.connect();
        return this.model.findOne(filter).populate('founderId', 'name email').exec();
    }

    async createIdeaWithFile(ideaData: any, file?: File | null) {
        await this.connect();

        let pitchDeckUrl = '';
        if (file && file.size > 0) {
            pitchDeckUrl = await this.processFileUpload(file);
        }

        const newIdea = new this.model({
            ...ideaData,
            pitchDeckUrl,
            status: 'pending',
            tagline: ideaData.tagline || "",
            aiAnalysis: experimentAIAnalysis(ideaData.aiAnalysis)
        });

        function experimentAIAnalysis(data: any) {
            if (!data) return undefined;
            if (typeof data === 'string') {
                try { return JSON.parse(data); } catch (e) { return undefined; }
            }
            return data;
        }

        return newIdea.save();
    }

    async updateIdeaWithFile(ideaId: string, filter: any, updateData: any, file?: File | null) {
        const idea = await this.model.findOne({ _id: ideaId, ...filter });
        if (!idea) return null;

        if (idea.status !== "pending" && idea.status !== "rejected") {
            throw new Error("Cannot edit processed idea");
        }

        idea.status = 'pending';

        if (updateData.title) idea.title = updateData.title;
        if (updateData.problemStatement) idea.problemStatement = updateData.problemStatement;
        if (updateData.solution) idea.solution = updateData.solution;
        if (updateData.targetMarket) idea.targetMarket = updateData.targetMarket;
        if (updateData.techStack) idea.techStack = updateData.techStack;
        if (updateData.teamDetails) idea.teamDetails = updateData.teamDetails;
        if (updateData.tagline !== undefined) idea.tagline = updateData.tagline;
        
        if (updateData.aiAnalysis) {
            try {
                idea.aiAnalysis = typeof updateData.aiAnalysis === 'string' 
                    ? JSON.parse(updateData.aiAnalysis) 
                    : updateData.aiAnalysis;
            } catch (e) {
            }
        }

        if (file && file.size > 0) {
            idea.pitchDeckUrl = await this.processFileUpload(file);
        }

        return idea.save();
    }

    async deleteIdea(ideaId: string, founderId: string) {
        await this.connect();
        return this.model.findOneAndDelete({ _id: ideaId, founderId }).exec();
    }

    async reviewIdea(ideaId: string, adminId: string, status: 'approved' | 'rejected', comment: string) {
        await this.connect();

        const idea = await this.model.findById(ideaId).populate('founderId', 'name email');
        if (!idea) throw new Error("Idea not found");
        if (idea.status !== "pending") throw new Error("Already reviewed");

        if (status === 'approved') {
            idea.isPublic = true;
            idea.publishedAt = new Date();
            
            // Generate unique slug
            let slug = generateSlug(idea.title);
            let slugExists = await this.model.findOne({ slug });
            let counter = 1;
            while (slugExists) {
                slug = `${generateSlug(idea.title)}-${counter}`;
                slugExists = await this.model.findOne({ slug });
                counter++;
            }
            idea.slug = slug;
        }

        idea.status = status;
        idea.adminComment = comment;
        await idea.save();

        await ReviewLog.create({
            projectId: idea._id,
            adminId,
            action: status,
            comment,
        });

        // Create Notification for the Founder
        await Notification.create({
            userId: idea.founderId._id || idea.founderId,
            title: `Project ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your project "${idea.title}" has been ${status} by the administrator.`,
            type: 'review',
            link: status === 'approved' ? `/founder/ideas/${idea._id}` : '/founder/ideas',
            metadata: {
                projectId: idea._id,
                status: status
            }
        });

        // Send Email Notification
        if (idea.founderId && idea.founderId.email) {
            const htmlMessage = getIdeaStatusEmailTemplate(
                idea.founderId.name || 'Founder',
                idea.title,
                status,
                comment
            );
            await sendEmail({
                email: idea.founderId.email,
                subject: `Your startup idea "${idea.title}" has been ${status}`,
                message: htmlMessage // Assuming our sendEmail function can use this as html, let's verify sendEmail options
            });
        }

        return idea;
    }

    async updateStatus(ideaId: string, status: string, adminComment?: string) {
        await this.connect();
        return this.model.findByIdAndUpdate(ideaId, { status, adminComment }, { returnDocument: 'after' }).exec();
    }

    async analyzeIdeaWithAI(ideaIdOrData: string | any, founderId: string) {
        let idea: any;
        let isPreview = false;

        await this.connect();

        if (typeof ideaIdOrData === 'string') {
            if (!mongoose.Types.ObjectId.isValid(ideaIdOrData) || !mongoose.Types.ObjectId.isValid(founderId)) {
                throw new Error("Invalid idea or founder ID format");
            }

            idea = await this.model.findOne({
                _id: new mongoose.Types.ObjectId(ideaIdOrData),
                founderId: new mongoose.Types.ObjectId(founderId)
            });

            if (!idea) throw new Error("Project idea not found or you don't have access to it.");
        } else {
            idea = ideaIdOrData;
            isPreview = true;
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("AI API Key is missing in environment variables.");

        const prompt = `
            You are a startup evaluator.
            Analyze the following startup idea and return a strictly formatted JSON object. 
            
            Idea Details:
            Title: ${idea.title}
            Problem Statement: ${idea.problemStatement}
            Solution: ${idea.solution}
            Target Market: ${idea.targetMarket}
            Tech Stack: ${Array.isArray(idea.techStack) ? idea.techStack.join(', ') : (idea.techStack || 'Not specified')}
            
            Expected JSON format:
            {
                "ideaQuality": "A short, crisp paragraph evaluating the strength and viability of the idea. Make important words bold.",
                "autoImprovementSuggestions": ["Suggestion 1", "Suggestion 2"], // Make important words bold.
                "marketValidationSummary": "A concise summary of the market size, competitors, or validation approach. Make important words bold.",
                "score": 85
            }
        `;

        try {
            const { text, modelUsed } = await callAiWithFallback({
                prompt,
                apiKey,
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const analysisData = JSON.parse(cleanJson);
 
            const aiAnalysisData = {
                score: analysisData.score || 70,
                ideaQuality: analysisData.ideaQuality || analysisData.quality || analysisData.evaluation || "No evaluation provided.",
                autoImprovementSuggestions: analysisData.autoImprovementSuggestions || analysisData.suggestions || analysisData.improvements || [],
                marketValidationSummary: analysisData.marketValidationSummary || analysisData.validation || analysisData.marketSummary || "No validation summary provided.",
                analyzedAt: new Date()
            };

            if (!isPreview) {
                const updatedIdea = await this.model.findByIdAndUpdate(
                    new mongoose.Types.ObjectId(ideaIdOrData),
                    { $set: { aiAnalysis: aiAnalysisData } },
                    { returnDocument: 'after' }
                ).exec();

                if (!updatedIdea) throw new Error("Failed to save analysis results to database");
                return updatedIdea.aiAnalysis;
            }

            return aiAnalysisData;
        } catch (error: any) {
            console.error("Founder AI Analysis Error:", error);
            throw new Error(error.message || "AI Service failure. Please try again later.");
        }
    }
    async analyzeIdeaForAdmin(ideaId: string, adminId: string) {
        await this.connect();

        const idea = await this.model.findById(ideaId).populate('founderId', 'name email');
        if (!idea) throw new Error("Project idea not found.");

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("AI API Key is missing.");

        const prompt = `
            You are a professional Venture Capitalist and Startup Evaluator.
            Deeply analyze the following startup idea for an internal administrative review.
            Be critical, objective, and provide structured insights to help the admin decide whether to approve or reject this idea.
            
            Idea Details:
            Title: ${idea.title}
            Problem: ${idea.problemStatement}
            Solution: ${idea.solution}
            Target Market: ${idea.targetMarket}
            Tech Stack: ${Array.isArray(idea.techStack) ? idea.techStack.join(', ') : (idea.techStack || 'Not specified')}
            Team: ${idea.teamDetails}
            
            Expected JSON format:
            {
                "score": 82, // 0-100 Investor Readiness Score
                "evaluation": "A concise and crisp executive summary (maximum 3-4 sentences) evaluating feasibility and market-fit. Bold important keywords.",
                "recommendations": "One or two short, actionable sentences for the admin.",
                "risks": ["Maximum 3 most critical risks"],
                "opportunities": ["Maximum 3 most significant opportunities"]
            }
        `;

        try {
            const { text, modelUsed } = await callAiWithFallback({
                prompt,
                apiKey,
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });


            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const analysisData = JSON.parse(cleanJson);

            const adminAiAnalysisData = {
                score: analysisData.score || 50,
                evaluation: analysisData.evaluation || "No detailed evaluation provided. Provided main points.",
                recommendations: analysisData.recommendations || [],
                risks: analysisData.risks || [],
                opportunities: analysisData.opportunities || [],
                analyzedAt: new Date()
            };

            const updatedIdea = await this.model.findByIdAndUpdate(
                ideaId,
                { $set: { adminAiAnalysis: adminAiAnalysisData } },
                { returnDocument: 'after' }
            ).exec();

            return updatedIdea.adminAiAnalysis;
        } catch (error: any) {
            throw new Error(error.response?.data?.error?.message || error.message || "AI Service failure");
        }
    }

    async getPublicIdeas(params: { search?: string, category?: string, sort?: string }) {
        await this.connect();
        const query: any = { isPublic: true };

        if (params.search) {
            query.$or = [
                { title: { $regex: params.search, $options: 'i' } },
                { tagline: { $regex: params.search, $options: 'i' } }
            ];
        }

        if (params.category && params.category !== 'All') {
            query.targetMarket = { $regex: params.category, $options: 'i' };
        }

        let sort: any = { publishedAt: -1 };
        if (params.sort === 'trending') sort = { views: -1 };
        if (params.sort === 'top-rated') sort = { 'aiAnalysis.score': -1 };

        return this.model.find(query)
            .select('title tagline targetMarket aiAnalysis.score views publishedAt slug founderId')
            .populate('founderId', 'name')
            .sort(sort)
            .limit(20)
            .exec();
    }

    async getPublicIdeaBySlug(slug: string, options: { increment?: boolean } = { increment: true }) {
        await this.connect();
        const idea = await this.model.findOne({ slug, isPublic: true })
            .select('-documents -adminAiAnalysis -adminComment')
            .populate('founderId', 'name')
            .exec();
        
        if (idea && options.increment) {
            // Background increment 
            this.model.findByIdAndUpdate(idea._id, { $inc: { views: 1 } }).exec().catch(console.error);
        }
        
        return idea;
    }
}

export const ideaService = new IdeaService();
