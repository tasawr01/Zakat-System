import { BeneficiaryRepository } from '../../database/repositories/BeneficiaryRepository';
import { execute, query } from '../../database/connection';

const beneficiaryRepo = new BeneficiaryRepository();

export class BeneficiaryService {
    async createBeneficiary(region: string, income: number, familyMembers: number, userId: number, documentBuffer: Buffer | null, mimeType: string | null, requestedAmount: number) {
        const result = await execute(
            `INSERT INTO BENEFICIARIES (REGION, INCOME_LEVEL, FAMILY_MEMBERS, ELIGIBILITY_STATUS, USER_ID, DOCUMENTS, DOCUMENT_MIME_TYPE, REQUESTED_AMOUNT) 
             VALUES (:1, :2, :3, 'PENDING', :4, :5, :6, :7)`,
            [region, income, familyMembers, userId, documentBuffer, mimeType, requestedAmount]
        );
        return result;
    }

    async getBeneficiariesByUser(userId: number) {
        return await query(
            `SELECT 
                BENEFICIARY_ID as "id",
                REGION as "region",
                INCOME_LEVEL as "income",
                FAMILY_MEMBERS as "familyMembers",
                ELIGIBILITY_STATUS as "status",
                TO_CHAR(CREATED_AT, 'YYYY-MM-DD') as "date",
                REQUESTED_AMOUNT as "requestedAmount"
            FROM BENEFICIARIES
            WHERE USER_ID = :1 ORDER BY CREATED_AT DESC`,
            [userId]
        );
    }

    async getAllBeneficiaries() {
        return await query(
            `SELECT 
                BENEFICIARY_ID as "id",
                REGION as "region",
                INCOME_LEVEL as "income",
                FAMILY_MEMBERS as "familyMembers",
                ELIGIBILITY_STATUS as "status",
                TO_CHAR(CREATED_AT, 'YYYY-MM-DD') as "date",
                REQUESTED_AMOUNT as "requestedAmount"
            FROM BENEFICIARIES
            ORDER BY CREATED_AT DESC`
        );
    }

    async getDocument(id: number) {
        return await query(
            `SELECT DOCUMENTS, DOCUMENT_MIME_TYPE 
             FROM BENEFICIARIES 
             WHERE BENEFICIARY_ID = :1`,
            [id]
        );
    }
}
