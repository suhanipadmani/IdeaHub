import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services/user.service';
import { registerSchema } from '@/lib/validations/auth';
import { handleError } from '@/lib/errors';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = registerSchema.parse(body);

        const { user, token } = await userService.register(validatedData);

        return NextResponse.json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token
        }, { status: 201 });
    } catch (error) {
        return handleError(error);
    }
}
