import { DonationRepository } from '../../database/repositories/DonationRepository';
import { BeneficiaryRepository } from '../../database/repositories/BeneficiaryRepository';

const donationRepo = new DonationRepository();
const beneficiaryRepo = new BeneficiaryRepository();

export class AdminService {
    async getPendingItems() {
        const [pendingDonations, pendingBeneficiaries] = await Promise.all([
            donationRepo.getPendingDonations(),
            beneficiaryRepo.getPendingBeneficiaries()
        ]);

        return {
            pendingDonations,
            pendingBeneficiaries
        };
    }

    async updateDonationStatus(id: number, status: string) {
        return await donationRepo.updateStatus(id, status);
    }

    async updateBeneficiaryStatus(id: number, status: string) {
        if (status === 'APPROVED') {
            const { query } = require('../../database/connection');

            // 1. Get Beneficiary Amount
            const beneficiaryResult = await query(
                `SELECT REQUESTED_AMOUNT FROM BENEFICIARIES WHERE BENEFICIARY_ID = :1`,
                [id]
            );
            const requestedAmount = beneficiaryResult[0]?.REQUESTED_AMOUNT || 0;

            if (requestedAmount > 0) {
                // 2. Check Available Funds
                const stats = await this.getAnalytics();
                const totalDonated = (stats.summary as any).totalDonations || 0;

                // Calculate already distributed
                const distributedResult = await query(
                    `SELECT SUM(REQUESTED_AMOUNT) as "distributed" FROM BENEFICIARIES WHERE ELIGIBILITY_STATUS = 'APPROVED'`
                );
                const totalDistributed = distributedResult[0]?.distributed || 0;

                const available = totalDonated - totalDistributed;

                if (available < requestedAmount) {
                    throw new Error(`Insufficient funds. Available: ${available}, Requested: ${requestedAmount}`);
                }
            }
        }
        return await beneficiaryRepo.updateStatus(id, status);
    }

    async getAnalytics() {
        // This functionality was previously checking directly via query in api/admin/analytics
        // We can move it here or to a repo. For minimal changes, let's keep it here using new connection helpers 
        // OR better, instantiate repos to get data. But DonationRepo doesn't have all methods yet (grouped by month etc).
        // Let's delegate to Repositories to add these methods.

        // However, for speed in this turn, I will import query here in service 
        // to migrate the logic from route.ts, then later refactor to strict Repo methods.
        // Actually, let's just use the logic from route.ts here.
        const { query } = require('../../database/connection'); // Dynamic import to avoid cycles or strict separation issues if any

        // 1. Donations by Month and Type
        const donationsByMonth = await query(
            `SELECT 
                TO_CHAR(DONATION_DATE, 'YYYY-MM') as "month",
                DONATION_TYPE as "type",
                SUM(AMOUNT) as "amount"
             FROM DONATIONS
             GROUP BY TO_CHAR(DONATION_DATE, 'YYYY-MM'), DONATION_TYPE
             ORDER BY "month" DESC`
        );

        // 2. Distribution by Region and Status
        const distributionByRegion = await query(
            `SELECT 
                REGION as "region",
                ELIGIBILITY_STATUS as "status",
                COUNT(*) as "count",
                SUM(INCOME_LEVEL) as "amount" 
             FROM BENEFICIARIES
             GROUP BY REGION, ELIGIBILITY_STATUS
             ORDER BY REGION`
        );

        // 3. Summary Stats (Reusing logic from DonationService/Repo could be better but sticking to route logic)
        const summaryStats = await query(
            `SELECT 
                (SELECT NVL(SUM(AMOUNT), 0) FROM DONATIONS WHERE STATUS = 'APPROVED') as "totalDonations",
                (SELECT COUNT(*) FROM DONATIONS WHERE STATUS = 'APPROVED') as "totalDonationsCount",
                (SELECT COUNT(DISTINCT DONOR_ID) FROM DONATIONS) as "totalDonors",
                (SELECT COUNT(*) FROM BENEFICIARIES) as "totalBeneficiaries",
                (SELECT NVL(SUM(REQUESTED_AMOUNT), 0) FROM BENEFICIARIES WHERE ELIGIBILITY_STATUS = 'APPROVED') as "totalDistributedAmount",
                (SELECT COUNT(*) FROM BENEFICIARIES WHERE ELIGIBILITY_STATUS = 'APPROVED') as "totalDistributedCount",
                5 as "activeCampaigns", 
                (SELECT COUNT(*) FROM BENEFICIARIES WHERE ELIGIBILITY_STATUS = 'PENDING') + 
                (SELECT COUNT(*) FROM DONATIONS WHERE STATUS = 'PENDING') as "pendingApprovals"
             FROM DUAL`
        );

        return {
            donationsByMonth,
            distributionByRegion,
            summary: summaryStats[0] || {}
        };
    }
}
