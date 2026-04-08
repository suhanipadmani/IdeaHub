import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services/user.service';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { handleError } from '@/lib/errors';
import sendEmail from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = forgotPasswordSchema.parse(body);

        const resetToken = await userService.forgotPassword(email);

        // Create reset URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the following link: \n\n ${frontendUrl}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                email,
                subject: 'Password reset token',
                message
            });

            return NextResponse.json({ message: 'Email sent' });
        } catch (error) {
            console.error('Email sending failed:', error);
            // We don't throw here to avoid leaking user existence if that's a concern, 
            // but in this app we already throw "User not found" in service.
            // However, we should undo the token if email fails.
            const user = await userService.findByEmail(email);
            if (user) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpire = undefined;
                await user.save();
            }
            return NextResponse.json({ message: 'Email could not be sent' }, { status: 500 });
        }
    } catch (error) {
        return handleError(error);
    }
}
