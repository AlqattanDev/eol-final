#!/usr/bin/env node

/**
 * Portable Database for EOL Dashboard (JSON-based version)
 * Uses JSON files instead of SQLite for Node.js compatibility
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PortableEOLDatabase {
  constructor(dbPath = null) {
    this.dataDir = dbPath || path.join(__dirname, '../data');
    this.resourcesFile = path.join(this.dataDir, 'resources.json');
    this.accountsFile = path.join(this.dataDir, 'accounts.json');
    this.runsFile = path.join(this.dataDir, 'collection-runs.json');
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Initialize files if they don't exist
    if (!fs.existsSync(this.resourcesFile)) {
      fs.writeFileSync(this.resourcesFile, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(this.accountsFile)) {
      fs.writeFileSync(this.accountsFile, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(this.runsFile)) {
      fs.writeFileSync(this.runsFile, JSON.stringify([], null, 2));
    }
  }

  // Helper methods for file operations
  readFile(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error.message);
      return [];
    }
  }

  writeFile(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filePath}:`, error.message);
      return false;
    }
  }

  // Collection run management
  startCollectionRun(accountId, sourceServer) {
    const runs = this.readFile(this.runsFile);
    const run = {
      id: Date.now(), // Simple ID generation
      accountId,
      sourceServer,
      startTime: new Date().toISOString(),
      endTime: null,
      resourcesFound: 0,
      status: 'running',
      errorMessage: null
    };
    
    runs.push(run);
    this.writeFile(this.runsFile, runs);
    return run.id;
  }

  endCollectionRun(runId, resourcesFound, status = 'completed', errorMessage = null) {
    const runs = this.readFile(this.runsFile);
    const runIndex = runs.findIndex(run => run.id === runId);
    
    if (runIndex !== -1) {
      runs[runIndex].endTime = new Date().toISOString();
      runs[runIndex].resourcesFound = resourcesFound;
      runs[runIndex].status = status;
      runs[runIndex].errorMessage = errorMessage;
      this.writeFile(this.runsFile, runs);
    }
  }

  // Account operations
  addAccount(accountData, sourceServer) {
    const accounts = this.readFile(this.accountsFile);
    const existingIndex = accounts.findIndex(acc => acc.accountId === accountData.accountId);
    
    const account = {
      id: existingIndex !== -1 ? accounts[existingIndex].id : Date.now(),
      accountId: accountData.accountId,
      name: accountData.name,
      color: accountData.color || '#3B82F6',
      description: accountData.description || '',
      awsRegion: accountData.awsRegion || 'us-east-1',
      environment: accountData.environment || 'unknown',
      sourceServer,
      lastUpdated: new Date().toISOString()
    };
    
    if (existingIndex !== -1) {
      accounts[existingIndex] = account;
    } else {
      accounts.push(account);
    }
    
    return this.writeFile(this.accountsFile, accounts);
  }

  getAccounts() {
    return this.readFile(this.accountsFile);
  }

  // Resource operations
  addResource(resourceData, sourceServer) {
    const resources = this.readFile(this.resourcesFile);
    const existingIndex = resources.findIndex(res => res.resourceId === resourceData.resourceId);
    
    const resource = {
      id: existingIndex !== -1 ? resources[existingIndex].id : Date.now() + Math.random(),
      resourceId: resourceData.resourceId,
      name: resourceData.name || '',
      service: resourceData.service,
      region: resourceData.region,
      eolDate: resourceData.eolDate,
      eosDate: resourceData.eosDate,
      status: this.calculateStatus(resourceData.eolDate),
      account: resourceData.account,
      type: resourceData.type || 'service',
      description: resourceData.description || '',
      sourceServer,
      lastUpdated: new Date().toISOString(),
      metadata: resourceData.metadata || {}
    };
    
    if (existingIndex !== -1) {
      resources[existingIndex] = resource;
    } else {
      resources.push(resource);
    }
    
    return this.writeFile(this.resourcesFile, resources);
  }

  addResourcesBulk(resources, sourceServer) {
    const existingResources = this.readFile(this.resourcesFile);
    const resourceMap = new Map(existingResources.map(r => [r.resourceId, r]));
    
    for (const resource of resources) {
      const processedResource = {
        id: resourceMap.has(resource.resourceId) ? resourceMap.get(resource.resourceId).id : Date.now() + Math.random(),
        resourceId: resource.resourceId,
        name: resource.name || '',
        service: resource.service,
        region: resource.region,
        eolDate: resource.eolDate,
        eosDate: resource.eosDate,
        status: this.calculateStatus(resource.eolDate),
        account: resource.account,
        type: resource.type || 'service',
        description: resource.description || '',
        sourceServer,
        lastUpdated: new Date().toISOString(),
        metadata: resource.metadata || {}
      };
      
      resourceMap.set(resource.resourceId, processedResource);
    }
    
    const updatedResources = Array.from(resourceMap.values());
    return this.writeFile(this.resourcesFile, updatedResources);
  }

  getResources(filters = {}) {
    const resources = this.readFile(this.resourcesFile);
    
    return resources.filter(resource => {
      if (filters.account && resource.account !== filters.account) return false;
      if (filters.service && resource.service !== filters.service) return false;
      if (filters.status && resource.status !== filters.status) return false;
      if (filters.sourceServer && resource.sourceServer !== filters.sourceServer) return false;
      return true;
    }).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
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
    const resources = this.readFile(this.resourcesFile);
    const accounts = this.readFile(this.accountsFile);
    const runs = this.readFile(this.runsFile);
    
    const lastRun = runs.length > 0 ? runs.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))[0] : null;
    
    const statusStats = {};
    const serviceStats = {};
    
    resources.forEach(resource => {
      statusStats[resource.status] = (statusStats[resource.status] || 0) + 1;
      serviceStats[resource.service] = (serviceStats[resource.service] || 0) + 1;
    });
    
    return {
      totalResources: resources.length,
      totalAccounts: accounts.length,
      lastCollectionRun: lastRun?.startTime || null,
      statusDistribution: Object.entries(statusStats).map(([status, count]) => ({ status, count })),
      serviceDistribution: Object.entries(serviceStats).map(([service, count]) => ({ service, count })).sort((a, b) => b.count - a.count)
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
    
    let accountsImported = 0;
    let resourcesImported = 0;
    
    // Import accounts
    if (data.accounts) {
      for (const account of data.accounts) {
        this.addAccount(account, account.sourceServer || 'imported');
        accountsImported++;
      }
    }
    
    // Import resources
    if (data.resources) {
      this.addResourcesBulk(data.resources, 'imported');
      resourcesImported = data.resources.length;
    }
    
    return {
      accountsImported,
      resourcesImported
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
    
    return {
      accountsMerged: otherAccounts.length,
      resourcesMerged: otherResources.length
    };
  }

  clear() {
    this.writeFile(this.resourcesFile, []);
    this.writeFile(this.accountsFile, []);
    this.writeFile(this.runsFile, []);
  }

  close() {
    // No-op for JSON-based implementation
  }

  // Get database directory path
  getDatabasePath() {
    return this.dataDir;
  }

  // Copy database to another location
  copyTo(destinationPath) {
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }
    
    fs.copyFileSync(this.resourcesFile, path.join(destinationPath, 'resources.json'));
    fs.copyFileSync(this.accountsFile, path.join(destinationPath, 'accounts.json'));
    fs.copyFileSync(this.runsFile, path.join(destinationPath, 'collection-runs.json'));
    
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
        console.log('Please specify a database directory to merge');
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
      
    case 'clear':
      db.clear();
      console.log('Database cleared successfully');
      break;
      
    default:
      console.log(`
Portable EOL Database CLI (JSON-based)

Usage: node portable-db-json.js <command> [options]

Commands:
  stats                    Show database statistics
  export [filename]        Export database to JSON
  import <filename>        Import data from JSON
  merge <db-directory>     Merge another database into this one
  copy <destination>       Copy database files to destination
  clear                    Clear all data

Examples:
  node portable-db-json.js stats
  node portable-db-json.js export backup.json
  node portable-db-json.js copy /path/to/server2/data
      `);
  }
  
  db.close();
}

export default PortableEOLDatabase;