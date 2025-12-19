const oracledb = require('oracledb');

async function run() {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: 'C##Zakat',
            password: 'zakat123',
            connectString: 'localhost:1521/XE'
        });

        console.log('Connected!');

        const tables = ['DONATIONS', 'BENEFICIARIES', 'USERS'];

        for (const table of tables) {
            console.log(`\n--- Columns for ${table} ---`);
            try {
                const result = await connection.execute(
                    `SELECT column_name, data_type FROM user_tab_columns WHERE table_name = '${table}'`
                );
                // Note: oracledb returns rows as arrays by default unless outFormat is set to OBJECT
                // But here we didn't set it in the script, so it returns arrays.
                // However, the previous output showed "undefined", which suggests we tried to access properties on an array.
                // Let's print the raw row to be sure.
                result.rows.forEach(row => console.log(JSON.stringify(row)));
            } catch (e) {
                console.error(`Error fetching columns for ${table}:`, e.message);
            }
        }

    } catch (err) {
        console.error('Connection failed:', err);
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
