import { db } from '../config/database.js';

// Browser Console Database CLI
// Usage: Open browser dev tools and run these commands

export const dbCli = {
  // Resources CRUD
  resources: {
    // Read all resources
    getAll: async () => {
      try {
        const resources = await db.resources.toArray();
        console.table(resources);
        return resources;
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    },

    // Get resource by ID
    getById: async (id) => {
      try {
        const resource = await db.resources.get(id);
        console.log('Resource:', resource);
        return resource;
      } catch (error) {
        console.error('Error fetching resource:', error);
      }
    },

    // Search resources
    search: async (searchTerm) => {
      try {
        const resources = await db.resources
          .filter(resource => 
            resource.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.resourceId?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .toArray();
        console.table(resources);
        return resources;
      } catch (error) {
        console.error('Error searching resources:', error);
      }
    },

    // Filter by account
    getByAccount: async (accountId) => {
      try {
        const resources = await db.resources.where('account').equals(accountId).toArray();
        console.table(resources);
        return resources;
      } catch (error) {
        console.error('Error fetching resources by account:', error);
      }
    },

    // Add new resource
    add: async (resourceData) => {
      try {
        const id = await db.resources.add(resourceData);
        console.log('Resource added with ID:', id);
        return id;
      } catch (error) {
        console.error('Error adding resource:', error);
      }
    },

    // Update resource
    update: async (id, updates) => {
      try {
        await db.resources.update(id, updates);
        console.log('Resource updated successfully');
        return await db.resources.get(id);
      } catch (error) {
        console.error('Error updating resource:', error);
      }
    },

    // Delete resource
    delete: async (id) => {
      try {
        await db.resources.delete(id);
        console.log('Resource deleted successfully');
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    },

    // Bulk operations
    deleteByAccount: async (accountId) => {
      try {
        const count = await db.resources.where('account').equals(accountId).delete();
        console.log(`Deleted ${count} resources from account ${accountId}`);
        return count;
      } catch (error) {
        console.error('Error deleting resources by account:', error);
      }
    }
  },

  // Accounts CRUD
  accounts: {
    // Read all accounts
    getAll: async () => {
      try {
        const accounts = await db.accounts.toArray();
        console.table(accounts);
        return accounts;
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    },

    // Get account by ID
    getById: async (id) => {
      try {
        const account = await db.accounts.get(id);
        console.log('Account:', account);
        return account;
      } catch (error) {
        console.error('Error fetching account:', error);
      }
    },

    // Add new account
    add: async (accountData) => {
      try {
        const id = await db.accounts.add(accountData);
        console.log('Account added with ID:', id);
        return id;
      } catch (error) {
        console.error('Error adding account:', error);
      }
    },

    // Update account
    update: async (id, updates) => {
      try {
        await db.accounts.update(id, updates);
        console.log('Account updated successfully');
        return await db.accounts.get(id);
      } catch (error) {
        console.error('Error updating account:', error);
      }
    },

    // Delete account
    delete: async (id) => {
      try {
        await db.accounts.delete(id);
        console.log('Account deleted successfully');
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  },

  // Database utilities
  utils: {
    // Get database stats
    getStats: async () => {
      try {
        const resourceCount = await db.resources.count();
        const accountCount = await db.accounts.count();
        const stats = {
          resources: resourceCount,
          accounts: accountCount
        };
        console.table(stats);
        return stats;
      } catch (error) {
        console.error('Error getting database stats:', error);
      }
    },

    // Clear all data
    clear: async () => {
      try {
        await db.resources.clear();
        await db.accounts.clear();
        console.log('Database cleared successfully');
      } catch (error) {
        console.error('Error clearing database:', error);
      }
    },

    // Export data
    export: async () => {
      try {
        const resources = await db.resources.toArray();
        const accounts = await db.accounts.toArray();
        const data = { resources, accounts };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eol-database-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('Database exported successfully');
        return data;
      } catch (error) {
        console.error('Error exporting database:', error);
      }
    },

    // Import data
    import: async (data) => {
      try {
        if (data.resources) {
          await db.resources.bulkAdd(data.resources);
          console.log(`Imported ${data.resources.length} resources`);
        }
        if (data.accounts) {
          await db.accounts.bulkAdd(data.accounts);
          console.log(`Imported ${data.accounts.length} accounts`);
        }
        console.log('Database import completed successfully');
      } catch (error) {
        console.error('Error importing database:', error);
      }
    }
  }
};

// Make it globally available in browser console
if (typeof window !== 'undefined') {
  window.dbCli = dbCli;
}

export default dbCli;