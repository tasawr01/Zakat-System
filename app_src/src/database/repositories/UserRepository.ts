import { query, execute, oracledb, getConnection } from '../connection';

export class UserRepository {
    async createUser(username: string, email: string, passwordHash: string, role: string) {
        let connection;
        try {
            connection = await getConnection();

            const resultPublic = await connection.execute(
                `INSERT INTO USERS_PUBLIC (USERNAME, EMAIL, ROLE) 
                 VALUES (:1, :2, :3) 
                 RETURNING USER_ID INTO :4`,
                {
                    1: username,
                    2: email,
                    3: role,
                    4: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                },
                { autoCommit: false }
            );

            const userId = (resultPublic.outBinds as any)[4][0];

            await connection.execute(
                `INSERT INTO USERS_SECURE (USER_ID, PASSWORD_HASH) 
                 VALUES (:1, :2)`,
                [userId, passwordHash],
                { autoCommit: false }
            );

            await connection.commit();

            return { id: userId, username, email, role };
        } catch (err) {
            if (connection) {
                try { await connection.rollback(); } catch (e) { console.error('Rollback error', e); }
            }
            throw err;
        } finally {
            if (connection) {
                try { await connection.close(); } catch (e) { console.error('Close error', e); }
            }
        }
    }

    async findUserByEmail(email: string) {
        const result = await query(
            `SELECT p.USER_ID, p.USERNAME, p.EMAIL, p.ROLE, s.PASSWORD_HASH
             FROM USERS_PUBLIC p
             JOIN USERS_SECURE s ON p.USER_ID = s.USER_ID
             WHERE p.EMAIL = :1`,
            [email]
        );
        return result[0] || null;
    }

    async getAllUsers() {
        return await query(
            `SELECT 
                USER_ID as "id",
                USERNAME as "username",
                EMAIL as "email",
                ROLE as "role",
                TO_CHAR(CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') as "createdAt"
             FROM USERS_PUBLIC
             ORDER BY CREATED_AT DESC`
        );
    }

    async deleteUser(userId: number) {
        
        await execute(`DELETE FROM USERS_SECURE WHERE USER_ID = :1`, [userId]);
        await execute(`DELETE FROM DONATIONS WHERE DONOR_ID = :1`, [userId]);
        await execute(`DELETE FROM BENEFICIARIES WHERE USER_ID = :1`, [userId]);

        const result = await execute(
            `DELETE FROM USERS_PUBLIC WHERE USER_ID = :1`,
            [userId]
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }
}
