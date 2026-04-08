import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { ProjectIdea } from '@/models/ProjectIdea';
import { getAuth } from '@/lib/auth-server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await getAuth(req);
        if (!auth) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();
        const idea = await ProjectIdea.findOne({ _id: id, founderId: auth.userId });
        
        if (!idea) {
            return NextResponse.json({ message: "Idea not found or unauthorized" }, { status: 404 });
        }

        const formData = await req.formData();
        const file = formData.get('document') as File | null;
        const name = formData.get('name') as string;

        if (!file || file.size === 0) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const filename = `${Date.now()}-${file.name}`;
        await writeFile(path.join(uploadDir, filename), buffer);

        idea.documents.push({
            name: name || file.name,
            url: `/uploads/${filename}`,
            uploadedAt: new Date()
        });

        await idea.save();
        return NextResponse.json(idea);

    } catch (error) {
        console.error('Error uploading document:', error);
        return NextResponse.json({ message: 'Error uploading document' }, { status: 500 });
    }
}
