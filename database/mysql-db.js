const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let pool = null;
let currentConfig = null;

/**
 * Test MySQL connection parameters
 */
async function testConnection(config) {
  try {
    const conn = await mysql.createConnection({
      host: config.host || 'localhost',
      port: config.port || 3306,
      user: config.user || 'root',
      password: config.password || '',
      database: config.database || 'smartfinance',
      connectTimeout: 4000
    });
    await conn.ping();
    await conn.end();
    return { success: true, message: 'MySQL Connection Successful!' };
  } catch (err) {
    return { success: false, message: `MySQL Connection Failed: ${err.message}` };
  }
}

/**
 * Initialize MySQL Connection Pool
 */
async function initMysql(config) {
  try {
    currentConfig = {
      host: config.host || 'localhost',
      port: config.port || 3306,
      user: config.user || 'root',
      password: config.password || '',
      database: config.database || 'smartfinance',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    pool = mysql.createPool(currentConfig);
    // Test connection
    const conn = await pool.getConnection();
    conn.release();

    // Auto-run schema setup
    await initMysqlSchema(pool);
    return true;
  } catch (err) {
    console.warn('MySQL init failed, fallback to sql.js SQLite:', err.message);
    pool = null;
    return false;
  }
}

async function initMysqlSchema(pool) {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) return;
    const sqlScript = fs.readFileSync(schemaPath, 'utf8');
    const statements = sqlScript
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE'));

    for (const stmt of statements) {
      try {
        await pool.query(stmt);
      } catch (e) {
        // Ignore table already exists errors
      }
    }
  } catch (e) {
    console.error('MySQL schema init error:', e.message);
  }
}

function getPool() {
  return pool;
}

module.exports = {
  testConnection,
  initMysql,
  getPool
};
