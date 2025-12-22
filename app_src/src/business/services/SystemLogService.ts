import { SystemLogRepository } from '../../database/repositories/SystemLogRepository';

const logRepo = new SystemLogRepository();

export class SystemLogService {
    async getRecentLogs(limit: number = 50) {
        return await logRepo.getLogs(limit);
    }
}
