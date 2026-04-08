import { withAuth } from '@/lib/auth-middleware';
import { userService } from '@/services/user.service';
import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';

export const DELETE = withAuth(async (req, { auth }) => {
    const user = await userService.deleteAccount(auth.userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return NextResponse.json({ message: 'Account deleted successfully' });
});
