import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services/user.service';
import { getAuth } from '@/lib/auth-server';
import { withAuth } from '@/lib/auth-middleware';
import { AppError } from '@/lib/errors';

export const GET = withAuth(async (req, { auth }) => {
    const user = await userService.findById(auth.userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return NextResponse.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    });
});
