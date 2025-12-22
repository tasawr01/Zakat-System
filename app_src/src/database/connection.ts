import oracledb from 'oracledb';










oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;


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

export { oracledb }; 
