#!/usr/bin/env node

/**
 * Database CLI for EOL Dashboard
 * Node.js command-line interface for database operations
 * 
 * Usage:
 * node cli/db-cli.js <command> [options]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple CLI argument parser
function parseArgs(args) {
  const command = args[2];
  const options = {};
  
  for (let i = 3; i < args.length; i += 2) {
    if (args[i] && args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] || true;
      options[key] = value;
    }
  }
  
  return { command, options };
}

// Database operations using file-based storage
class FileDatabase {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.resourcesFile = path.join(this.dataDir, 'resources.json');
    this.accountsFile = path.join(this.dataDir, 'accounts.json');
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.resourcesFile)) {
      fs.writeFileSync(this.resourcesFile, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(this.accountsFile)) {
      fs.writeFileSync(this.accountsFile, JSON.stringify([], null, 2));
    }
  }

  readResources() {
    try {
      const data = fs.readFileSync(this.resourcesFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading resources:', error.message);
      return [];
    }
  }

  writeResources(resources) {
    try {
      fs.writeFileSync(this.resourcesFile, JSON.stringify(resources, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing resources:', error.message);
      return false;
    }
  }

  readAccounts() {
    try {
      const data = fs.readFileSync(this.accountsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading accounts:', error.message);
      return [];
    }
  }

  writeAccounts(accounts) {
    try {
      fs.writeFileSync(this.accountsFile, JSON.stringify(accounts, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing accounts:', error.message);
      return false;
    }
  }
}

const db = new FileDatabase();

// Command implementations
const commands = {
  // List resources
  'resources:list': () => {
    const resources = db.readResources();
    if (resources.length === 0) {
      console.log('No resources found.');
      return;
    }
    
    console.log(`Found ${resources.length} resources:\n`);
    resources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.name || resource.resourceId}`);
      console.log(`   Service: ${resource.service}`);
      console.log(`   Region: ${resource.region}`);
      console.log(`   Status: ${resource.status}`);
      console.log(`   EOL Date: ${resource.eolDate}`);
      console.log(`   Account: ${resource.account}\n`);
    });
  },

  // Get specific resource
  'resources:get': (options) => {
    const resources = db.readResources();
    const resource = resources.find(r => 
      r.id == options.id || 
      r.resourceId === options.resourceId ||
      r.name === options.name
    );
    
    if (!resource) {
      console.log('Resource not found.');
      return;
    }
    
    console.log('Resource Details:');
    console.log(JSON.stringify(resource, null, 2));
  },

  // Add resource
  'resources:add': (options) => {
    const resources = db.readResources();
    const newId = Math.max(...resources.map(r => r.id || 0), 0) + 1;
    
    const resource = {
      id: newId,
      resourceId: options.resourceId || `resource-${newId}`,
      name: options.name || `Resource ${newId}`,
      service: options.service || 'Unknown',
      region: options.region || 'us-east-1',
      eolDate: options.eolDate || '2025-12-31',
      eosDate: options.eosDate || '2025-12-31',
      status: options.status || 'supported',
      account: options.account || 'default',
      type: options.type || 'service',
      description: options.description || ''
    };
    
    resources.push(resource);
    
    if (db.writeResources(resources)) {
      console.log(`Resource added successfully with ID: ${newId}`);
    }
  },

  // Update resource
  'resources:update': (options) => {
    const resources = db.readResources();
    const index = resources.findIndex(r => 
      r.id == options.id || 
      r.resourceId === options.resourceId
    );
    
    if (index === -1) {
      console.log('Resource not found.');
      return;
    }
    
    // Update fields
    Object.keys(options).forEach(key => {
      if (key !== 'id' && key !== 'resourceId' && options[key] !== undefined) {
        resources[index][key] = options[key];
      }
    });
    
    if (db.writeResources(resources)) {
      console.log('Resource updated successfully.');
    }
  },

  // Delete resource
  'resources:delete': (options) => {
    const resources = db.readResources();
    const initialLength = resources.length;
    const filtered = resources.filter(r => 
      r.id != options.id && 
      r.resourceId !== options.resourceId
    );
    
    if (filtered.length === initialLength) {
      console.log('Resource not found.');
      return;
    }
    
    if (db.writeResources(filtered)) {
      console.log('Resource deleted successfully.');
    }
  },

  // List accounts
  'accounts:list': () => {
    const accounts = db.readAccounts();
    if (accounts.length === 0) {
      console.log('No accounts found.');
      return;
    }
    
    console.log(`Found ${accounts.length} accounts:\n`);
    accounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.name}`);
      console.log(`   Account ID: ${account.accountId}`);
      console.log(`   Color: ${account.color}`);
      console.log(`   Description: ${account.description || 'No description'}\n`);
    });
  },

  // Add account
  'accounts:add': (options) => {
    const accounts = db.readAccounts();
    const newId = Math.max(...accounts.map(a => a.id || 0), 0) + 1;
    
    const account = {
      id: newId,
      accountId: options.accountId || `account-${newId}`,
      name: options.name || `Account ${newId}`,
      color: options.color || '#3B82F6',
      description: options.description || ''
    };
    
    accounts.push(account);
    
    if (db.writeAccounts(accounts)) {
      console.log(`Account added successfully with ID: ${newId}`);
    }
  },

  // Database stats
  'db:stats': () => {
    const resources = db.readResources();
    const accounts = db.readAccounts();
    
    console.log('Database Statistics:');
    console.log(`Resources: ${resources.length}`);
    console.log(`Accounts: ${accounts.length}`);
    
    if (resources.length > 0) {
      const statusCounts = {};
      resources.forEach(r => {
        statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      });
      
      console.log('\nResource Status Distribution:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }
  },

  // Export data
  'db:export': (options) => {
    const resources = db.readResources();
    const accounts = db.readAccounts();
    const data = { resources, accounts };
    
    const filename = options.file || `eol-export-${new Date().toISOString().split('T')[0]}.json`;
    
    try {
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
      console.log(`Database exported to: ${filename}`);
    } catch (error) {
      console.error('Export failed:', error.message);
    }
  },

  // Import data
  'db:import': (options) => {
    if (!options.file) {
      console.log('Please specify a file to import with --file');
      return;
    }
    
    try {
      const data = JSON.parse(fs.readFileSync(options.file, 'utf8'));
      
      if (data.resources) {
        db.writeResources(data.resources);
        console.log(`Imported ${data.resources.length} resources`);
      }
      
      if (data.accounts) {
        db.writeAccounts(data.accounts);
        console.log(`Imported ${data.accounts.length} accounts`);
      }
      
      console.log('Import completed successfully.');
    } catch (error) {
      console.error('Import failed:', error.message);
    }
  },

  // Clear database
  'db:clear': () => {
    db.writeResources([]);
    db.writeAccounts([]);
    console.log('Database cleared successfully.');
  },

  // Help
  'help': () => {
    console.log(`
EOL Dashboard CLI

Usage: node cli/db-cli.js <command> [options]

Commands:
  resources:list                    List all resources
  resources:get --id <id>          Get resource by ID
  resources:add [options]          Add new resource
  resources:update --id <id> [opts] Update resource
  resources:delete --id <id>       Delete resource
  
  accounts:list                    List all accounts
  accounts:add [options]           Add new account
  
  db:stats                         Show database statistics
  db:export [--file <filename>]    Export database to JSON
  db:import --file <filename>      Import database from JSON
  db:clear                         Clear all data
  
  help                             Show this help

Resource Options:
  --resourceId <id>               Resource identifier
  --name <name>                   Resource name
  --service <service>             AWS service
  --region <region>               AWS region
  --eolDate <date>                End of life date (YYYY-MM-DD)
  --status <status>               Status (supported|expiring|expired)
  --account <accountId>           Account identifier
  --type <type>                   Resource type

Account Options:
  --accountId <id>                Account identifier
  --name <name>                   Account name
  --color <color>                 Account color (hex)
  --description <desc>            Account description

Examples:
  node cli/db-cli.js resources:list
  node cli/db-cli.js resources:add --name "My EC2" --service "EC2" --eolDate "2025-12-31"
  node cli/db-cli.js resources:update --id 1 --status "expired"
  node cli/db-cli.js db:export --file backup.json
`);
  }
};

// Main execution
function main() {
  const { command, options } = parseArgs(process.argv);
  
  if (!command || command === 'help') {
    commands.help();
    return;
  }
  
  if (commands[command]) {
    commands[command](options);
  } else {
    console.log(`Unknown command: ${command}`);
    console.log('Run "node cli/db-cli.js help" for available commands.');
  }
}

main();