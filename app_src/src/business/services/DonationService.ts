import { DonationRepository } from '../../database/repositories/DonationRepository';
import { query } from '../../database/connection'; // Direct query for stats if needed, or better, move to specific StatsRepo

// For simplicity, we can reuse DonationRepo or create StatsRepo
const donationRepo = new DonationRepository();

export class DonationService {
    async getPendingDonations() {
        return await donationRepo.getPendingDonations();
    }

    async createDonation(donorId: number, amount: number, type: string) {
        // Business logic: check limits?
        return await donationRepo.createDonation(donorId, amount, type);
    }

    async getDonationsByDonor(donorId?: number) {
        return await donationRepo.getDonations(donorId);
    }

    async getStats() {
        return await donationRepo.getStats();
    }
}
