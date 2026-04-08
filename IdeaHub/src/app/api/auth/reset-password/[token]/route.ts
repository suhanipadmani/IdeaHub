import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services/user.service';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { handleError } from '@/lib/errors';
import { generateToken } from '@/lib/jwt';

export async function PUT(
    req: NextRequest,
    { params }: { params: { token: string } }
) {
    try {
        const body = await req.json();
        const { password } = resetPasswordSchema.parse(body);
        const { token } = await params;
        
        const user = await userService.resetPassword(token, password);

        const authToken = generateToken(user._id.toString(), user.role);

        return NextResponse.json({
            success: true,
            token: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        return handleError(error);
    }
}
