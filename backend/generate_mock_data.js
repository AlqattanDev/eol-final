const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Configuration
const DB_NAME = 'backend.db';
const ACCOUNT_COUNT = 2; 
const EC2_PER_ACCOUNT = 20;
const RDS_PER_ACCOUNT = 10;
const EKS_PER_ACCOUNT = 5;
const LAMBDA_PER_ACCOUNT = 15;
const REGIONS = ['eu-west-1', 'me-south-1'];

// Helper function to generate random date within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to format date as ISO string
function formatDate(date) {
  return date.toISOString();
}

// Helper function to choose random element from array
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to generate mock EOL and EOS dates
function generateEOLDates() {
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  
  const twoYearsFromNow = new Date(now);
  twoYearsFromNow.setFullYear(now.getFullYear() + 2);
  
  const eolDate = randomDate(oneYearAgo, twoYearsFromNow);
  
  // EOS date is typically 1-3 years after EOL
  const eosDate = new Date(eolDate);
  eosDate.setFullYear(eolDate.getFullYear() + Math.floor(Math.random() * 3) + 1);
  
  return {
    eolDate: formatDate(eolDate),
    eosDate: formatDate(eosDate)
  };
}

// Initialize database
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = path.resolve(__dirname, DB_NAME);
    
    // Delete existing database if it exists
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error creating database:', err.message);
        reject(err);
        return;
      }
      
      console.log(`Created new SQLite database: ${DB_NAME}`);
      
      // Create tables
      db.serialize(() => {
        // Create aws_accounts table
        db.run(`
          CREATE TABLE aws_accounts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL
          )
        `);
        
        // Create ec2_instances table
        db.run(`
          CREATE TABLE ec2_instances (
            id TEXT PRIMARY KEY,
            account_id TEXT NOT NULL,
            region TEXT NOT NULL,
            instance_type TEXT,
            platform_name TEXT,
            platform_version TEXT,
            image_id TEXT,
            launch_time TEXT,
            state TEXT,
            private_ip_address TEXT,
            public_ip_address TEXT,
            architecture TEXT,
            vpc_id TEXT,
            subnet_id TEXT,
            tags TEXT,
            eol_date TEXT,
            eos_date TEXT,
            monthly_cost REAL,
            FOREIGN KEY (account_id) REFERENCES aws_accounts(id)
          )
        `);
        
        // Create rds_instances table
        db.run(`
          CREATE TABLE rds_instances (
            id TEXT PRIMARY KEY,
            account_id TEXT NOT NULL,
            region TEXT NOT NULL,
            db_instance_class TEXT,
            engine TEXT,
            engine_version TEXT,
            db_instance_status TEXT,
            allocated_storage_gb INTEGER,
            endpoint_address TEXT,
            endpoint_port INTEGER,
            multi_az BOOLEAN,
            publicly_accessible BOOLEAN,
            instance_create_time TEXT,
            tags TEXT,
            eol_date TEXT,
            eos_date TEXT,
            monthly_cost REAL,
            FOREIGN KEY (account_id) REFERENCES aws_accounts(id)
          )
        `);
        
        // Create eks_clusters table
        db.run(`
          CREATE TABLE eks_clusters (
            id TEXT PRIMARY KEY,
            account_id TEXT NOT NULL,
            region TEXT NOT NULL,
            arn TEXT,
            version TEXT,
            platform_version TEXT,
            status TEXT,
            endpoint TEXT,
            role_arn TEXT,
            vpc_id TEXT,
            subnet_ids TEXT,
            security_group_ids TEXT,
            created_at TEXT,
            eol_date TEXT,
            eos_date TEXT,
            monthly_cost REAL,
            FOREIGN KEY (account_id) REFERENCES aws_accounts(id)
          )
        `);
        
        // Create lambda_functions table
        db.run(`
          CREATE TABLE lambda_functions (
            id TEXT PRIMARY KEY,
            account_id TEXT NOT NULL,
            region TEXT NOT NULL,
            arn TEXT,
            runtime TEXT,
            handler TEXT,
            description TEXT,
            memory_size_mb INTEGER,
            timeout_seconds INTEGER,
            last_modified TEXT,
            code_size_bytes INTEGER,
            state TEXT,
            package_type TEXT,
            role TEXT,
            tags TEXT,
            eol_date TEXT,
            eos_date TEXT,
            monthly_cost REAL,
            FOREIGN KEY (account_id) REFERENCES aws_accounts(id)
          )
        `);
        
        console.log('Created database tables');
        resolve(db);
      });
    });
  });
}

