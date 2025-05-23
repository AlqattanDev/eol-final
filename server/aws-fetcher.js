#!/usr/bin/env node

/**
 * AWS Resource Fetcher for EOL Dashboard
 * Fetches AWS resources and their EOL information from multiple accounts
 * Uses specific AWS SDK commands as requested:
 * - EC2: aws ec2 describe-instances + aws ssm describe-instances (merged)
 * - RDS: aws rds with engine type and version
 * - Lambda: aws lambda with runtime and version
 * - EKS: aws eks with cluster versions
 */

import { 
  EC2Client, 
  DescribeInstancesCommand
} from '@aws-sdk/client-ec2';
import { 
  SSMClient, 
  DescribeInstanceInformationCommand
} from '@aws-sdk/client-ssm';
import { 
  RDSClient, 
  DescribeDBInstancesCommand,
  DescribeDBClustersCommand 
} from '@aws-sdk/client-rds';
import { 
  EKSClient, 
  ListClustersCommand,
  DescribeClusterCommand 
} from '@aws-sdk/client-eks';
import { 
  LambdaClient, 
  ListFunctionsCommand 
} from '@aws-sdk/client-lambda';
import { 
  STSClient, 
  GetCallerIdentityCommand 
} from '@aws-sdk/client-sts';

import PortableEOLDatabase from './portable-db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// EOL Data - Updated with more comprehensive data
const EOL_DATA = {
  // EC2 Instance Types
  't1.micro': { eolDate: '2024-12-31', eosDate: '2024-12-31' },
  't2.nano': { eolDate: '2030-12-31', eosDate: '2030-12-31' },
  't2.micro': { eolDate: '2030-12-31', eosDate: '2030-12-31' },
  't3.nano': { eolDate: '2030-12-31', eosDate: '2030-12-31' },
  't3.micro': { eolDate: '2030-12-31', eosDate: '2030-12-31' },
  'm1.small': { eolDate: '2024-12-31', eosDate: '2024-12-31' },
  'm1.medium': { eolDate: '2024-12-31', eosDate: '2024-12-31' },
  'm1.large': { eolDate: '2024-12-31', eosDate: '2024-12-31' },
  'm1.xlarge': { eolDate: '2024-12-31', eosDate: '2024-12-31' },
  'm5.large': { eolDate: '2030-12-31', eosDate: '2030-12-31' },
  'm5.xlarge': { eolDate: '2030-12-31', eosDate: '2030-12-31' },
  
  // RDS Engine Versions - PostgreSQL
  'postgres-11': { eolDate: '2024-11-09', eosDate: '2024-11-09' },
  'postgres-12': { eolDate: '2025-11-14', eosDate: '2025-11-14' },
  'postgres-13': { eolDate: '2026-11-13', eosDate: '2026-11-13' },
  'postgres-14': { eolDate: '2027-11-12', eosDate: '2027-11-12' },
  'postgres-15': { eolDate: '2028-11-11', eosDate: '2028-11-11' },
  
  // RDS Engine Versions - MySQL
  'mysql-5.7': { eolDate: '2025-10-31', eosDate: '2025-10-31' },
  'mysql-8.0': { eolDate: '2026-04-30', eosDate: '2026-04-30' },
  
  // RDS Engine Versions - MariaDB
  'mariadb-10.3': { eolDate: '2024-05-25', eosDate: '2024-05-25' },
  'mariadb-10.4': { eolDate: '2024-06-18', eosDate: '2024-06-18' },
  'mariadb-10.5': { eolDate: '2025-06-24', eosDate: '2025-06-24' },
  'mariadb-10.6': { eolDate: '2026-07-06', eosDate: '2026-07-06' },
  
  // EKS Versions
  'eks-1.21': { eolDate: '2024-02-01', eosDate: '2024-02-01' },
  'eks-1.22': { eolDate: '2024-05-01', eosDate: '2024-05-01' },
  'eks-1.23': { eolDate: '2024-10-01', eosDate: '2024-10-01' },
  'eks-1.24': { eolDate: '2025-01-31', eosDate: '2025-01-31' },
  'eks-1.25': { eolDate: '2025-05-01', eosDate: '2025-05-01' },
  'eks-1.26': { eolDate: '2025-09-01', eosDate: '2025-09-01' },
  'eks-1.27': { eolDate: '2026-01-01', eosDate: '2026-01-01' },
  'eks-1.28': { eolDate: '2026-05-01', eosDate: '2026-05-01' },
  
  // Lambda Runtimes
  'python3.7': { eolDate: '2024-11-27', eosDate: '2024-11-27' },
  'python3.8': { eolDate: '2025-10-14', eosDate: '2025-10-14' },
  'python3.9': { eolDate: '2026-10-05', eosDate: '2026-10-05' },
  'python3.10': { eolDate: '2027-10-04', eosDate: '2027-10-04' },
  'python3.11': { eolDate: '2028-10-24', eosDate: '2028-10-24' },
  'python3.12': { eolDate: '2029-10-02', eosDate: '2029-10-02' },
  'nodejs14.x': { eolDate: '2024-11-27', eosDate: '2024-11-27' },
  'nodejs16.x': { eolDate: '2025-06-30', eosDate: '2025-06-30' },
  'nodejs18.x': { eolDate: '2026-04-30', eosDate: '2026-04-30' },
  'nodejs20.x': { eolDate: '2027-04-30', eosDate: '2027-04-30' },
  'java8': { eolDate: '2024-12-31', eosDate: '2024-12-31' },
  'java8.al2': { eolDate: '2025-12-31', eosDate: '2025-12-31' },
  'java11': { eolDate: '2026-09-30', eosDate: '2026-09-30' },
  'java17': { eolDate: '2028-09-30', eosDate: '2028-09-30' },
  'java21': { eolDate: '2030-09-30', eosDate: '2030-09-30' },
  'dotnet6': { eolDate: '2024-11-12', eosDate: '2024-11-12' },
  'dotnet8': { eolDate: '2026-11-10', eosDate: '2026-11-10' },
  'go1.x': { eolDate: '2024-12-31', eosDate: '2024-12-31' },
  'provided.al2': { eolDate: '2030-12-31', eosDate: '2030-12-31' },
  'provided.al2023': { eolDate: '2030-12-31', eosDate: '2030-12-31' }
};

