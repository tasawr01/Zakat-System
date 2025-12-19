import { NextResponse } from 'next/server';
import { AdminService } from '@/business/services/AdminService';

const adminService = new AdminService();

export async function GET() {
    try {
        const { pendingDonations, pendingBeneficiaries } = await adminService.getPendingItems();
        return NextResponse.json({
            success: true,
            pendingDonations,
            pendingBeneficiaries,
            totalPending: pendingDonations.length + pendingBeneficiaries.length
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch pending items' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, type, id, status } = body;

        if (!action || !type || !id || !status) {
            return NextResponse.json(
                { error: 'Action, type, id, and status are required' },
                { status: 400 }
            );
        }

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json(
                { error: 'Status must be APPROVED or REJECTED' },
                { status: 400 }
            );
        }

        let success = false;
        if (type === 'donation') {
            success = await adminService.updateDonationStatus(id, status) as boolean;
        } else if (type === 'beneficiary') {
            success = await adminService.updateBeneficiaryStatus(id, status) as boolean;
        } else {
            return NextResponse.json(
                { error: 'Type must be donation or beneficiary' },
                { status: 400 }
            );
        }

        if (success) {
            return NextResponse.json({
                success: true,
                message: `${type} ${status.toLowerCase()} successfully`
            });
        } else {
            return NextResponse.json(
                { error: `${type} not found` },
                { status: 404 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