// Generate mock AWS accounts
function generateAccounts(db) {
  return new Promise((resolve, reject) => {
    const accounts = [];
    const stmt = db.prepare('INSERT INTO aws_accounts (id, name) VALUES (?, ?)');
    
    for (let i = 0; i < ACCOUNT_COUNT; i++) {
      const accountId = `${100000000000 + i}`;
      const accountName = `Account-${i+1}`;
      
      stmt.run(accountId, accountName, function(err) {
        if (err) {
          console.error('Error inserting account:', err.message);
        } else {
          accounts.push({ id: accountId, name: accountName });
        }
      });
    }
    
    stmt.finalize(() => {
      console.log(`Generated ${accounts.length} AWS accounts`);
      resolve(accounts);
    });
  });
}

// Generate mock EC2 instances
function generateEC2Instances(db, accounts) {
  return new Promise((resolve, reject) => {
    const instanceTypes = ['t2.micro', 't2.small', 't3.medium', 'm5.large', 'c5.xlarge', 'r5.2xlarge'];
    const platformNames = ['Amazon Linux', 'Windows Server', 'Ubuntu', 'Red Hat', 'SUSE Linux'];
    const platformVersions = {
      'Amazon Linux': ['2', '2023.1', '2023.2'], 
      'Windows Server': ['2016', '2019', '2022'],
      'Ubuntu': ['18.04', '20.04', '22.04'],
      'Red Hat': ['7.9', '8.6', '9.0'],
      'SUSE Linux': ['12 SP5', '15 SP3', '15 SP4']
    };
    const states = ['running', 'stopped', 'terminated'];
    const architectures = ['x86_64', 'arm64'];
    
    let completedCount = 0;
    const totalInstances = accounts.length * EC2_PER_ACCOUNT;
    const stmt = db.prepare(`
      INSERT INTO ec2_instances (
        id, account_id, region, instance_type, platform_name, platform_version, 
        image_id, launch_time, state, private_ip_address, public_ip_address, 
        architecture, vpc_id, subnet_id, tags, eol_date, eos_date, monthly_cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    accounts.forEach(account => {
      for (let i = 0; i < EC2_PER_ACCOUNT; i++) {
        const instanceId = `i-${Math.random().toString(36).substring(2, 12)}`;
        const region = randomChoice(REGIONS);
        const instanceType = randomChoice(instanceTypes);
        const platformName = randomChoice(platformNames);
        const platformVersion = randomChoice(platformVersions[platformName]);
        const imageId = `ami-${Math.random().toString(36).substring(2, 12)}`;
        const launchTime = formatDate(randomDate(new Date(2020, 0, 1), new Date()));
        const state = randomChoice(states);
        const privateIp = `10.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
        const publicIp = state === 'running' ? `54.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}` : null;
        const architecture = randomChoice(architectures);
        const vpcId = `vpc-${Math.random().toString(36).substring(2, 12)}`;
        const subnetId = `subnet-${Math.random().toString(36).substring(2, 12)}`;
        
        const tags = JSON.stringify([
          { Key: 'Name', Value: `instance-${i}` },
          { Key: 'Environment', Value: randomChoice(['dev', 'test', 'staging', 'prod']) },
          { Key: 'Department', Value: randomChoice(['IT', 'Engineering', 'Finance', 'Marketing']) }
        ]);
        
        // EOL and EOS dates
        const { eolDate, eosDate } = generateEOLDates();
        const monthlyCost = parseFloat((Math.random() * 300 + 50).toFixed(2));
        
        stmt.run(
          instanceId, account.id, region, instanceType, platformName, platformVersion,
          imageId, launchTime, state, privateIp, publicIp, architecture, vpcId, subnetId,
          tags, eolDate, eosDate, monthlyCost,
          function(err) {
            if (err) {
              console.error('Error inserting EC2 instance:', err.message);
            }
            
            completedCount++;
            if (completedCount === totalInstances) {
              stmt.finalize();
              console.log(`Generated ${completedCount} EC2 instances`);
              resolve();
            }
          }
        );
      }
    });
  });
}

