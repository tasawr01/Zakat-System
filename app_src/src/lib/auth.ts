
export interface User {
    id: string;
    email: string;
    username: string;
    role: 'ADMIN' | 'DONOR' | 'BENEFICIARY';
}

export interface Session {
    user: User;
}


export function createToken(user: User): string {
    const payload = {
        user,
        iat: Date.now(),
        exp: Date.now() + 24 * 60 * 60 * 1000, 
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
}


export function verifyToken(token: string): Session | null {
    try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        if (decoded.exp && decoded.exp < Date.now()) {
            return null;
        }
        return { user: decoded.user };
    } catch {
        return null;
    }
}
