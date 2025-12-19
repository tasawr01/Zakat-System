const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function verifyAuthLogic() {
    let connection;
    try {
        console.log('Connecting to Oracle DB...');
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER || 'C##Zakat',
            password: process.env.ORACLE_PASSWORD || 'zakat123',
            connectString: process.env.ORACLE_CONN_STR || 'localhost:1521/XE'
        });
        console.log('Connected!');

        const testUser = {
            username: `test_donor_${Date.now()}`,
            email: `donor_${Date.now()}@test.com`,
            password: 'password123',
            role: 'DONOR'
        };

        console.log(`Creating test user: ${testUser.username}`);

        // 1. Simulate createUser
        const resultPublic = await connection.execute(
            `INSERT INTO USERS_PUBLIC (USERNAME, EMAIL, ROLE) 
             VALUES (:1, :2, :3) 
             RETURNING USER_ID INTO :4`,
            {
                1: testUser.username,
                2: testUser.email,
                3: testUser.role,
                4: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            },
            { autoCommit: false }
        );

        console.log('OutBinds:', JSON.stringify(resultPublic.outBinds));

        let userId;
        if (resultPublic.outBinds && resultPublic.outBinds['4']) {
            userId = resultPublic.outBinds['4'][0];
        } else if (Array.isArray(resultPublic.outBinds)) {
            userId = resultPublic.outBinds[0][0];
        } else {
            // Fallback for some drivers/configs
            userId = Object.values(resultPublic.outBinds)[0][0];
        }

        console.log(`User created with ID: ${userId}`);

        if (!userId) throw new Error('Failed to retrieve User ID');

        // Insert into USERS_SECURE
        await connection.execute(
            `INSERT INTO USERS_SECURE (USER_ID, PASSWORD_HASH) 
             VALUES (:1, :2)`,
            [userId, testUser.password],
            { autoCommit: false }
        );

        await connection.commit();
        console.log('User committed to DB.');

        // 2. Simulate authenticateUser
        console.log('Testing authentication query...');
        const authResult = await connection.execute(
            `SELECT p.USER_ID, p.USERNAME, p.EMAIL, p.ROLE, s.PASSWORD_HASH
             FROM USERS_PUBLIC p
             JOIN USERS_SECURE s ON p.USER_ID = s.USER_ID
             WHERE p.EMAIL = :1`,
            [testUser.email],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (authResult.rows.length > 0) {
            const user = authResult.rows[0];
            console.log('User found in DB:', user);
            if (user.PASSWORD_HASH === testUser.password) {
                console.log('SUCCESS: Password matches!');
            } else {
                console.error('FAILURE: Password mismatch');
            }
        } else {
            console.error('FAILURE: User not found after insertion');
        }

        // 3. Clean up
        console.log('Cleaning up test user...');
        await connection.execute(
            `DELETE FROM USERS_PUBLIC WHERE USER_ID = :1`,
            [userId],
            { autoCommit: true }
        );
        console.log('Cleanup complete.');

    } catch (err) {
        console.error('Verification Error:', err);
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) { console.error(e); }
        }
    }
}

verifyAuthLogic();
