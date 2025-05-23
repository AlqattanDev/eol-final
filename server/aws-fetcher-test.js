#!/usr/bin/env node

/**
 * Test version of AWS fetcher with mock data
 * Tests the CLI functionality without requiring real AWS credentials
 */

import PortableEOLDatabase from './portable-db-json.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock AWS services for testing
class MockAWSResourceFetcher {
  constructor(config = {}) {
    this.config = {
      region: config.region || 'us-east-1',
      profile: config.profile,
      regions: config.regions || ['us-east-1'],
      services: config.services || ['ec2', 'rds', 'eks', 'lambda'],
      serverName: config.serverName || 'test-server'
    };
    
    this.db = config.database || new PortableEOLDatabase();
    this.accountInfo = {
      accountId: '123456789012',
      arn: 'arn:aws:sts::123456789012:assumed-role/test-role/test-session'
    };
  }

  async initialize() {
    console.log(`Connected to Mock AWS Account: ${this.accountInfo.accountId}`);
    return true;
  }

  async fetchAllResources() {
    if (!await this.initialize()) {
      throw new Error('Failed to initialize AWS connection');
    }

    // Start collection run
    const runId = this.db.startCollectionRun(this.accountInfo.accountId, this.config.serverName);
    let totalResources = 0;
    
    try {
      // Add account to database
      await this.addAccountToDatabase();
      
      const allResources = [];
      
      for (const region of this.config.regions) {
        console.log(`\nFetching resources from region: ${region}`);
        
        if (this.config.services.includes('ec2')) {
          const ec2Resources = await this.fetchEC2Resources(region);
          allResources.push(...ec2Resources);
          console.log(`  EC2: ${ec2Resources.length} resources`);
        }
        
        if (this.config.services.includes('rds')) {
          const rdsResources = await this.fetchRDSResources(region);
          allResources.push(...rdsResources);
          console.log(`  RDS: ${rdsResources.length} resources`);
        }
        
        if (this.config.services.includes('eks')) {
          const eksResources = await this.fetchEKSResources(region);
          allResources.push(...eksResources);
          console.log(`  EKS: ${eksResources.length} resources`);
        }
        
        if (this.config.services.includes('lambda')) {
          const lambdaResources = await this.fetchLambdaResources(region);
          allResources.push(...lambdaResources);
          console.log(`  Lambda: ${lambdaResources.length} resources`);
        }
      }
      
      // Add resources to database in bulk
      if (allResources.length > 0) {
        this.db.addResourcesBulk(allResources, this.config.serverName);
        totalResources = allResources.length;
      }
      
      // Complete collection run
      this.db.endCollectionRun(runId, totalResources, 'completed');
      
      console.log(`\nCollection completed successfully!`);
      console.log(`Total resources found: ${totalResources}`);
      
      return {
        accountId: this.accountInfo.accountId,
        totalResources,
        resources: allResources
      };
      
    } catch (error) {
      this.db.endCollectionRun(runId, totalResources, 'failed', error.message);
      throw error;
    }
  }

  async addAccountToDatabase() {
    const accountData = {
      accountId: this.accountInfo.accountId,
      name: `Mock AWS Account ${this.accountInfo.accountId}`,
      color: '#FF9500',
      description: `Test account from ${this.config.serverName}`,
      awsRegion: this.config.region,
      environment: 'test'
    };
    
    this.db.addAccount(accountData, this.config.serverName);
  }

  // Mock EC2 resources with merged EC2/SSM data
  async fetchEC2Resources(region) {
    console.log(`    Fetching EC2 instances...`);
    console.log(`    Fetching SSM managed instances...`);
    
    return [
      {
        resourceId: 'i-1234567890abcdef0',
        name: 'Web Server 1',
        service: 'EC2',
        region: region,
        eolDate: '2030-12-31',
        eosDate: '2030-12-31',
        account: this.accountInfo.accountId,
        type: 'instance',
        description: 't3.medium instance (SSM managed)',
        metadata: {
          instanceType: 't3.medium',
          state: 'running',
          platform: 'Linux',
          source: 'ec2-and-ssm',
          ssmAgentVersion: '3.2.1550.0',
          ssmPingStatus: 'Online',
          ssmPlatformType: 'Linux',
          ssmPlatformName: 'Amazon Linux'
        }
      },
      {
        resourceId: 'i-0987654321fedcba0',
        name: 'Database Server',
        service: 'EC2',
        region: region,
        eolDate: '2024-12-31',
        eosDate: '2024-12-31',
        account: this.accountInfo.accountId,
        type: 'instance',
        description: 'm1.large instance',
        metadata: {
          instanceType: 'm1.large',
          state: 'running',
          source: 'ec2-only'
        }
      },
      {
        resourceId: 'mi-1111222233334444',
        name: 'Managed Instance',
        service: 'EC2',
        region: region,
        eolDate: '2030-12-31',
        eosDate: '2030-12-31',
        account: this.accountInfo.accountId,
        type: 'instance',
        description: 'SSM managed instance (Windows)',
        metadata: {
          source: 'ssm-only',
          ssmAgentVersion: '3.2.1550.0',
          ssmPingStatus: 'Online',
          ssmPlatformType: 'Windows'
        }
      }
    ];
  }

