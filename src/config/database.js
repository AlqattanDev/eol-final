import Dexie from 'dexie';

// Define the database
export class EOLDatabase extends Dexie {
  constructor() {
    super('EOLDatabase');
    
    // Define schemas
    this.version(1).stores({
      resources: '++id, resourceId, service, region, eolDate, eosDate, status, account, type, name, description',
      accounts: '++id, accountId, name, color, description'
    });
  }
}

// Create database instance
export const db = new EOLDatabase();

// Initialize database with sample data
export const initializeDatabase = async () => {
  try {
    // Check if we already have data
    const resourceCount = await db.resources.count();
    const accountCount = await db.accounts.count();
    
    if (resourceCount === 0 && accountCount === 0) {
      console.log('Initializing database with sample data...');
      await seedDatabase();
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

// Reset database and add fresh sample data
export const resetDatabase = async () => {
  try {
    console.log('Resetting database...');
    await db.resources.clear();
    await db.accounts.clear();
    await seedDatabase();
    console.log('Database reset complete');
  } catch (error) {
    console.error('Failed to reset database:', error);
  }
};

// Helper function to calculate status
const calculateStatus = (eolDate) => {
  const today = new Date();
  const eol = new Date(eolDate);
  
  if (eol < today) {
    return 'expired';
  }
  
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(today.getDate() + 90);
  
  if (eol <= ninetyDaysFromNow) {
    return 'expiring';
  }
  
  return 'supported';
};

// Sample data seeding function
const seedDatabase = async () => {
  // Sample accounts
  const accounts = [
    {
      accountId: 'production',
      name: 'Production',
      color: '#ef4444',
      description: 'Production environment resources'
    },
    {
      accountId: 'staging',
      name: 'Staging', 
      color: '#f59e0b',
      description: 'Staging environment resources'
    },
    {
      accountId: 'development',
      name: 'Development',
      color: '#10b981',
      description: 'Development environment resources'
    }
  ];

  // Sample resources with various EOL dates
  const rawResources = [
    {
      resourceId: 'prod-ec2-1',
      service: 'EC2',
      region: 'us-east-1',
      name: 'Web Server Instance',
      type: 't3.large',
      account: 'production',
      eolDate: new Date('2025-12-31'),
      eosDate: new Date('2026-06-30'),
      description: 'Main web server for production'
    },
    {
      resourceId: 'prod-rds-1',
      service: 'RDS',
      region: 'us-east-1',
      name: 'Primary Database',
      type: 'db.t3.medium',
      account: 'production',
      eolDate: new Date('2027-03-15'),
      eosDate: new Date('2027-09-15'),
      description: 'Main PostgreSQL database'
    },
    {
      resourceId: 'staging-lambda-1',
      service: 'Lambda',
      region: 'us-west-2',
      name: 'API Gateway Function',
      type: 'nodejs18.x',
      account: 'staging',
      eolDate: new Date('2024-01-15'),
      eosDate: new Date('2024-07-15'),
      description: 'API processing function'
    },
    {
      resourceId: 'dev-s3-1',
      service: 'S3',
      region: 'us-west-1',
      name: 'Asset Storage',
      type: 'Standard',
      account: 'development',
      eolDate: new Date('2026-08-20'),
      eosDate: new Date('2027-02-20'),
      description: 'Static asset storage bucket'
    },
    {
      resourceId: 'prod-elb-1',
      service: 'ELB',
      region: 'us-east-1',
      name: 'Load Balancer',
      type: 'Application',
      account: 'production',
      eolDate: new Date('2025-06-10'),
      eosDate: new Date('2025-12-10'),
      description: 'Production load balancer'
    }
  ];

  // Add calculated status to each resource
  const resources = rawResources.map(resource => ({
    ...resource,
    status: calculateStatus(resource.eolDate)
  }));

  try {
    // Insert sample data
    await db.accounts.bulkAdd(accounts);
    await db.resources.bulkAdd(resources);
    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
};

export default db;