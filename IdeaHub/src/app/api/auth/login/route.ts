import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services/user.service';
import { loginSchema } from '@/lib/validations/auth';
import { handleError } from '@/lib/errors';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = loginSchema.parse(body);

        const result = await userService.login(validatedData.email, validatedData.password);

        if (!result) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const { user, token } = result;

        return NextResponse.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token
        });
    } catch (error) {
        return handleError(error);
    }
}
