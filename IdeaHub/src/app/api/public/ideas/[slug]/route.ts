import { NextResponse } from 'next/server';
import { ideaService } from '@/services/idea.service';

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = await params;
        const idea = await ideaService.getPublicIdeaBySlug(slug);

        if (!idea) {
            return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
        }

        return NextResponse.json(idea);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
