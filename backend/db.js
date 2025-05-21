const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'backend.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
  }
});

// Helper function to run queries
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Database query error:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Helper function to run a single-result query
function getOne(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        console.error('Database query error:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Helper function to run an execution query (INSERT, UPDATE, DELETE)
function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        console.error('Database execution error:', err.message);
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// Check if the database exists and has the required tables
async function checkDatabase() {
  try {
    const tables = await runQuery(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('aws_accounts', 'ec2_instances', 'rds_instances', 'eks_clusters', 'lambda_functions')
    `);
    
    if (tables.length < 5) {
      console.warn('Not all required tables exist in the database. Please run the data collection script first.');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking database:', error);
    return false;
  }
}

module.exports = {
  db,
  runQuery,
  getOne,
  run,
  checkDatabase
};