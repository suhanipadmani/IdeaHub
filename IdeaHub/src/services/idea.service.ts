import { ProjectIdea } from '@/models/ProjectIdea';
import { ReviewLog } from '@/models/ReviewLog';
import { BaseService } from './base.service';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import axios from 'axios';

export class IdeaService extends BaseService<any> {
    constructor() {
        super(ProjectIdea);
    }

    async findIdeas(filter: any = {}, sort: any = { createdAt: -1 }) {
        await this.connect();
        return this.model.find(filter)
            .populate('founderId', 'name email')
            .sort(sort)
            .exec();
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

        const idea = await this.model.findById(ideaId);
        if (!idea) throw new Error("Idea not found");
        if (idea.status !== "pending") throw new Error("Already reviewed");

        idea.status = status;
        idea.adminComment = comment;
        await idea.save();

        await ReviewLog.create({
            projectId: idea._id,
            adminId,
            action: status,
            comment,
        });

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

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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
            const response = await axios.post(url, {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const result = response.data;
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error("No response content from AI API");
            }

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
            const backendError = error.response?.data?.error?.message || error.message;
            const statusCode = error.response?.status;
            
            if (statusCode === 429) {
                throw new Error("AI Quota Exceeded. Please try again in a few minutes.");
            }
 
            throw new Error(backendError || "AI Service failure");
        }
    }
    async analyzeIdeaForAdmin(ideaId: string, adminId: string) {
        await this.connect();

        const idea = await this.model.findById(ideaId).populate('founderId', 'name email');
        if (!idea) throw new Error("Project idea not found.");

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("AI API Key is missing.");

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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
            const response = await axios.post(url, {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("No response content from AI API");

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
}

export const ideaService = new IdeaService();
