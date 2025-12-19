const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function checkConstraints() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER || 'C##Zakat',
            password: process.env.ORACLE_PASSWORD || 'zakat123',
            connectString: process.env.ORACLE_CONN_STR || 'localhost:1521/XE'
        });

        const result = await connection.execute(
            `SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE, SEARCH_CONDITION 
             FROM USER_CONSTRAINTS 
             WHERE TABLE_NAME = 'USERS_PUBLIC'`
        );
        console.log('Constraints:', result.rows);

        // Also check columns
        const cols = await connection.execute(
            `SELECT COLUMN_NAME, CONSTRAINT_NAME 
             FROM USER_CONS_COLUMNS 
             WHERE TABLE_NAME = 'USERS_PUBLIC'`
        );
        console.log('Constraint Columns:', cols.rows);

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) await connection.close();
    }
}

checkConstraints();
