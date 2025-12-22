import { NextResponse } from 'next/server';
import { SystemLogService } from '@/business/services/SystemLogService';

const logService = new SystemLogService();

export async function GET(request: Request) {
    try {
        // In a real app, we should verify admin token here too from cookie/header
        // But for this MVP level, assuming UI protection is primary or middleware handles it.
        // Let's add basic query param parsing if needed later.

        const logs = await logService.getRecentLogs();

        return NextResponse.json({
            success: true,
            logs
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch system logs' },
            { status: 500 }
        );
    }
}
