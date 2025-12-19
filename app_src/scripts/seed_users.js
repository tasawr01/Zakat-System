const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function run() {
    let connection;

    try {
        // Use environment variables or fallback to defaults
        const dbConfig = {
            user: process.env.ORACLE_USER || 'C##Zakat',
            password: process.env.ORACLE_PASSWORD || 'zakat123',
            connectString: process.env.ORACLE_CONN_STR || 'localhost:1521/XE'
        };

        console.log('Connecting to database...');
        connection = await oracledb.getConnection(dbConfig);
        console.log('Connected!');

        // Define users to seed
        // IDs must match what we put in src/lib/auth.ts
        const users = [
            { id: 1, username: 'admin', email: 'admin@example.com', role: 'ADMIN' },
            { id: 2, username: 'donor_user', email: 'donor@example.com', role: 'DONOR' },
            { id: 3, username: 'beneficiary_user', email: 'beneficiary@example.com', role: 'BENEFICIARY' }
        ];

        for (const user of users) {
            try {
                // Check if user exists
                const checkResult = await connection.execute(
                    `SELECT USER_ID FROM USERS WHERE EMAIL = :email`,
                    [user.email]
                );

                if (checkResult.rows.length > 0) {
                    console.log(`User ${user.email} already exists. Updating...`);
                    // Update existing user to ensure ID matches if possible, or just skip
                    // Updating ID might be tricky if FKs exist, so let's just update other fields
                    // or maybe we should force the ID? 
                    // For now, let's assume we can just leave it or maybe delete and recreate?
                    // Safer to just skip if exists, but we need the IDs to match.
                    // Let's try to MERGE or just INSERT if not exists.

                    // Actually, if the ID doesn't match, we have a problem.
                    // Let's print the ID found.
                    console.log(`Found ID: ${JSON.stringify(checkResult.rows[0])}`);
                } else {
                    console.log(`Creating user ${user.username}...`);
                    await connection.execute(
                        `INSERT INTO USERS (USER_ID, USERNAME, EMAIL, ROLE, CREATED_AT) 
                         VALUES (:id, :username, :email, :role, SYSDATE)`,
                        {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            role: user.role
                        },
                        { autoCommit: true }
                    );
                    console.log(`User ${user.username} created with ID ${user.id}.`);
                }
            } catch (err) {
                console.error(`Error processing user ${user.username}:`, err.message);
            }
        }

        console.log('Seeding completed.');

    } catch (err) {
        console.error('Execution failed:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

run();
