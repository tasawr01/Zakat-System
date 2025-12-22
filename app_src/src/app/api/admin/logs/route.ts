import { NextResponse } from 'next/server';
import { SystemLogService } from '@/business/services/SystemLogService';

const logService = new SystemLogService();

export async function GET(request: Request) {
    try {
        
        
        

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
