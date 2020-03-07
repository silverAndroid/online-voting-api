const { Pool } = require('pg');

const IsolationLevel = {
    'ReadUncommitted': 'READ UNCOMMITTED',
    'ReadCommitted': 'READ COMMITTED',
    'RepeatableRead': 'REPEATABLE READ',
    'Serializable': 'SERIALIZABLE',
};

const db = new Pool();
db.transaction = async (isolationLevel, body) => {
    const client = await db.connect();

    try {
        await client.query(`BEGIN TRANSACTION ISOLATION LEVEL ${isolationLevel};`);
        await Promise.resolve(body(client));
        await client.query('COMMIT;');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

// pools will use environment variables
// for connection information
module.exports = { db, IsolationLevel };
