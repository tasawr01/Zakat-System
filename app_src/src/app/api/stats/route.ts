import { NextResponse } from 'next/server';
import { DonationService } from '@/business/services/DonationService';

const donationService = new DonationService();

export async function GET() {
    try {
        const data = await donationService.getStats() as any;



        return NextResponse.json({
            totalDonations: data.totalDonations || 0,
            beneficiariesHelped: data.beneficiariesHelped || 0,
            partnerNGOs: data.partnerNGOs || 50,
            successRate: 99.9 // Hardcoded for now as it's a calculated metric
        });
    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
