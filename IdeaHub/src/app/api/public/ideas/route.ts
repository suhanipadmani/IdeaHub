import { NextResponse } from 'next/server';
import { ideaService } from '@/services/idea.service';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const sort = searchParams.get('sort') || 'latest';

        const ideas = await ideaService.getPublicIdeas({ search, category, sort });
        return NextResponse.json(ideas);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
