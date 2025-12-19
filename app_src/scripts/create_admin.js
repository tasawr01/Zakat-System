require('dotenv').config({ path: '.env.local' });
const oracledb = require('oracledb');

async function createAdminUser() {
    let connection;
    try {
        console.log('Connecting...');
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        const email = 'admin@example.com';
        const password = 'admin'; // Simple password for demo
        const username = 'AdminUser';

        console.log(`Creating admin: ${email}`);

        // 1. Insert into USERS_PUBLIC
        const resultPublic = await connection.execute(
            `INSERT INTO USERS_PUBLIC (USERNAME, EMAIL, ROLE) 
             VALUES (:1, :2, 'ADMIN') 
             RETURNING USER_ID INTO :3`,
            {
                1: username,
                2: email,
                3: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            },
            { autoCommit: false }
        );

        const userId = (resultPublic.outBinds)[3][0];

        // 2. Insert into USERS_SECURE
        await connection.execute(
            `INSERT INTO USERS_SECURE (USER_ID, PASSWORD_HASH) 
             VALUES (:1, :2)`,
            [userId, password],
            { autoCommit: false }
        );

        await connection.commit();
        console.log(`\nSUCCESS: Admin created!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (err) {
        console.error('Error creating admin:', err);
    } finally {
        if (connection) await connection.close();
    }
}

createAdminUser();
