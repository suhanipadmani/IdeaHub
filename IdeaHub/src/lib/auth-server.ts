import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

export interface AuthResponse {
    userId: string;
    role: string;
}

export async function getAuth(req: NextRequest): Promise<AuthResponse | null> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return null;
    }

    return decoded as AuthResponse;
}

export async function requireAuth(req: NextRequest) {
    const auth = await getAuth(req);
    if (!auth) {
        return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }), auth: null };
    }
    return { error: null, auth };
}

export async function requireAdmin(req: NextRequest) {
    const { error, auth } = await requireAuth(req);
    if (error) return { error, auth: null };

    if (auth.role !== 'admin') {
        return { error: NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 }), auth: null };
    }

    return { error: null, auth };
}
