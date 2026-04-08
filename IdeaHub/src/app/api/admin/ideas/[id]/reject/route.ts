import { withAuth } from '@/lib/auth-middleware';
import { ideaService } from '@/services/idea.service';
import { adminReviewSchema } from '@/lib/validations/idea';
import { NextResponse } from 'next/server';

export const PUT = withAuth(async (req, { params, auth }) => {
    const { id } = await params;
    const { comment } = await req.json();
    
    adminReviewSchema.parse({ comment });

    await ideaService.reviewIdea(id, auth.userId, 'rejected', comment);

    return NextResponse.json({ message: "Project rejected" });
}, 'admin');
