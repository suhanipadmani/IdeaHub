import { withAuth } from '@/lib/auth-middleware';
import { userService } from '@/services/user.service';
import { changePasswordSchema } from '@/lib/validations/auth';
import { NextResponse } from 'next/server';

export const PUT = withAuth(async (req, { auth }) => {
    const body = await req.json();
    const validatedData = changePasswordSchema.parse(body);

    await userService.changePassword(auth.userId, validatedData.currentPassword, validatedData.newPassword);

    return NextResponse.json({ message: 'Password updated successfully' });
});
