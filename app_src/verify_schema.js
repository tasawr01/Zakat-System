const oracledb = require('oracledb');
const fs = require('fs');
const util = require('util');

const logFile = fs.createWriteStream('verify_output.txt', { flags: 'w' });
const logStdout = process.stdout;

console.log = function (...args) {
    const msg = util.format(...args);
    logFile.write(msg + '\n');
    logStdout.write(msg + '\n');
};

async function run() {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: 'C##Zakat',
            password: 'zakat123',
            connectString: 'localhost:1521/XE'
        });

        console.log('Connected to database\n');

        
        console.log('--- 1. Vertical Fragmentation (Users) ---');
        const userTables = await connection.execute(
            `SELECT TABLE_NAME FROM USER_TABLES WHERE TABLE_NAME IN ('USERS_PUBLIC', 'USERS_SECURE')`
        );
        console.log('Tables found:', userTables.rows.flat());

        const userViews = await connection.execute(
            `SELECT VIEW_NAME FROM USER_VIEWS WHERE VIEW_NAME = 'USERS'`
        );
        console.log('Views found:', userViews.rows.length > 0 ? 'USERS' : 'None');

        
        console.log('\n--- 2. Range Partitioning (Donations) ---');
        const partitions = await connection.execute(
            `SELECT PARTITION_NAME 
             FROM USER_TAB_PARTITIONS 
             WHERE TABLE_NAME = 'DONATIONS'
             ORDER BY PARTITION_POSITION`
        );

        if (partitions.rows.length > 0) {
            console.log(`Partitions found for DONATIONS: ${partitions.rows.length}`);
            partitions.rows.forEach(row => {
                const pName = Array.isArray(row) ? row[0] : row.PARTITION_NAME;
                console.log(`- ${pName}`);
            });
        } else {
            console.log('No partitions found for DONATIONS.');
        }

        
        console.log('\n--- 3. Beneficiaries Structure ---');
        const benTable = await connection.execute(
            `SELECT COLUMN_NAME FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'BENEFICIARIES'`
        );
        const benCols = benTable.rows.flat();
        console.log('Columns:', benCols);

        
        const fragTables = await connection.execute(
            `SELECT TABLE_NAME FROM USER_TABLES WHERE TABLE_NAME LIKE 'BENEFICIARIES_%'`
        );
        if (fragTables.rows.length > 0) {
            console.log('Potential fragment tables:', fragTables.rows.flat());
        } else {
            console.log('No physical fragment tables (BENEFICIARIES_*) found.');
        }

        
        console.log('\n--- 4. Indexes ---');
        const indexes = await connection.execute(
            `SELECT INDEX_NAME FROM USER_INDEXES 
             WHERE INDEX_NAME IN ('IDX_DONATIONS_DONOR', 'IDX_BENEFICIARIES_REGION', 'IDX_USERS_EMAIL')`
        );
        console.log('Indexes found:', indexes.rows.flat());

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
