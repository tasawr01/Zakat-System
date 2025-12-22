import { DonationRepository } from '../../database/repositories/DonationRepository';
import { query } from '../../database/connection'; 


const donationRepo = new DonationRepository();

export class DonationService {
    async getPendingDonations() {
        return await donationRepo.getPendingDonations();
    }

    async createDonation(donorId: number, amount: number, type: string) {
        
        return await donationRepo.createDonation(donorId, amount, type);
    }

    async getDonationsByDonor(donorId?: number) {
        return await donationRepo.getDonations(donorId);
    }

    async getStats() {
        return await donationRepo.getStats();
    }
}
