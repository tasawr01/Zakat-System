require('dotenv').config({ path: '.env.local' });
const oracledb = require('oracledb');

async function getAdminCredentials() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        const result = await connection.execute(
            `SELECT p.USERNAME, p.EMAIL, s.PASSWORD_HASH
             FROM USERS_PUBLIC p
             JOIN USERS_SECURE s ON p.USER_ID = s.USER_ID
             WHERE p.ROLE = 'ADMIN'`
        );

        if (result.rows.length > 0) {
            console.log('Found Admin User(s):');
            result.rows.forEach(row => {
                console.log(`Email: ${row[1]}, Password: ${row[2]}`);
            });
        } else {
            console.log('No Admin users found.');
            // Optional: Create one if needed, but for now just report.
        }

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) await connection.close();
    }
}

getAdminCredentials();
