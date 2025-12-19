import { query, execute } from '../connection';

export class DonationRepository {
    async getPendingDonations() {
        return await query(
            `SELECT 
                d.DONATION_ID as "id", 
                d.AMOUNT as "amount", 
                d.DONATION_TYPE as "type", 
                TO_CHAR(d.DONATION_DATE, 'YYYY-MM-DD') as "date", 
                u.USERNAME as "donorName", 
                d.DONOR_ID as "donorId"
             FROM DONATIONS d
             JOIN USERS_PUBLIC u ON d.DONOR_ID = u.USER_ID
             WHERE d.STATUS = 'PENDING'`
        );
    }

    async updateStatus(id: number, status: string) {
        const result = await execute(
            `UPDATE DONATIONS SET STATUS = :status WHERE DONATION_ID = :id`,
            [status, id]
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }

    async createDonation(donorId: number, amount: number, type: string) {
        const result = await execute(
            `INSERT INTO DONATIONS (DONOR_ID, AMOUNT, DONATION_TYPE, STATUS) 
             VALUES (:1, :2, :3, 'PENDING')`,
            [donorId, amount, type]
        );
        return result;
    }

    async getDonations(donorId?: number) {
        if (donorId) {
            return await query('SELECT * FROM DONATIONS WHERE DONOR_ID = :1', [donorId]);
        } else {
            return await query('SELECT * FROM DONATIONS ORDER BY DONATION_DATE DESC');
        }
    }

    async getStats() {
        const stats = await query(
            `SELECT 
                (SELECT SUM(AMOUNT) FROM DONATIONS) as "totalDonations",
                (SELECT COUNT(*) FROM BENEFICIARIES WHERE ELIGIBILITY_STATUS = 'APPROVED') as "beneficiariesHelped",
                (SELECT COUNT(DISTINCT DONOR_ID) FROM DONATIONS) as "totalDonors",
                50 as "partnerNGOs"
             FROM DUAL`
        );
        return stats[0] || {};
    }
}
