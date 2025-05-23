import { db } from '../config/database';
import { format } from 'date-fns';

// Create a full database backup
export async function createBackup() {
  try {
    // Get all data from all tables
    const resources = await db.resources.toArray();
    const accounts = await db.accounts.toArray();
    
    // Create backup object
    const backup = {
      version: '1.0',
      backupDate: new Date().toISOString(),
      databaseVersion: db.verno,
      data: {
        resources,
        accounts
      },
      metadata: {
        resourceCount: resources.length,
        accountCount: accounts.length,
        appVersion: process.env.REACT_APP_VERSION || '1.0.0'
      }
    };
    
    // Convert to JSON and create blob
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Download the backup
    const a = document.createElement('a');
    a.href = url;
    a.download = `eol-dashboard-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      metadata: backup.metadata
    };
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}

// Restore from backup file
export async function restoreBackup(file) {
  try {
    const text = await file.text();
    const backup = JSON.parse(text);
    
    // Validate backup structure
    if (!backup.data || !backup.version) {
      throw new Error('Invalid backup file format');
    }
    
    // Check version compatibility
    if (backup.version !== '1.0') {
      throw new Error(`Unsupported backup version: ${backup.version}`);
    }
    
    // Confirm restoration
    const confirmMessage = `This backup contains:
- ${backup.metadata?.resourceCount || 0} resources
- ${backup.metadata?.accountCount || 0} accounts
- Created on: ${new Date(backup.backupDate).toLocaleString()}

Do you want to restore this backup? This will replace ALL current data.`;
    
    if (!window.confirm(confirmMessage)) {
      return { success: false, cancelled: true };
    }
    
    // Clear existing data
    await db.transaction('rw', db.resources, db.accounts, async () => {
      await db.resources.clear();
      await db.accounts.clear();
      
      // Restore accounts first
      if (backup.data.accounts && backup.data.accounts.length > 0) {
        const accounts = backup.data.accounts.map(({ id, ...account }) => account);
        await db.accounts.bulkAdd(accounts);
      }
      
      // Restore resources
      if (backup.data.resources && backup.data.resources.length > 0) {
        const resources = backup.data.resources.map(({ id, ...resource }) => ({
          ...resource,
          eolDate: resource.eolDate ? new Date(resource.eolDate) : null,
          eosDate: resource.eosDate ? new Date(resource.eosDate) : null
        }));
        await db.resources.bulkAdd(resources);
      }
    });
    
    return {
      success: true,
      restored: {
        resources: backup.data.resources?.length || 0,
        accounts: backup.data.accounts?.length || 0
      }
    };
  } catch (error) {
    console.error('Restore failed:', error);
    throw error;
  }
}

// Verify backup file
export async function verifyBackup(file) {
  try {
    const text = await file.text();
    const backup = JSON.parse(text);
    
    // Check required fields
    if (!backup.version || !backup.data || !backup.backupDate) {
      return {
        valid: false,
        error: 'Missing required backup fields'
      };
    }
    
    // Check version
    if (backup.version !== '1.0') {
      return {
        valid: false,
        error: `Unsupported version: ${backup.version}`
      };
    }
    
    return {
      valid: true,
      metadata: {
        backupDate: backup.backupDate,
        resourceCount: backup.data.resources?.length || 0,
        accountCount: backup.data.accounts?.length || 0,
        databaseVersion: backup.databaseVersion,
        appVersion: backup.metadata?.appVersion
      }
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

// Auto-backup functionality
export function scheduleAutoBackup(intervalDays = 7) {
  const key = 'eol-dashboard-auto-backup';
  const lastBackup = localStorage.getItem(key);
  const now = Date.now();
  
  if (!lastBackup || (now - parseInt(lastBackup)) > intervalDays * 24 * 60 * 60 * 1000) {
    // Time for a backup
    createBackup().then(() => {
      localStorage.setItem(key, now.toString());
    }).catch(console.error);
  }
}