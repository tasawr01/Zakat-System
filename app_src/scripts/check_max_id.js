const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function checkMaxId() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER || 'C##Zakat',
            password: process.env.ORACLE_PASSWORD || 'zakat123',
            connectString: process.env.ORACLE_CONN_STR || 'localhost:1521/XE'
        });

        const result = await connection.execute('SELECT MAX(USER_ID) as MAX_ID FROM USERS_PUBLIC');
        console.log('Max ID:', result.rows[0]);

        const allUsers = await connection.execute('SELECT USER_ID FROM USERS_PUBLIC ORDER BY USER_ID');
        console.log('All IDs:', allUsers.rows);

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) await connection.close();
    }
}

checkMaxId();
