import { NextResponse } from 'next/server';
import { UserService } from '@/business/services/UserService';

const userService = new UserService();

export async function GET() {
    try {
        const users = await userService.getAllUsers();
        return NextResponse.json({ users });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const success = await userService.deleteUser(parseInt(id));
        
        const result = { success, error: success ? undefined : 'Failed to delete user' };

        if (result.success) {
            return NextResponse.json({ success: true, message: 'User deleted successfully' });
        } else {
            return NextResponse.json({ error: result.error || 'Failed to delete user' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
