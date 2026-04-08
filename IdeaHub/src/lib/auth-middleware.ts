import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from './auth-server';
import { AppError, handleError } from './errors';

type Role = 'admin' | 'founder' | 'any';

export type AuthContext = {
    userId: string;
    role: string;
};

export type AuthenticatedHandler = (
    req: NextRequest,
    context: { params: any; auth: AuthContext }
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler, requiredRole: Role = 'any') {
    return async (req: NextRequest, { params }: { params: any }) => {
        try {
            const auth = await getAuth(req);

            if (!auth) {
                throw new AppError('Unauthorized', 401);
            }

            if (requiredRole !== 'any' && auth.role !== requiredRole) {
                throw new AppError('Forbidden: Access denied', 403);
            }

            return await handler(req, { params, auth });
        } catch (error) {
            return handleError(error);
        }
    };
}