// Generate mock RDS instances
function generateRDSInstances(db, accounts) {
  return new Promise((resolve, reject) => {
    const instanceClasses = ['db.t3.micro', 'db.t3.small', 'db.m5.large', 'db.r5.xlarge'];
    const engines = ['mysql', 'postgres', 'oracle', 'sqlserver'];
    const engineVersions = {
      'mysql': ['5.7.33', '8.0.23', '8.0.28'],
      'postgres': ['11.10', '12.7', '13.4', '14.1'],
      'oracle': ['12.1.0.2', '19.0.0.0'],
      'sqlserver': ['14.00.3281.6', '15.00.4073.23']
    };
    const statuses = ['available', 'backing-up', 'creating'];
    
    let completedCount = 0;
    const totalInstances = accounts.length * RDS_PER_ACCOUNT;
    const stmt = db.prepare(`
      INSERT INTO rds_instances (
        id, account_id, region, db_instance_class, engine, engine_version, 
        db_instance_status, allocated_storage_gb, endpoint_address, endpoint_port, 
        multi_az, publicly_accessible, instance_create_time, tags, eol_date, eos_date, monthly_cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    accounts.forEach(account => {
      for (let i = 0; i < RDS_PER_ACCOUNT; i++) {
        const instanceId = `db-${Math.random().toString(36).substring(2, 12)}`;
        const region = randomChoice(REGIONS);
        const instanceClass = randomChoice(instanceClasses);
        const engine = randomChoice(engines);
        const engineVersion = randomChoice(engineVersions[engine]);
        const status = randomChoice(statuses);
        const allocatedStorage = Math.floor(Math.random() * 500) + 20;
        const endpointAddress = `${instanceId}.${randomChoice(['rds.amazonaws.com', 'rds.aws.amazon.com'])}`;
        const endpointPort = engine === 'postgres' ? 5432 : engine === 'mysql' ? 3306 : engine === 'oracle' ? 1521 : 1433;
        const multiAz = Math.random() > 0.7;
        const publiclyAccessible = Math.random() > 0.5;
        const instanceCreateTime = formatDate(randomDate(new Date(2020, 0, 1), new Date()));
        
        const tags = JSON.stringify([
          { Key: 'Name', Value: `database-${i}` },
          { Key: 'Environment', Value: randomChoice(['dev', 'test', 'staging', 'prod']) },
          { Key: 'Application', Value: randomChoice(['CRM', 'ERP', 'Analytics', 'Web']) }
        ]);
        
        // EOL and EOS dates
        const { eolDate, eosDate } = generateEOLDates();
        const monthlyCost = parseFloat((Math.random() * 500 + 100).toFixed(2));
        
        stmt.run(
          instanceId, account.id, region, instanceClass, engine, engineVersion,
          status, allocatedStorage, endpointAddress, endpointPort, multiAz, publiclyAccessible,
          instanceCreateTime, tags, eolDate, eosDate, monthlyCost,
          function(err) {
            if (err) {
              console.error('Error inserting RDS instance:', err.message);
            }
            
            completedCount++;
            if (completedCount === totalInstances) {
              stmt.finalize();
              console.log(`Generated ${completedCount} RDS instances`);
              resolve();
            }
          }
        );
      }
    });
  });
}

// Generate mock EKS clusters
function generateEKSClusters(db, accounts) {
  return new Promise((resolve, reject) => {
    const versions = ['1.21', '1.22', '1.23', '1.24', '1.25'];
    const platformVersions = ['eks.1', 'eks.2', 'eks.3'];
    const statuses = ['ACTIVE', 'CREATING', 'UPDATING'];
    
    let completedCount = 0;
    const totalClusters = accounts.length * EKS_PER_ACCOUNT;
    const stmt = db.prepare(`
      INSERT INTO eks_clusters (
        id, account_id, region, arn, version, platform_version, status, endpoint, 
        role_arn, vpc_id, subnet_ids, security_group_ids, created_at, eol_date, eos_date, monthly_cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    accounts.forEach(account => {
      for (let i = 0; i < EKS_PER_ACCOUNT; i++) {
        const clusterId = `cluster-${Math.random().toString(36).substring(2, 12)}`;
        const region = randomChoice(REGIONS);
        const arn = `arn:aws:eks:${region}:${account.id}:cluster/${clusterId}`;
        const version = randomChoice(versions);
        const platformVersion = randomChoice(platformVersions);
        const status = randomChoice(statuses);
        const endpoint = `https://${Math.random().toString(36).substring(2, 12)}.gr7.${region}.eks.amazonaws.com`;
        const roleArn = `arn:aws:iam::${account.id}:role/eks-cluster-role-${Math.random().toString(36).substring(2, 10)}`;
        const vpcId = `vpc-${Math.random().toString(36).substring(2, 12)}`;
        
        const subnetCount = Math.floor(Math.random() * 3) + 2;
        const subnetIds = [];
        for (let j = 0; j < subnetCount; j++) {
          subnetIds.push(`subnet-${Math.random().toString(36).substring(2, 12)}`);
        }
        
        const sgCount = Math.floor(Math.random() * 2) + 1;
        const securityGroupIds = [];
        for (let j = 0; j < sgCount; j++) {
          securityGroupIds.push(`sg-${Math.random().toString(36).substring(2, 12)}`);
        }
        
        const createdAt = formatDate(randomDate(new Date(2020, 0, 1), new Date()));
        
        // EOL and EOS dates
        const { eolDate, eosDate } = generateEOLDates();
        const monthlyCost = parseFloat((Math.random() * 1000 + 200).toFixed(2));
        
        stmt.run(
          clusterId, account.id, region, arn, version, platformVersion, status, endpoint,
          roleArn, vpcId, JSON.stringify(subnetIds), JSON.stringify(securityGroupIds), createdAt,
          eolDate, eosDate, monthlyCost,
          function(err) {
            if (err) {
              console.error('Error inserting EKS cluster:', err.message);
            }
            
            completedCount++;
            if (completedCount === totalClusters) {
              stmt.finalize();
              console.log(`Generated ${completedCount} EKS clusters`);
              resolve();
            }
          }
        );
      }
    });
  });
}

// Generate mock Lambda functions
function generateLambdaFunctions(db, accounts) {
  return new Promise((resolve, reject) => {
    const runtimes = ['nodejs14.x', 'nodejs16.x', 'nodejs18.x', 'python3.8', 'python3.9', 'java11', 'dotnet6', 'go1.x'];
    const memorySizes = [128, 256, 512, 1024, 2048, 4096];
    const timeouts = [3, 10, 30, 60, 120, 300, 900];
    const states = ['Active', 'Inactive', 'Pending'];
    const packageTypes = ['Zip', 'Image'];
    
    let completedCount = 0;
    const totalFunctions = accounts.length * LAMBDA_PER_ACCOUNT;
    const stmt = db.prepare(`
      INSERT INTO lambda_functions (
        id, account_id, region, arn, runtime, handler, description, memory_size_mb, 
        timeout_seconds, last_modified, code_size_bytes, state, package_type, role, tags, eol_date, eos_date, monthly_cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    accounts.forEach(account => {
      for (let i = 0; i < LAMBDA_PER_ACCOUNT; i++) {
        const functionName = `lambda-${Math.random().toString(36).substring(2, 10)}`;
        const region = randomChoice(REGIONS);
        const arn = `arn:aws:lambda:${region}:${account.id}:function:${functionName}`;
        const runtime = randomChoice(runtimes);
        
        let handler;
        if (runtime.startsWith('nodejs')) {
          handler = 'index.handler';
        } else if (runtime.startsWith('python')) {
          handler = 'lambda_function.lambda_handler';
        } else if (runtime.startsWith('java')) {
          handler = 'com.example.LambdaHandler::handleRequest';
        } else if (runtime.startsWith('dotnet')) {
          handler = 'Assembly::Namespace.Class::Method';
        } else {
          handler = 'main';
        }
        
        const description = `Lambda function for ${randomChoice(['processing', 'analyzing', 'transforming', 'generating'])} ${randomChoice(['data', 'images', 'events', 'messages'])}`;
        const memorySize = randomChoice(memorySizes);
        const timeout = randomChoice(timeouts);
        const lastModified = formatDate(randomDate(new Date(2020, 0, 1), new Date()));
        const codeSize = Math.floor(Math.random() * 50000000) + 1000;
        const state = randomChoice(states);
        const packageType = randomChoice(packageTypes);
        const role = `arn:aws:iam::${account.id}:role/lambda-execution-role-${Math.random().toString(36).substring(2, 10)}`;
        
        const tags = JSON.stringify({
          Name: functionName,
          Environment: randomChoice(['dev', 'test', 'staging', 'prod']),
          Service: randomChoice(['API', 'Processing', 'Notification', 'Integration'])
        });
        
        // EOL and EOS dates
        const { eolDate, eosDate } = generateEOLDates();
        const monthlyCost = parseFloat((Math.random() * 50 + 5).toFixed(2));
        
        stmt.run(
          functionName, account.id, region, arn, runtime, handler, description, memorySize,
          timeout, lastModified, codeSize, state, packageType, role, tags, eolDate, eosDate, monthlyCost,
          function(err) {
            if (err) {
              console.error('Error inserting Lambda function:', err.message);
            }
            
            completedCount++;
            if (completedCount === totalFunctions) {
              stmt.finalize();
              console.log(`Generated ${completedCount} Lambda functions`);
              resolve();
            }
          }
        );
      }
    });
  });
}

// Main function to generate all mock data
async function generateMockData() {
  try {
    console.log('Starting mock data generation...');
    
    const db = await initializeDatabase();
    const accounts = await generateAccounts(db);
    
    await Promise.all([
      generateEC2Instances(db, accounts),
      generateRDSInstances(db, accounts),
      generateEKSClusters(db, accounts),
      generateLambdaFunctions(db, accounts)
    ]);
    
    console.log('Mock data generation completed');
    
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  } catch (error) {
    console.error('Error generating mock data:', error);
  }
}

// Run the data generation
generateMockData();