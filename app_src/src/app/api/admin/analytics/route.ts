import { NextResponse } from 'next/server';
import { AdminService } from '@/business/services/AdminService';

const adminService = new AdminService();

export async function GET() {
    try {
        const { donationsByMonth, distributionByRegion, summary } = await adminService.getAnalytics();

        interface SummaryStats {
            totalDonations?: number;
            totalDonationsCount?: number;
            totalDonors?: number;
            totalBeneficiaries?: number;
            totalDistributedCount?: number;
            totalDistributedAmount?: number;
            activeCampaigns?: number;
            pendingApprovals?: number;
        }

        const summaryData = summary as SummaryStats;

        const analyticsData = {
            totalDonations: summaryData.totalDonationsCount || 0,
            totalDonated: summaryData.totalDonations || 0,
            totalDistributed: summaryData.totalDistributedAmount || 0,
            availableFunds: (summaryData.totalDonations || 0) - (summaryData.totalDistributedAmount || 0),
            donationsByMonth: donationsByMonth,
            distributionByRegionAndStatus: distributionByRegion
        };

        return NextResponse.json(analyticsData);
    } catch (error) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