  // Mock RDS resources with engine types and versions
  async fetchRDSResources(region) {
    console.log(`    Fetching RDS DB instances...`);
    console.log(`    Fetching RDS DB clusters...`);
    
    return [
      {
        resourceId: 'prod-postgres-db',
        name: 'prod-postgres-db',
        service: 'RDS',
        region: region,
        eolDate: '2026-11-13',
        eosDate: '2026-11-13',
        account: this.accountInfo.accountId,
        type: 'database',
        description: 'postgres 13.15 database instance',
        metadata: {
          engine: 'postgres',
          engineVersion: '13.15',
          instanceClass: 'db.t3.medium',
          status: 'available',
          resourceType: 'instance'
        }
      },
      {
        resourceId: 'mysql-cluster-prod',
        name: 'mysql-cluster-prod',
        service: 'RDS',
        region: region,
        eolDate: '2025-10-31',
        eosDate: '2025-10-31',
        account: this.accountInfo.accountId,
        type: 'cluster',
        description: 'mysql 5.7.44 database cluster',
        metadata: {
          engine: 'mysql',
          engineVersion: '5.7.44',
          status: 'available',
          clusterMembers: 2,
          resourceType: 'cluster'
        }
      }
    ];
  }

  // Mock EKS clusters with versions
  async fetchEKSResources(region) {
    console.log(`    Fetching EKS clusters...`);
    
    return [
      {
        resourceId: 'arn:aws:eks:us-east-1:123456789012:cluster/production-cluster',
        name: 'production-cluster',
        service: 'EKS',
        region: region,
        eolDate: '2024-10-01',
        eosDate: '2024-10-01',
        account: this.accountInfo.accountId,
        type: 'cluster',
        description: 'Kubernetes cluster v1.23',
        metadata: {
          version: '1.23',
          status: 'ACTIVE',
          platformVersion: 'eks.15'
        }
      },
      {
        resourceId: 'arn:aws:eks:us-east-1:123456789012:cluster/dev-cluster',
        name: 'dev-cluster',
        service: 'EKS',
        region: region,
        eolDate: '2026-01-01',
        eosDate: '2026-01-01',
        account: this.accountInfo.accountId,
        type: 'cluster',
        description: 'Kubernetes cluster v1.27',
        metadata: {
          version: '1.27',
          status: 'ACTIVE',
          platformVersion: 'eks.3'
        }
      }
    ];
  }

  // Mock Lambda functions with runtimes and versions
  async fetchLambdaResources(region) {
    console.log(`    Fetching Lambda functions...`);
    
    return [
      {
        resourceId: 'arn:aws:lambda:us-east-1:123456789012:function:legacy-processor',
        name: 'legacy-processor',
        service: 'Lambda',
        region: region,
        eolDate: '2024-11-27',
        eosDate: '2024-11-27',
        account: this.accountInfo.accountId,
        type: 'function',
        description: 'python3.7 function ($LATEST)',
        metadata: {
          runtime: 'python3.7',
          version: '$LATEST',
          handler: 'lambda_function.lambda_handler',
          timeout: 30,
          memorySize: 128
        }
      },
      {
        resourceId: 'arn:aws:lambda:us-east-1:123456789012:function:api-handler',
        name: 'api-handler',
        service: 'Lambda',
        region: region,
        eolDate: '2027-04-30',
        eosDate: '2027-04-30',
        account: this.accountInfo.accountId,
        type: 'function',
        description: 'nodejs20.x function (1)',
        metadata: {
          runtime: 'nodejs20.x',
          version: '1',
          handler: 'index.handler',
          timeout: 15,
          memorySize: 256
        }
      },
      {
        resourceId: 'arn:aws:lambda:us-east-1:123456789012:function:data-processor',
        name: 'data-processor',
        service: 'Lambda',
        region: region,
        eolDate: '2028-09-30',
        eosDate: '2028-09-30',
        account: this.accountInfo.accountId,
        type: 'function',
        description: 'java17 function (2)',
        metadata: {
          runtime: 'java17',
          version: '2',
          handler: 'com.example.Handler::handleRequest',
          timeout: 60,
          memorySize: 512
        }
      }
    ];
  }
}

// CLI interface
async function main() {
  const configFile = process.argv[2] || 'aws-config.json';
  
  let config = {
    regions: ['us-east-1', 'us-west-2'],
    services: ['ec2', 'rds', 'eks', 'lambda'],
    serverName: 'test-collector'
  };
  
  // Load config file if it exists
  if (fs.existsSync(configFile)) {
    config = { ...config, ...JSON.parse(fs.readFileSync(configFile, 'utf8')) };
  } else {
    console.log(`Config file ${configFile} not found, using test defaults`);
  }
  
  const fetcher = new MockAWSResourceFetcher(config);
  
  try {
    const result = await fetcher.fetchAllResources();
    console.log('\nTest fetch completed successfully!');
    console.log(`Account: ${result.accountId}`);
    console.log(`Total resources: ${result.totalResources}`);
    
    // Show database stats
    console.log('\nDatabase Statistics:');
    console.log(JSON.stringify(fetcher.db.getStats(), null, 2));
    
  } catch (error) {
    console.error('Error during test fetch:', error.message);
    process.exit(1);
  }
}

main();