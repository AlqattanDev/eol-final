import { format } from 'date-fns';
import { db } from '../config/database';

// Export functions
export async function exportToJSON() {
  try {
    const resources = await db.resources.toArray();
    const accounts = await db.accounts.toArray();
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        resources,
        accounts
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eol-dashboard-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    return { success: true, count: resources.length };
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

export async function exportToCSV() {
  try {
    const resources = await db.resources.toArray();
    
    // Define CSV headers
    const headers = [
      'Resource ID',
      'Name',
      'Service',
      'Type',
      'Region',
      'Account',
      'EOL Date',
      'EOS Date',
      'Status',
      'Description'
    ];
    
    // Convert resources to CSV rows
    const rows = resources.map(resource => [
      resource.resourceId || '',
      resource.name || '',
      resource.service || '',
      resource.type || '',
      resource.region || '',
      resource.account || '',
      resource.eolDate ? format(new Date(resource.eolDate), 'yyyy-MM-dd') : '',
      resource.eosDate ? format(new Date(resource.eosDate), 'yyyy-MM-dd') : '',
      resource.status || '',
      (resource.description || '').replace(/"/g, '""') // Escape quotes
    ]);
    
    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eol-dashboard-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    return { success: true, count: resources.length };
  } catch (error) {
    console.error('CSV export failed:', error);
    throw error;
  }
}

// Import functions
export async function importFromJSON(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Validate data structure
    if (!data.data || !data.data.resources) {
      throw new Error('Invalid import file format');
    }
    
    // Clear existing data if requested
    const shouldClear = window.confirm('Do you want to replace existing data? Click Cancel to merge.');
    
    if (shouldClear) {
      await db.resources.clear();
      await db.accounts.clear();
    }
    
    // Import accounts first
    if (data.data.accounts && data.data.accounts.length > 0) {
      // Remove IDs to let database auto-generate
      const accounts = data.data.accounts.map(({ id, ...account }) => account);
      await db.accounts.bulkAdd(accounts);
    }
    
    // Import resources
    if (data.data.resources && data.data.resources.length > 0) {
      // Remove IDs and ensure dates are properly formatted
      const resources = data.data.resources.map(({ id, ...resource }) => ({
        ...resource,
        eolDate: resource.eolDate ? new Date(resource.eolDate) : null,
        eosDate: resource.eosDate ? new Date(resource.eosDate) : null
      }));
      await db.resources.bulkAdd(resources);
    }
    
    return {
      success: true,
      imported: {
        resources: data.data.resources?.length || 0,
        accounts: data.data.accounts?.length || 0
      }
    };
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

export async function importFromCSV(file) {
  try {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }
    
    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Parse rows
    const resources = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length !== headers.length) {
        console.warn(`Skipping invalid row ${i + 1}`);
        continue;
      }
      
      const resource = {
        resourceId: values[0] || `imported-${Date.now()}-${i}`,
        name: values[1],
        service: values[2],
        type: values[3],
        region: values[4],
        account: values[5],
        eolDate: values[6] ? new Date(values[6]) : null,
        eosDate: values[7] ? new Date(values[7]) : null,
        status: values[8],
        description: values[9]
      };
      
      resources.push(resource);
    }
    
    // Import resources
    const shouldClear = window.confirm('Do you want to replace existing resources? Click Cancel to merge.');
    
    if (shouldClear) {
      await db.resources.clear();
    }
    
    await db.resources.bulkAdd(resources);
    
    return {
      success: true,
      imported: resources.length
    };
  } catch (error) {
    console.error('CSV import failed:', error);
    throw error;
  }
}

// Helper function to parse CSV line properly handling quoted values
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  values.push(current);
  
  return values.map(v => v.trim());
}