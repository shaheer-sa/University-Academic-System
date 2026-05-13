const oracledb = require('oracledb');
const path = require('path');

// Use Thick mode for Oracle 11G support
try {
    oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_11_2' });
} catch (err) {
    console.log('⚠️  Note: Oracle Instant Client not found. Using Thin mode.');
}

// Oracle connection configuration
const dbConfig = {
    user: 'UNIVERSITY_SYSTEM',
    password: '123',
    connectString: 'localhost:1521/XE',
    externalAuth: false
};

// Connection pool
let pool = null;

async function initializePool() {
    try {
        pool = await oracledb.createPool({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString,
            poolMin: 2,
            poolMax: 10,
            poolIncrement: 1
        });
        console.log('✅ Oracle connection pool created');
    } catch (err) {
        console.error('❌ Error creating connection pool:');
        console.error('   Connection String:', dbConfig.connectString);
        console.error('   User:', dbConfig.user);
        console.error('   Error Details:', err.message);
        console.error('\n?? TROUBLESHOOTING:');
        console.error('   1. Is Oracle 11G database running?');
        console.error('   2. Check connection string: localhost:1521/xe or localhost:1521/ORCL');
        console.error('   3. Verify username and password in System_Settings/database.js');
        console.error('   4. Try: sqlplus "UNIVERSITY ACADEMIC SYSTEM"/123@localhost:1521/xe');
    }
}

async function getConnection() {
    if (!pool) {
        await initializePool();
    }
    return await pool.getConnection();
}

async function executeQuery(query, params = []) {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(query, params, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        // Normalize keys to lowercase for easier JS access
        if (result.rows) {
            result.rows = result.rows.map(row => {
                const newRow = {};
                for (let key in row) {
                    newRow[key.toLowerCase()] = row[key];
                }
                return newRow;
            });
        }

        // Auto-commit for DML operations: INSERT, UPDATE, DELETE, MERGE
        const upperQuery = query.trim().toUpperCase();
        if (upperQuery.startsWith('INSERT') || upperQuery.startsWith('UPDATE') || 
            upperQuery.startsWith('DELETE') || upperQuery.startsWith('MERGE')) {
            await connection.commit();
        }
        
        return result;
    } catch (err) {
        console.error('❌ Database query error:', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('❌ Error closing connection:', err);
            }
        }
    }
}

async function executeTransaction(queries) {
    let connection;
    try {
        connection = await getConnection();
        const results = [];
        
        for (const { sql, params } of queries) {
            const result = await connection.execute(sql, params, { outFormat: oracledb.OUT_FORMAT_OBJECT });
            
            // Normalize keys to lowercase
            if (result.rows) {
                result.rows = result.rows.map(row => {
                    const newRow = {};
                    for (let key in row) {
                        newRow[key.toLowerCase()] = row[key];
                    }
                    return newRow;
                });
            }
            results.push(result);
        }
        
        await connection.commit();
        return results;
    } catch (err) {
        if (connection) {
            try {
                await connection.rollback();
                console.log('⚠️  Transaction rolled back due to error');
            } catch (rollbackErr) {
                console.error('❌ Rollback error:', rollbackErr);
            }
        }
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('❌ Error closing connection:', err);
            }
        }
    }
}

module.exports = {
    getConnection,
    executeQuery,
    executeTransaction,
    initializePool
};
