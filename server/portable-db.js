#!/usr/bin/env node

/**
 * Portable Database for EOL Dashboard
 * Server-side database operations using SQLite for portability
 * Can be moved between servers and merged with other instances
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PortableEOLDatabase {
  constructor(dbPath = null) {
    this.dbPath = dbPath || path.join(__dirname, '../data/eol-portable.db');
    this.ensureDataDir();
    this.db = new Database(this.dbPath);
    this.initializeTables();
  }

  ensureDataDir() {
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  initializeTables() {
    // Create resources table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resourceId TEXT UNIQUE NOT NULL,
        name TEXT,
        service TEXT NOT NULL,
        region TEXT NOT NULL,
        eolDate TEXT,
        eosDate TEXT,
        status TEXT,
        account TEXT NOT NULL,
        type TEXT,
        description TEXT,
        sourceServer TEXT,
        lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT -- JSON string for additional data
      )
    `);

    // Create accounts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        accountId TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#3B82F6',
        description TEXT,
        awsRegion TEXT,
        environment TEXT,
        sourceServer TEXT,
        lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create collection_runs table to track data collection
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS collection_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        accountId TEXT NOT NULL,
        sourceServer TEXT NOT NULL,
        startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        endTime DATETIME,
        resourcesFound INTEGER DEFAULT 0,
        status TEXT DEFAULT 'running',
        errorMessage TEXT
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_resources_account ON resources(account);
      CREATE INDEX IF NOT EXISTS idx_resources_service ON resources(service);
      CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
      CREATE INDEX IF NOT EXISTS idx_resources_eol ON resources(eolDate);
    `);
  }

  // Collection run management
  startCollectionRun(accountId, sourceServer) {
    const stmt = this.db.prepare(`
      INSERT INTO collection_runs (accountId, sourceServer)
      VALUES (?, ?)
    `);
    const result = stmt.run(accountId, sourceServer);
    return result.lastInsertRowid;
  }

  endCollectionRun(runId, resourcesFound, status = 'completed', errorMessage = null) {
    const stmt = this.db.prepare(`
      UPDATE collection_runs 
      SET endTime = CURRENT_TIMESTAMP, resourcesFound = ?, status = ?, errorMessage = ?
      WHERE id = ?
    `);
    stmt.run(resourcesFound, status, errorMessage, runId);
  }

  // Account operations
  addAccount(accountData, sourceServer) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO accounts 
      (accountId, name, color, description, awsRegion, environment, sourceServer)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      accountData.accountId,
      accountData.name,
      accountData.color || '#3B82F6',
      accountData.description || '',
      accountData.awsRegion || 'us-east-1',
      accountData.environment || 'unknown',
      sourceServer
    );
  }

  getAccounts() {
    const stmt = this.db.prepare('SELECT * FROM accounts ORDER BY name');
    return stmt.all();
  }

  // Resource operations
  addResource(resourceData, sourceServer) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO resources 
      (resourceId, name, service, region, eolDate, eosDate, status, account, type, description, sourceServer, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      resourceData.resourceId,
      resourceData.name || '',
      resourceData.service,
      resourceData.region,
      resourceData.eolDate,
      resourceData.eosDate,
      this.calculateStatus(resourceData.eolDate),
      resourceData.account,
      resourceData.type || 'service',
      resourceData.description || '',
      sourceServer,
      JSON.stringify(resourceData.metadata || {})
    );
  }

  addResourcesBulk(resources, sourceServer) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO resources 
      (resourceId, name, service, region, eolDate, eosDate, status, account, type, description, sourceServer, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = this.db.transaction((resources) => {
      for (const resource of resources) {
        stmt.run(
          resource.resourceId,
          resource.name || '',
          resource.service,
          resource.region,
          resource.eolDate,
          resource.eosDate,
          this.calculateStatus(resource.eolDate),
          resource.account,
          resource.type || 'service',
          resource.description || '',
          sourceServer,
          JSON.stringify(resource.metadata || {})
        );
      }
    });
    
    return insertMany(resources);
  }

  getResources(filters = {}) {
    let query = 'SELECT * FROM resources WHERE 1=1';
    const params = [];
    
    if (filters.account) {
      query += ' AND account = ?';
      params.push(filters.account);
    }
    
    if (filters.service) {
      query += ' AND service = ?';
      params.push(filters.service);
    }
    
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters.sourceServer) {
      query += ' AND sourceServer = ?';
      params.push(filters.sourceServer);
    }
    
    query += ' ORDER BY lastUpdated DESC';
    
    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  // Status calculation
  calculateStatus(eolDate) {
    if (!eolDate) return 'unknown';
    
    const eol = new Date(eolDate);
    const now = new Date();
    const diffDays = Math.ceil((eol - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 90) return 'expiring';
    return 'supported';
  }

  // Database management
  getStats() {
    const resourceCount = this.db.prepare('SELECT COUNT(*) as count FROM resources').get();
    const accountCount = this.db.prepare('SELECT COUNT(*) as count FROM accounts').get();
    const lastRun = this.db.prepare('SELECT MAX(startTime) as lastRun FROM collection_runs').get();
    
    const statusStats = this.db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM resources 
      GROUP BY status
    `).all();
    
    const serviceStats = this.db.prepare(`
      SELECT service, COUNT(*) as count 
      FROM resources 
      GROUP BY service 
      ORDER BY count DESC
    `).all();
    
    return {
      totalResources: resourceCount.count,
      totalAccounts: accountCount.count,
      lastCollectionRun: lastRun.lastRun,
      statusDistribution: statusStats,
      serviceDistribution: serviceStats
    };
  }

  exportToJSON(filename = null) {
    const resources = this.getResources();
    const accounts = this.getAccounts();
    const stats = this.getStats();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      stats,
      accounts,
      resources
    };
    
    if (filename) {
      fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
      return filename;
    }
    
    return exportData;
  }

  importFromJSON(filename) {
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    
    // Import accounts
    if (data.accounts) {
      for (const account of data.accounts) {
        this.addAccount(account, account.sourceServer || 'imported');
      }
    }
    
    // Import resources
    if (data.resources) {
      this.addResourcesBulk(data.resources, 'imported');
    }
    
    return {
      accountsImported: data.accounts?.length || 0,
      resourcesImported: data.resources?.length || 0
    };
  }

  // Merge with another database
  mergeFrom(otherDbPath) {
    const otherDb = new PortableEOLDatabase(otherDbPath);
    
    // Get all data from other database
    const otherAccounts = otherDb.getAccounts();
    const otherResources = otherDb.getResources();
    
    // Import accounts
    for (const account of otherAccounts) {
      this.addAccount(account, account.sourceServer);
    }
    
    // Import resources
    this.addResourcesBulk(otherResources, 'merged');
    
    otherDb.close();
    
    return {
      accountsMerged: otherAccounts.length,
      resourcesMerged: otherResources.length
    };
  }

  clear() {
    this.db.exec('DELETE FROM resources');
    this.db.exec('DELETE FROM accounts');
    this.db.exec('DELETE FROM collection_runs');
  }

  close() {
    this.db.close();
  }

  // Get database file path for copying
  getDatabasePath() {
    return this.dbPath;
  }

  // Copy database to another location
  copyTo(destinationPath) {
    fs.copyFileSync(this.dbPath, destinationPath);
    return destinationPath;
  }
}

// CLI interface when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const db = new PortableEOLDatabase();
  
  switch (command) {
    case 'stats':
      console.log('Database Statistics:');
      console.log(JSON.stringify(db.getStats(), null, 2));
      break;
      
    case 'export':
      const exportFile = process.argv[3] || `eol-export-${new Date().toISOString().split('T')[0]}.json`;
      db.exportToJSON(exportFile);
      console.log(`Database exported to: ${exportFile}`);
      break;
      
    case 'import':
      const importFile = process.argv[3];
      if (!importFile) {
        console.log('Please specify a file to import');
        process.exit(1);
      }
      const result = db.importFromJSON(importFile);
      console.log(`Imported ${result.accountsImported} accounts and ${result.resourcesImported} resources`);
      break;
      
    case 'merge':
      const otherDbPath = process.argv[3];
      if (!otherDbPath) {
        console.log('Please specify a database file to merge');
        process.exit(1);
      }
      const mergeResult = db.mergeFrom(otherDbPath);
      console.log(`Merged ${mergeResult.accountsMerged} accounts and ${mergeResult.resourcesMerged} resources`);
      break;
      
    case 'copy':
      const destPath = process.argv[3];
      if (!destPath) {
        console.log('Please specify a destination path');
        process.exit(1);
      }
      db.copyTo(destPath);
      console.log(`Database copied to: ${destPath}`);
      break;
      
    default:
      console.log(`
Portable EOL Database CLI

Usage: node portable-db.js <command> [options]

Commands:
  stats                    Show database statistics
  export [filename]        Export database to JSON
  import <filename>        Import data from JSON
  merge <db-file>         Merge another database into this one
  copy <destination>       Copy database file to destination

Examples:
  node portable-db.js stats
  node portable-db.js export backup.json
  node portable-db.js copy /path/to/server2/eol-database.db
      `);
  }
  
  db.close();
}

export default PortableEOLDatabase;