const oracledb = require('oracledb');

async function run() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: 'C##Zakat',
            password: 'zakat123',
            connectString: 'localhost:1521/XE'
        });

        console.log('Connected');

        const user = 'test_simple_' + Date.now();
        const email = user + '@example.com';

        // Simple insert without returning
        await connection.execute(
            `INSERT INTO USERS_PUBLIC (USERNAME, EMAIL, ROLE) VALUES (:1, :2, 'DONOR')`,
            [user, email],
            { autoCommit: true }
        );
        console.log('Insert success');

    } catch (err) {
        console.error('Insert failed:', err);
    } finally {
        if (connection) await connection.close();
    }
}
run();
