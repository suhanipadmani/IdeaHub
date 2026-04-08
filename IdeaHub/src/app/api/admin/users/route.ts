import { withAuth } from '@/lib/auth-middleware';
import { userService } from '@/services/user.service';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (req) => {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    const filter: any = {};
    if (role) filter.role = role;

    if (search) {
        filter.$and = filter.$and || [];
        filter.$and.push({
            $or: [
                { name: { $regex: new RegExp(search, 'i') } },
                { email: { $regex: new RegExp(search, 'i') } }
            ]
        });
    }

    const result = await userService.findUsers(filter, {
        page,
        limit,
        select: "-password",
        sort: { createdAt: -1 }
    });

    return NextResponse.json(result);
}, 'admin');
