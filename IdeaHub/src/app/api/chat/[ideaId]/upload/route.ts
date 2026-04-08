import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth-server';
import { ProjectIdea } from '@/models/ProjectIdea';
import connectDB from '@/lib/db';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ''
});

export async function POST(
    req: NextRequest,
    context: { params: { ideaId: string } }
) {
    try {
        const auth = await getAuth(req);
        if (!auth) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const params = await context.params;
        const { ideaId } = params;

        await connectDB();
        const idea = await ProjectIdea.findById(ideaId);

        if (!idea) {
            return NextResponse.json({ message: "Idea not found" }, { status: 404 });
        }

        if (auth.role !== 'admin' && idea.founderId.toString() !== auth.userId) {
            return NextResponse.json({ message: 'Forbidden: Access denied' }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file || file.size === 0) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        const MAX_FILE_SIZE = 5 * 1024 * 1024; 
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ message: "File exceeds 5MB limit" }, { status: 400 });
        }

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ message: "Invalid file type. Only JPG, PNG, PDF, and DOC are allowed." }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const extension = file.name.split('.').pop() || '';
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
        
        const uploadResponse = await new Promise<any>((resolve, reject) => {
            imagekit.upload({
                file: buffer,
                fileName: filename,
                folder: '/chat_attachments'
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        const attachment = {
            url: uploadResponse.url,
            name: file.name,
            type: file.type,
            size: file.size
        };

        return NextResponse.json(attachment);

    } catch (error) {
        console.error('Error uploading chat attachment:', error);
        return NextResponse.json({ message: 'Error uploading document' }, { status: 500 });
    }
}
