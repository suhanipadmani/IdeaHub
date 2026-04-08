import { withAuth } from '@/lib/auth-middleware';
import { userService } from '@/services/user.service';
import { updateProfileSchema } from '@/lib/validations/auth';
import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';

export const PUT = withAuth(async (req, { auth }) => {
    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    const user = await userService.findById(auth.userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (validatedData.email && validatedData.email !== user.email) {
        const existingUser = await userService.findByEmail(validatedData.email);
        if (existingUser) {
            throw new AppError('Email already in use', 400);
        }
    }

    const updatedUser = await userService.updateProfile(auth.userId, validatedData);

    return NextResponse.json({
        id: updatedUser!._id,
        name: updatedUser!.name,
        email: updatedUser!.email,
        role: updatedUser!.role,
        createdAt: updatedUser!.createdAt
    });
});