export class AWSResourceFetcher {
  constructor(config = {}) {
    this.config = {
      region: config.region || 'us-east-1',
      profile: config.profile,
      maxRetries: config.maxRetries || 3,
      regions: config.regions || ['us-east-1'],
      services: config.services || ['ec2', 'rds', 'eks', 'lambda']
    };
    
    this.db = config.database || new PortableEOLDatabase();
    this.serverName = config.serverName || this.getServerName();
    this.accountInfo = null;
  }

  getServerName() {
    try {
      return require('os').hostname();
    } catch {
      return 'unknown-server';
    }
  }

  async initialize() {
    // Get AWS account information
    try {
      const stsClient = new STSClient({ 
        region: this.config.region,
        ...(this.config.profile && { profile: this.config.profile })
      });
      
      const identity = await stsClient.send(new GetCallerIdentityCommand({}));
      this.accountInfo = {
        accountId: identity.Account,
        arn: identity.Arn
      };
      
      console.log(`Connected to AWS Account: ${this.accountInfo.accountId}`);
      return true;
    } catch (error) {
      console.error('Failed to connect to AWS:', error.message);
      return false;
    }
  }

  async fetchAllResources() {
    if (!await this.initialize()) {
      throw new Error('Failed to initialize AWS connection');
    }

    // Start collection run
    const runId = this.db.startCollectionRun(this.accountInfo.accountId, this.serverName);
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
        this.db.addResourcesBulk(allResources, this.serverName);
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
      name: `AWS Account ${this.accountInfo.accountId}`,
      color: '#FF9500', // AWS Orange
      description: `Fetched from ${this.serverName}`,
      awsRegion: this.config.region,
      environment: this.config.environment || 'production'
    };
    
