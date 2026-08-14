const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const { runMigrations } = require('./migrations');
const { initMysql, getPool } = require('./mysql-db');

let db;
let dbPath;
let isMysqlActive = false;

async function initDatabase() {
  // Check if user configured MySQL credentials in settings file
  const configPath = path.join(app.getPath('userData'), 'mysql-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const mysqlConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (mysqlConfig.enabled) {
        const success = await initMysql(mysqlConfig);
        if (success) {
          isMysqlActive = true;
          console.log('Successfully connected to MySQL database server.');
          return;
        }
      }
    } catch (e) {
      console.warn('MySQL config load error:', e.message);
    }
  }

  // Fallback to offline sql.js SQLite
  isMysqlActive = false;
  let wasmPath;
  if (app.isPackaged) {
    wasmPath = path.join(process.resourcesPath, 'sql-wasm.wasm');
  } else {
    wasmPath = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  }

  const SQL = await initSqlJs({
    locateFile: () => wasmPath
  });

  dbPath = path.join(app.getPath('userData'), 'smartfinance.db');

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');
  runMigrations(db);
  saveDatabase();
}

function getDb() {
  if (isMysqlActive) return null; // Uses MySQL pool
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

function saveDatabase() {
  if (isMysqlActive || !db || !dbPath) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function getIsMysqlActive() {
  return isMysqlActive;
}

module.exports = {
  initDatabase,
  getDb,
  saveDatabase,
  getIsMysqlActive
};
