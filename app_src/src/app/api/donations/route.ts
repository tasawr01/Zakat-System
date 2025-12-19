import { NextResponse } from 'next/server';
import { DonationService } from '@/business/services/DonationService';

const donationService = new DonationService();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const donorId = searchParams.get('donorId');

        let donations = await donationService.getDonationsByDonor(donorId ? parseInt(donorId) : undefined);

        // Map database columns (uppercase) to frontend properties (lowercase)
        donations = donations.map((d: any) => ({
            id: d.DONATION_ID,
            amount: d.AMOUNT,
            type: d.DONATION_TYPE,
            date: d.DONATION_DATE,
            status: d.STATUS,
            donorId: d.DONOR_ID
        }));

        return NextResponse.json({ success: true, donations });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
        const { amount, type, donorId, donorName } = body;

        if (!amount || !type || !donorId) {
            return NextResponse.json(
                { error: 'Amount, type, and donorId are required' },
                { status: 400 }
            );
        }

        if (!['ZAKAT', 'SADAQAH', 'GENERAL'].includes(type)) {
            return NextResponse.json(
                { error: 'Invalid donation type' },
                { status: 400 }
            );
        }

        const result = await donationService.createDonation(parseInt(donorId), parseFloat(amount), type);

        return NextResponse.json({
            success: true,
            message: 'Donation submitted successfully for admin review',
            donationId: result.lastRowid
        });
    } catch (error) {
        console.error('Error submitting donation:', error);
        console.error('Request body:', body);
        return NextResponse.json({
            error: 'Failed to submit donation',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
