const oracledb = require('oracledb');

async function run() {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: 'C##Zakat',
            password: 'zakat123',
            connectString: 'localhost:1521/XE'
        });

        console.log('Connected to Oracle DB');

        try {
            await connection.execute(
                `ALTER TABLE BENEFICIARIES ADD REQUESTED_AMOUNT NUMBER DEFAULT 0`,
                [],
                { autoCommit: true }
            );
            console.log('Added REQUESTED_AMOUNT column to BENEFICIARIES table.');
        } catch (err) {
            if (err.message && err.message.includes('ORA-01430')) {
                console.log('Column REQUESTED_AMOUNT already exists.');
            } else {
                throw err;
            }
        }

    } catch (err) {
        console.error('Error:', err);
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

run();
