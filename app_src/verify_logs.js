const oracledb = require('oracledb');

async function run() {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: 'C##Zakat',
            password: 'zakat123',
            connectString: 'localhost:1521/XE'
        });

        console.log('Connected to database');

        
        const timestamp = Date.now();
        const testUser = `test_log_${timestamp}`;
        const testEmail = `test_${timestamp}@example.com`;

        
        const trgStatus = await connection.execute(
            `SELECT TRIGGER_NAME, STATUS FROM USER_TRIGGERS WHERE TRIGGER_NAME = 'TRG_LOG_USERS'`
        );
        if (trgStatus.rows.length > 0) {
            console.log('Trigger Status:', JSON.stringify(trgStatus.rows[0]));
        } else {
            console.error('Trigger TRG_LOG_USERS not found!');
        }

        
        console.log(`\nTesting INSERT for ${testUser}...`);
        const resultInsert = await connection.execute(
            `INSERT INTO USERS_PUBLIC (USERNAME, EMAIL, ROLE) VALUES (:1, :2, 'DONOR') RETURNING USER_ID INTO :3`,
            [
                testUser,
                testEmail,
                { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            ],
            { autoCommit: true }
        );
        const userId = resultInsert.outBinds[0][0];
        console.log(`User created with ID: ${userId}`);

        await checkLog(connection, 'USERS_PUBLIC', 'INSERT', userId);


        
        console.log(`\nTesting UPDATE for ID ${userId}...`);
        await connection.execute(
            `UPDATE USERS_PUBLIC SET ROLE = 'BENEFICIARY' WHERE USER_ID = :1`,
            [userId],
            { autoCommit: true }
        );
        console.log('User role updated to BENEFICIARY');

        await checkLog(connection, 'USERS_PUBLIC', 'UPDATE', userId);


        
        console.log(`\nTesting DELETE for ID ${userId}...`);
        
        
        
        
        await connection.execute(
            `DELETE FROM USERS_PUBLIC WHERE USER_ID = :1`,
            [userId],
            { autoCommit: true }
        );
        console.log('User deleted');

        await checkLog(connection, 'USERS_PUBLIC', 'DELETE', userId);

        console.log('\nVerification Successful!');

    } catch (err) {
        console.error('Error:', err);
        const fs = require('fs');
        fs.writeFileSync('error.log', util.format(err));
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

async function checkLog(connection, table, action, recordId) {
    
    
    

    
    const result = await connection.execute(
        `SELECT LOG_ID, DETAILS, ACTION_TIMESTAMP FROM SYSTEM_LOGS 
         WHERE TABLE_NAME = :1 AND ACTION_TYPE = :2 AND RECORD_ID = :3
         ORDER BY LOG_ID DESC FETCH FIRST 1 ROWS ONLY`,
        [table, action, recordId]
    );

    if (result.rows.length > 0) {
        const row = result.rows[0];
        
        const details = Array.isArray(row) ? row[1] : row.DETAILS;
        console.log(`[PASS] Log found: ${details}`);
    } else {
        console.error(`[FAIL] No log found for ${action} on ${table} ID ${recordId}`);
    }
}

run().catch(err => {
    console.error('Unhandled Error:', err);
    process.exit(1);
});
