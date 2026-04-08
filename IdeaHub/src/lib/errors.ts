import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export function handleError(error: unknown) {
    console.error('API Error:', error);

    if (error instanceof AppError) {
        return NextResponse.json(
            { message: error.message },
            { status: error.statusCode }
        );
    }

    if (error instanceof ZodError) {
        const errors = error.issues.map(iss => ({
            field: iss.path.join('.'),
            message: iss.message
        }));
        return NextResponse.json(
            { message: 'Validation failed', errors },
            { status: 400 }
        );
    }

    // Default to 500
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
        { message: process.env.NODE_ENV === 'development' ? message : 'Internal server error' },
        { status: 500 }
    );
}

export const createErrorResponse = (message: string, status: number) => {
    return NextResponse.json({ message }, { status });
};
