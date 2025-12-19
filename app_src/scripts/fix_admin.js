require('dotenv').config({ path: '.env.local' });
const oracledb = require('oracledb');

async function fixAdminUser() {
    let connection;
    try {
        console.log('Connecting...');
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        const email = 'admin@example.com';
        const password = 'admin';

        // 1. Get User ID
        const result = await connection.execute(
            `SELECT USER_ID FROM USERS_PUBLIC WHERE EMAIL = :1`,
            [email]
        );

        if (result.rows.length === 0) {
            console.log('Admin user not found in PUBLIC table.');
            return;
        }

        const userId = result.rows[0][0];
        console.log(`Found Admin ID: ${userId}`);

        // 2. Check if exists in SECURE
        const resultSecure = await connection.execute(
            `SELECT * FROM USERS_SECURE WHERE USER_ID = :1`,
            [userId]
        );

        if (resultSecure.rows.length > 0) {
            console.log('User already has secure credentials. Updating password...');
            await connection.execute(
                `UPDATE USERS_SECURE SET PASSWORD_HASH = :1 WHERE USER_ID = :2`,
                [password, userId],
                { autoCommit: true }
            );
        } else {
            console.log('User missing credentials. Inserting...');
            await connection.execute(
                `INSERT INTO USERS_SECURE (USER_ID, PASSWORD_HASH) VALUES (:1, :2)`,
                [userId, password],
                { autoCommit: true }
            );
        }

        console.log('SUCCESS: Admin credentials repaired.');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (err) {
        console.error('Error fixing admin:', err);
    } finally {
        if (connection) await connection.close();
    }
}

fixAdminUser();
