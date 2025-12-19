const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function fixIdentity() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER || 'C##Zakat',
            password: process.env.ORACLE_PASSWORD || 'zakat123',
            connectString: process.env.ORACLE_CONN_STR || 'localhost:1521/XE'
        });

        console.log('Resetting Identity Column Start Value...');
        // Altering to start with 100 to be safe
        await connection.execute(
            `ALTER TABLE USERS_PUBLIC MODIFY (USER_ID GENERATED AS IDENTITY (START WITH 100))`
        );
        console.log('Identity reset successfully.');

    } catch (err) {
        console.error('Fix Error:', err);
    } finally {
        if (connection) await connection.close();
    }
}

fixIdentity();
