import { UserRepository } from '../../database/repositories/UserRepository';

const userRepo = new UserRepository();

export class UserService {
    async createUser(username: string, email: string, passwordHash: string, role: string) {
        
        return await userRepo.createUser(username, email, passwordHash, role);
    }

    async authenticate(email: string, passwordHash: string) {
        const user = await userRepo.findUserByEmail(email) as any;
        if (!user) return null;

        
        
        if (user.PASSWORD_HASH === passwordHash) {
            return {
                id: user.USER_ID,
                username: user.USERNAME,
                email: user.EMAIL,
                role: user.ROLE
            };
        }
        return null;
    }

    async getAllUsers() {
        return await userRepo.getAllUsers();
    }

    async deleteUser(userId: number) {
        return await userRepo.deleteUser(userId);
    }
}
