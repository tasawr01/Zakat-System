import { query } from '../connection';

export class SystemLogRepository {
    async getLogs(limit: number = 50) {
        return await query(
            `SELECT 
                LOG_ID as "id",
                TABLE_NAME as "tableName",
                ACTION_TYPE as "actionType",
                RECORD_ID as "recordId",
                TO_CHAR(ACTION_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS') as "timestamp",
                DETAILS as "details"
             FROM SYSTEM_LOGS
             ORDER BY ACTION_TIMESTAMP DESC
             FETCH FIRST :1 ROWS ONLY`,
            [limit]
        );
    }
}
