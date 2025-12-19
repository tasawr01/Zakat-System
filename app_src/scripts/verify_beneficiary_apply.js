require('dotenv').config({ path: '.env.local' });
const oracledb = require('oracledb');

async function verifyBeneficiaryApply() {
    let connection;
    try {
        console.log('Connecting...');
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        // 1. Create Test Beneficiary User
        const testUserEmail = `ben_test_${Date.now()}@example.com`;
        console.log(`Creating user: ${testUserEmail}`);

        const resultCreate = await connection.execute(
            `INSERT INTO USERS_PUBLIC (USERNAME, EMAIL, ROLE) VALUES (:1, :2, 'BENEFICIARY') RETURN USER_ID INTO :3`,
            [`Ben_${Date.now()}`, testUserEmail, { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }],
            { autoCommit: true }
        );
        const userId = resultCreate.outBinds[0][0];
        console.log(`User ID: ${userId}`);

        // 2. Simulate Form Data
        const region = 'Punjab';
        const income = '50000';
        const familyMembers = '5';
        const userIdStr = String(userId); // FormData sends strings

        console.log('Inserting beneficiary...');
        const result = await connection.execute(
            `INSERT INTO BENEFICIARIES (REGION, INCOME_LEVEL, FAMILY_MEMBERS, ELIGIBILITY_STATUS, USER_ID) 
             VALUES (:1, :2, :3, 'PENDING', :4)`,
            [region, parseFloat(income), parseInt(familyMembers), parseInt(userIdStr)],
            { autoCommit: true }
        );

        console.log('Success!', result);

        // CLEANUP
        console.log('Cleaning up...');
        await connection.execute(`DELETE FROM BENEFICIARIES WHERE USER_ID = :1`, [userId]);
        await connection.execute(`DELETE FROM USERS_PUBLIC WHERE USER_ID = :1`, [userId]);
        console.log('Done.');

    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        if (connection) await connection.close();
    }
}

verifyBeneficiaryApply();
