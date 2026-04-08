import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { ProjectIdea } from '@/models/ProjectIdea';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
    try {
        const { error } = await requireAdmin(req);
        if (error) return error;

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const tech = searchParams.get('tech');
        const search = searchParams.get('search');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const filter: any = {};

        // Status Filter
        if (status) {
            if (status.includes(',')) {
                filter.status = { $in: status.split(',') };
            } else {
                filter.status = status;
            }
        }

        // Tech Stack Filter
        if (tech) {
            filter.techStack = { $regex: new RegExp(tech, 'i') };
        }

        // Search Filter (Title)
        if (search) {
            filter.title = { $regex: new RegExp(search, 'i') };
        }

        // Date Range Filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        await connectDB();

        const totalDocs = await ProjectIdea.countDocuments(filter);
        const projects = await ProjectIdea.find(filter)
            .populate("founderId", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            docs: projects,
            totalDocs,
            limit,
            page,
            totalPages: Math.ceil(totalDocs / limit)
        });
    } catch (error) {
        console.error('Error fetching admin projects:', error);
        return NextResponse.json({ message: "Error fetching projects" }, { status: 500 });
    }
}
