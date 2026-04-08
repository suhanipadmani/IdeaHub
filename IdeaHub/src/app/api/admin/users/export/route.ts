import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
    try {
        const { error } = await requireAdmin(req);
        if (error) return error;

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const role = searchParams.get('role');
        
        const filter: any = {};
        if (role) {
            filter.role = role;
        }

        if (search) {
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { name: { $regex: new RegExp(search, 'i') } },
                    { email: { $regex: new RegExp(search, 'i') } }
                ]
            });
        }

        await connectDB();
        const users = await User.find(filter).select("-password").sort({ createdAt: -1 });

        let csv = 'Name,Email,Role,Joined Date\n';
        users.forEach(user => {
            const joinedDate = new Date(user.createdAt).toLocaleDateString();
            csv += `"${user.name}","${user.email}","${user.role}","${joinedDate}"\n`;
        });

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=users_export.csv'
            }
        });
    } catch (error) {
        console.error('Error exporting users:', error);
        return NextResponse.json({ message: 'Error exporting users' }, { status: 500 });
    }
}
