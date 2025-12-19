import { query, execute } from '../connection';

export class BeneficiaryRepository {
    async getPendingBeneficiaries() {
        return await query(
            `SELECT 
                b.BENEFICIARY_ID as "id", 
                u.USERNAME as "userName", 
                b.USER_ID as "userId", 
                b.REGION as "region", 
                b.INCOME_LEVEL as "income", 
                b.FAMILY_MEMBERS as "familyMembers", 
                CASE WHEN b.DOCUMENTS IS NOT NULL THEN 1 ELSE 0 END as "hasDocument",
                TO_CHAR(b.CREATED_AT, 'YYYY-MM-DD') as "date"
             FROM BENEFICIARIES b
             JOIN USERS_PUBLIC u ON b.USER_ID = u.USER_ID
             WHERE b.ELIGIBILITY_STATUS = 'PENDING'`
        );
    }

    async updateStatus(id: number, status: string) {
        const result = await execute(
            `UPDATE BENEFICIARIES SET ELIGIBILITY_STATUS = :status WHERE BENEFICIARY_ID = :id`,
            [status, id]
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }

    // Add missing method if usage moved to Service directly but should stay here
    // In step 555, I put INSERT in Service. I should probably move it here for consistency, 
    // but for this task I will just update wherever it is.
    // Let's check Service content.
}
