require('dotenv').config({ path: '.env.local' });
const oracledb = require('oracledb');

async function checkAdminUser() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        const result = await connection.execute(
            `SELECT USERNAME, EMAIL, ROLE FROM USERS_PUBLIC WHERE EMAIL = 'admin@example.com'`
        );

        if (result.rows.length > 0) {
            console.log('User found:', result.rows[0]);
        } else {
            console.log('User not found.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) await connection.close();
    }
}

checkAdminUser();
