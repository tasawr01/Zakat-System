import { NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';
import { UserService } from '@/business/services/UserService';

const userService = new UserService();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, email, password, role } = body;

        if (!username || !email || !password || !role) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (!['DONOR', 'BENEFICIARY'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            );
        }

        // Create user in Oracle DB
        const newUser = await userService.createUser(username, email, password, role);

        const token = createToken(newUser as any);

        const response = NextResponse.json({
            success: true,
            message: 'User created successfully',
            user: newUser,
            token,
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
        });

        return response;
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    }
}
