require('dotenv').config({ path: '.env.local' });
const oracledb = require('oracledb');

async function checkBeneficiariesSchema() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        // Check columns
        const result = await connection.execute(
            `SELECT COLUMN_NAME, DATA_TYPE, DATA_DEFAULT 
             FROM USER_TAB_COLUMNS 
             WHERE TABLE_NAME = 'BENEFICIARIES'`
        );
        console.log('Columns:', result.rows);

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) await connection.close();
    }
}

checkBeneficiariesSchema();
