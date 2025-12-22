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

        // Test Sequence using USERS table (easiest/safest)
        const timestamp = Date.now();
        const testUser = `test_log_${timestamp}`;
        const testEmail = `test_${timestamp}@example.com`;

        // Check trigger status
        const trgStatus = await connection.execute(
            `SELECT TRIGGER_NAME, STATUS FROM USER_TRIGGERS WHERE TRIGGER_NAME = 'TRG_LOG_USERS'`
        );
        if (trgStatus.rows.length > 0) {
            console.log('Trigger Status:', JSON.stringify(trgStatus.rows[0]));
        } else {
            console.error('Trigger TRG_LOG_USERS not found!');
        }

        // 1. INSERT
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


        // 2. UPDATE
        console.log(`\nTesting UPDATE for ID ${userId}...`);
        await connection.execute(
            `UPDATE USERS_PUBLIC SET ROLE = 'BENEFICIARY' WHERE USER_ID = :1`,
            [userId],
            { autoCommit: true }
        );
        console.log('User role updated to BENEFICIARY');

        await checkLog(connection, 'USERS_PUBLIC', 'UPDATE', userId);


        // 3. DELETE
        console.log(`\nTesting DELETE for ID ${userId}...`);
        // Note: Delete on USERS_PUBLIC might fail if there are child records, but our test user is fresh.
        // However, we might have trigger on USERS_SECURE/DONATIONS cascading?
        // Let's delete carefully.
        // If we only touch USERS_PUBLIC it should be fine as no child records created.
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
    // Wait a brief moment for trigger commit if async/latency (unlikely in same session but good practice if checking from different connection)
    // Here we are in same connection (mostly), but triggers run in same transaction.
    // We autoCommitted above, so we can select freely.

    // Select latest log for this record
    const result = await connection.execute(
        `SELECT LOG_ID, DETAILS, ACTION_TIMESTAMP FROM SYSTEM_LOGS 
         WHERE TABLE_NAME = :1 AND ACTION_TYPE = :2 AND RECORD_ID = :3
         ORDER BY LOG_ID DESC FETCH FIRST 1 ROWS ONLY`,
        [table, action, recordId]
    );

    if (result.rows.length > 0) {
        const row = result.rows[0];
        // Handle array or object
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
