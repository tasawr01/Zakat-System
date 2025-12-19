import oracledb from 'oracledb';

// Initialize Oracle Client (optional, depending on environment)
// try {
//   oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_19_8' });
// } catch (err) {
//   console.error('Whoops!');
//   console.error(err);
//   process.exit(1);
// }

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Ensure BLOBs are fetched as Buffers by default
oracledb.fetchAsBuffer = [oracledb.BLOB];

const dbConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONN_STR,
    poolMin: 10,
    poolMax: 10,
    poolIncrement: 0
};

export async function getConnection() {
    return await oracledb.getConnection(dbConfig);
}

export async function query(sql: string, params: any[] = []) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(sql, params);
        return result.rows || [];
    } catch (err) {
        console.error('Database query error:', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

export async function execute(sql: string, params: any[] = [], autoCommit = true) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(sql, params, { autoCommit });
        return {
            rowsAffected: result.rowsAffected,
            lastRowid: result.lastRowid,
            // Note: oracledb doesn't return generated keys as easily as some other drivers
            // for simple inserts without RETURNING clause. 
            // If you need the ID, you should use a RETURNING clause in your SQL.
            // Also exposing outBinds if needed for RETURNING retrieval
            outBinds: result.outBinds
        };
    } catch (err) {
        console.error('Database execution error:', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

export { oracledb }; // Re-export if needed