    this.db.addAccount(accountData, this.serverName);
  }

  // Fetch EC2 instances using both EC2 and SSM, then merge the data
  async fetchEC2Resources(region) {
    const ec2Client = new EC2Client({ 
      region,
      ...(this.config.profile && { profile: this.config.profile })
    });
    
    const ssmClient = new SSMClient({ 
      region,
      ...(this.config.profile && { profile: this.config.profile })
    });
    
    const resources = [];
    
    try {
      // Step 1: Get EC2 instances using aws ec2 describe-instances
      console.log(`    Fetching EC2 instances...`);
      const ec2Command = new DescribeInstancesCommand({});
      const ec2Response = await ec2Client.send(ec2Command);
      
      const ec2Instances = new Map(); // instanceId -> instance data
      
      for (const reservation of ec2Response.Reservations || []) {
        for (const instance of reservation.Instances || []) {
          const name = instance.Tags?.find(tag => tag.Key === 'Name')?.Value || 
                      instance.InstanceId;
          
          const eolInfo = EOL_DATA[instance.InstanceType] || {
            eolDate: '2030-12-31', // Default far future date
            eosDate: '2030-12-31'
          };
          
          ec2Instances.set(instance.InstanceId, {
            resourceId: instance.InstanceId,
            name: name,
            service: 'EC2',
            region: region,
            eolDate: eolInfo.eolDate,
            eosDate: eolInfo.eosDate,
            account: this.accountInfo.accountId,
            type: 'instance',
            description: `${instance.InstanceType} instance`,
            metadata: {
              instanceType: instance.InstanceType,
              state: instance.State?.Name,
              platform: instance.Platform,
              vpcId: instance.VpcId,
              subnetId: instance.SubnetId,
              launchTime: instance.LaunchTime,
              source: 'ec2-only'
            }
          });
        }
      }
      
      // Step 2: Get SSM managed instances using aws ssm describe-instances
      console.log(`    Fetching SSM managed instances...`);
      try {
        const ssmCommand = new DescribeInstanceInformationCommand({});
        const ssmResponse = await ssmClient.send(ssmCommand);
        
        for (const ssmInstance of ssmResponse.InstanceInformationList || []) {
          const instanceId = ssmInstance.InstanceId;
          
          if (ec2Instances.has(instanceId)) {
            // Merge SSM data with existing EC2 data
            const existingInstance = ec2Instances.get(instanceId);
            existingInstance.metadata = {
              ...existingInstance.metadata,
              source: 'ec2-and-ssm',
              ssmAgentVersion: ssmInstance.AgentVersion,
              ssmPingStatus: ssmInstance.PingStatus,
              ssmLastPingTime: ssmInstance.LastPingDateTime,
              ssmPlatformType: ssmInstance.PlatformType,
              ssmPlatformName: ssmInstance.PlatformName,
              ssmPlatformVersion: ssmInstance.PlatformVersion,
              ssmIsLatestVersion: ssmInstance.IsLatestVersion,
              ssmAssociationStatus: ssmInstance.AssociationStatus
            };
            existingInstance.description += ' (SSM managed)';
          } else {
            // SSM-only instance (not found in EC2)
            const eolInfo = {
              eolDate: '2030-12-31',
              eosDate: '2030-12-31'
            };
            
            ec2Instances.set(instanceId, {
              resourceId: instanceId,
              name: ssmInstance.Name || instanceId,
              service: 'EC2',
              region: region,
              eolDate: eolInfo.eolDate,
              eosDate: eolInfo.eosDate,
              account: this.accountInfo.accountId,
              type: 'instance',
              description: `SSM managed instance (${ssmInstance.PlatformType})`,
              metadata: {
                source: 'ssm-only',
                ssmAgentVersion: ssmInstance.AgentVersion,
                ssmPingStatus: ssmInstance.PingStatus,
                ssmLastPingTime: ssmInstance.LastPingDateTime,
                ssmPlatformType: ssmInstance.PlatformType,
                ssmPlatformName: ssmInstance.PlatformName,
                ssmPlatformVersion: ssmInstance.PlatformVersion,
                ssmIsLatestVersion: ssmInstance.IsLatestVersion,
                ssmAssociationStatus: ssmInstance.AssociationStatus
              }
            });
          }
        }
      } catch (ssmError) {
        console.log(`    SSM not available in ${region}: ${ssmError.message}`);
      }
      
      // Convert map to array
      resources.push(...Array.from(ec2Instances.values()));
      
    } catch (error) {
      console.error(`Error fetching EC2/SSM resources in ${region}:`, error.message);
    }
    
    return resources;
  }

  // Fetch RDS instances and clusters with engine type and version
  async fetchRDSResources(region) {
    const client = new RDSClient({ 
      region,
      ...(this.config.profile && { profile: this.config.profile })
    });
    
    const resources = [];
    
    try {
      // Fetch DB Instances
      console.log(`    Fetching RDS DB instances...`);
      const instancesCommand = new DescribeDBInstancesCommand({});
      const instancesResponse = await client.send(instancesCommand);
      
      for (const instance of instancesResponse.DBInstances || []) {
        // Create engine key for EOL lookup (e.g., "postgres-13", "mysql-8.0")
        const engineKey = `${instance.Engine}-${instance.EngineVersion?.split('.')[0]}${instance.EngineVersion?.split('.')[1] ? '.' + instance.EngineVersion?.split('.')[1] : ''}`;
        const eolInfo = EOL_DATA[engineKey] || {
          eolDate: '2030-12-31',
          eosDate: '2030-12-31'
        };
        
        resources.push({
          resourceId: instance.DBInstanceIdentifier,
          name: instance.DBInstanceIdentifier,
          service: 'RDS',
          region: region,
          eolDate: eolInfo.eolDate,
          eosDate: eolInfo.eosDate,
          account: this.accountInfo.accountId,
          type: 'database',
          description: `${instance.Engine} ${instance.EngineVersion} database instance`,
          metadata: {
            engine: instance.Engine,
            engineVersion: instance.EngineVersion,
            instanceClass: instance.DBInstanceClass,
            status: instance.DBInstanceStatus,
            multiAZ: instance.MultiAZ,
            storageType: instance.StorageType,
            allocatedStorage: instance.AllocatedStorage,
            storageEncrypted: instance.StorageEncrypted,
            licenseModel: instance.LicenseModel,
            autoMinorVersionUpgrade: instance.AutoMinorVersionUpgrade,
            resourceType: 'instance'
          }
        });
      }
      
      // Fetch DB Clusters
      console.log(`    Fetching RDS DB clusters...`);
      const clustersCommand = new DescribeDBClustersCommand({});
      const clustersResponse = await client.send(clustersCommand);
      
      for (const cluster of clustersResponse.DBClusters || []) {
        // Create engine key for EOL lookup
        const engineKey = `${cluster.Engine}-${cluster.EngineVersion?.split('.')[0]}${cluster.EngineVersion?.split('.')[1] ? '.' + cluster.EngineVersion?.split('.')[1] : ''}`;
        const eolInfo = EOL_DATA[engineKey] || {
          eolDate: '2030-12-31',
          eosDate: '2030-12-31'
        };
        
        resources.push({
          resourceId: cluster.DBClusterIdentifier,
          name: cluster.DBClusterIdentifier,
          service: 'RDS',
          region: region,
          eolDate: eolInfo.eolDate,
          eosDate: eolInfo.eosDate,
          account: this.accountInfo.accountId,
          type: 'cluster',
          description: `${cluster.Engine} ${cluster.EngineVersion} database cluster`,
          metadata: {
            engine: cluster.Engine,
            engineVersion: cluster.EngineVersion,
            status: cluster.Status,
            multiAZ: cluster.MultiAZ,
            clusterMembers: cluster.DBClusterMembers?.length || 0,
            storageEncrypted: cluster.StorageEncrypted,
            backupRetentionPeriod: cluster.BackupRetentionPeriod,
            resourceType: 'cluster'
          }
        });
      }
    } catch (error) {
      console.error(`Error fetching RDS resources in ${region}:`, error.message);
    }
    
    return resources;
  }

  // Fetch EKS clusters with their versions
  async fetchEKSResources(region) {
    const client = new EKSClient({ 
      region,
      ...(this.config.profile && { profile: this.config.profile })
    });
    
    const resources = [];
    
    try {
      console.log(`    Fetching EKS clusters...`);
      const listCommand = new ListClustersCommand({});
      const listResponse = await client.send(listCommand);
      
      for (const clusterName of listResponse.clusters || []) {
        const describeCommand = new DescribeClusterCommand({ name: clusterName });
        const clusterResponse = await client.send(describeCommand);
        const cluster = clusterResponse.cluster;
        
        // Create version key for EOL lookup (e.g., "eks-1.27")
        const versionKey = `eks-${cluster.version}`;
        const eolInfo = EOL_DATA[versionKey] || {
          eolDate: '2030-12-31',
          eosDate: '2030-12-31'
        };
        
        resources.push({
          resourceId: cluster.arn,
          name: clusterName,
          service: 'EKS',
          region: region,
          eolDate: eolInfo.eolDate,
          eosDate: eolInfo.eosDate,
          account: this.accountInfo.accountId,
          type: 'cluster',
          description: `Kubernetes cluster v${cluster.version}`,
          metadata: {
            version: cluster.version,
            status: cluster.status,
            endpoint: cluster.endpoint,
            platformVersion: cluster.platformVersion,
            createdAt: cluster.createdAt,
            roleArn: cluster.roleArn,
            vpcConfig: {
              subnetIds: cluster.resourcesVpcConfig?.subnetIds,
              securityGroupIds: cluster.resourcesVpcConfig?.securityGroupIds,
              endpointConfigPrivateAccess: cluster.resourcesVpcConfig?.endpointConfigPrivateAccess,
              endpointConfigPublicAccess: cluster.resourcesVpcConfig?.endpointConfigPublicAccess
            },
            kubernetesNetworkConfig: cluster.kubernetesNetworkConfig,
            logging: cluster.logging
          }
        });
      }
    } catch (error) {
      console.error(`Error fetching EKS resources in ${region}:`, error.message);
    }
    
    return resources;
  }

  // Fetch Lambda functions with runtime and version
  async fetchLambdaResources(region) {
    const client = new LambdaClient({ 
      region,
      ...(this.config.profile && { profile: this.config.profile })
    });
    
    const resources = [];
    
    try {
      console.log(`    Fetching Lambda functions...`);
      let nextMarker = null;
      
      do {
        const command = new ListFunctionsCommand({
          ...(nextMarker && { Marker: nextMarker })
        });
        const response = await client.send(command);
        
        for (const func of response.Functions || []) {
          // Get EOL info based on runtime
          const eolInfo = EOL_DATA[func.Runtime] || {
            eolDate: '2030-12-31',
            eosDate: '2030-12-31'
          };
          
          resources.push({
            resourceId: func.FunctionArn,
            name: func.FunctionName,
            service: 'Lambda',
            region: region,
            eolDate: eolInfo.eolDate,
            eosDate: eolInfo.eosDate,
            account: this.accountInfo.accountId,
            type: 'function',
            description: `${func.Runtime} function (${func.Version})`,
            metadata: {
              runtime: func.Runtime,
              version: func.Version,
              handler: func.Handler,
              codeSize: func.CodeSize,
              timeout: func.Timeout,
              memorySize: func.MemorySize,
              lastModified: func.LastModified,
              description: func.Description,
              role: func.Role,
              environment: func.Environment,
              deadLetterConfig: func.DeadLetterConfig,
              kmsKeyArn: func.KMSKeyArn,
              tracingConfig: func.TracingConfig,
              layers: func.Layers?.map(layer => ({
                arn: layer.Arn,
                codeSize: layer.CodeSize
              })),
              state: func.State,
              stateReason: func.StateReason,
              packageType: func.PackageType
            }
          });
        }
        
        nextMarker = response.NextMarker;
      } while (nextMarker);
      
    } catch (error) {
      console.error(`Error fetching Lambda resources in ${region}:`, error.message);
    }
    
    return resources;
  }
}

// CLI interface when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  async function main() {
    const configFile = process.argv[2] || 'aws-config.json';
    
    let config = {
      regions: ['us-east-1'],
      services: ['ec2', 'rds', 'eks', 'lambda'] // Removed elasticache
    };
    
    // Load config file if it exists
    if (fs.existsSync(configFile)) {
      config = { ...config, ...JSON.parse(fs.readFileSync(configFile, 'utf8')) };
    } else {
      console.log(`Config file ${configFile} not found, using defaults`);
    }
    
    const fetcher = new AWSResourceFetcher(config);
    
    try {
      const result = await fetcher.fetchAllResources();
      console.log('\nFetch completed successfully!');
      console.log(`Account: ${result.accountId}`);
      console.log(`Total resources: ${result.totalResources}`);
      
      // Show database stats
      console.log('\nDatabase Statistics:');
      console.log(JSON.stringify(fetcher.db.getStats(), null, 2));
      
    } catch (error) {
      console.error('Error during fetch:', error.message);
      process.exit(1);
    }
  }
  
  main();
}

export default AWSResourceFetcher;