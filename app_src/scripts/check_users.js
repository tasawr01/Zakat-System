const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function run() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER || 'C##Zakat',
            password: process.env.ORACLE_PASSWORD || 'zakat123',
            connectString: process.env.ORACLE_CONN_STR || 'localhost:1521/XE'
        });

        const countResult = await connection.execute('SELECT COUNT(*) as CNT FROM USERS_PUBLIC');
        console.log('USERS_PUBLIC Count:', countResult.rows[0]);

        const result = await connection.execute(
            `SELECT * FROM USERS_PUBLIC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        console.log('USERS_PUBLIC Rows:', JSON.stringify(result.rows, null, 2));

        // Check FK on DONATIONS
        const fkResult = await connection.execute(
            `SELECT CONSTRAINT_NAME, R_CONSTRAINT_NAME, DELETE_RULE 
             FROM USER_CONSTRAINTS 
             WHERE TABLE_NAME = 'DONATIONS' AND CONSTRAINT_TYPE = 'R'`
        );
        console.log('DONATIONS FKs:', fkResult.rows);

        // Get the table referenced by the FK
        if (fkResult.rows.length > 0) {
            const rConstraintName = fkResult.rows[0][1]; // R_CONSTRAINT_NAME
            const refTableResult = await connection.execute(
                `SELECT TABLE_NAME FROM USER_CONSTRAINTS WHERE CONSTRAINT_NAME = :1`,
                [rConstraintName]
            );
            console.log('Referenced Table:', refTableResult.rows);
        }

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) await connection.close();
    }
}

run();
