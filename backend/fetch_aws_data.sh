#!/bin/bash

DB_NAME="backend.db"
REGIONS=("eu-west-1" "me-south-1")

echo "Initializing SQLite database: $DB_NAME"
sqlite3 "$DB_NAME" <<EOF
CREATE TABLE IF NOT EXISTS aws_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ec2_instances (
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
);

CREATE TABLE IF NOT EXISTS rds_instances (
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
);

CREATE TABLE IF NOT EXISTS eks_clusters (
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
);

CREATE TABLE IF NOT EXISTS lambda_functions (
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
);
EOF

# Get current AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "Error: Could not retrieve AWS Account ID. Please ensure you are authenticated."
    exit 1
fi

echo "Fetching data for AWS Account: $AWS_ACCOUNT_ID"
# Insert/Update aws_accounts table
sqlite3 "$DB_NAME" "INSERT OR IGNORE INTO aws_accounts (id, name) VALUES ('$AWS_ACCOUNT_ID', '$AWS_ACCOUNT_ID');"

for REGION in "${REGIONS[@]}"; do
    echo "Processing region: $REGION"

    # 1. Fetch EC2 Instances and SSM Information
    echo "  Fetching EC2 instances and SSM information..."
    EC2_INSTANCES=$(aws ec2 describe-instances --region "$REGION" --output json --no-cli-pager)
    SSM_INFO=$(aws ssm describe-instance-information --region "$REGION" --output json --no-cli-pager)

    echo "$EC2_INSTANCES" | jq -c '.Reservations[].Instances[]' | while read -r INSTANCE; do
        INSTANCE_ID=$(echo "$INSTANCE" | jq -r '.InstanceId')
        INSTANCE_TYPE=$(echo "$INSTANCE" | jq -r '.InstanceType // "N/A"')
        IMAGE_ID=$(echo "$INSTANCE" | jq -r '.ImageId // "N/A"')
        LAUNCH_TIME=$(echo "$INSTANCE" | jq -r '.LaunchTime // "N/A"')
        STATE_NAME=$(echo "$INSTANCE" | jq -r '.State.Name // "N/A"')
        PRIVATE_IP=$(echo "$INSTANCE" | jq -r '.PrivateIpAddress // "N/A"')
        PUBLIC_IP=$(echo "$INSTANCE" | jq -r '.PublicIpAddress // "N/A"')
        ARCHITECTURE=$(echo "$INSTANCE" | jq -r '.Architecture // "N/A"')
        VPC_ID=$(echo "$INSTANCE" | jq -r '.VpcId // "N/A"')
        SUBNET_ID=$(echo "$INSTANCE" | jq -r '.SubnetId // "N/A"')
        TAGS=$(echo "$INSTANCE" | jq -c '.Tags // []') # Store tags as JSON array string

        PLATFORM_NAME="N/A"
        PLATFORM_VERSION="N/A"

        # Find corresponding SSM info
        SSM_DETAILS=$(echo "$SSM_INFO" | jq -c --arg iid "$INSTANCE_ID" '.InstanceInformationList[] | select(.InstanceId == $iid)')
        if [ -n "$SSM_DETAILS" ]; then
            PLATFORM_NAME=$(echo "$SSM_DETAILS" | jq -r '.PlatformName // "N/A"')
            PLATFORM_VERSION=$(echo "$SSM_DETAILS" | jq -r '.PlatformVersion // "N/A"')
        fi
        
        # Insert or update EC2 instance
        sqlite3 "$DB_NAME" "INSERT OR REPLACE INTO ec2_instances (id, account_id, region, instance_type, platform_name, platform_version, image_id, launch_time, state, private_ip_address, public_ip_address, architecture, vpc_id, subnet_id, tags, eol_date, eos_date, monthly_cost) VALUES (
            '$INSTANCE_ID',
            '$AWS_ACCOUNT_ID',
            '$REGION',
            '$INSTANCE_TYPE',
            '$PLATFORM_NAME',
            '$PLATFORM_VERSION',
            '$IMAGE_ID',
            '$LAUNCH_TIME',
            '$STATE_NAME',
            '$PRIVATE_IP',
            '$PUBLIC_IP',
            '$ARCHITECTURE',
            '$VPC_ID',
            '$SUBNET_ID',
            '$(echo "$TAGS" | sed "s/'/''/g")', -- Escape single quotes for SQL
            'N/A', -- Placeholder
            'N/A', -- Placeholder
            0.0    -- Placeholder
        );"
    done

    # 2. Fetch RDS Instances
    echo "  Fetching RDS instances..."
    RDS_INSTANCES=$(aws rds describe-db-instances --region "$REGION" --output json --no-cli-pager)

    echo "$RDS_INSTANCES" | jq -c '.DBInstances[]' | while read -r INSTANCE; do
        DB_INSTANCE_IDENTIFIER=$(echo "$INSTANCE" | jq -r '.DBInstanceIdentifier')
        DB_INSTANCE_CLASS=$(echo "$INSTANCE" | jq -r '.DBInstanceClass // "N/A"')
        ENGINE=$(echo "$INSTANCE" | jq -r '.Engine // "N/A"')
        ENGINE_VERSION=$(echo "$INSTANCE" | jq -r '.EngineVersion // "N/A"')
        DB_INSTANCE_STATUS=$(echo "$INSTANCE" | jq -r '.DBInstanceStatus // "N/A"')
        ALLOCATED_STORAGE=$(echo "$INSTANCE" | jq -r '.AllocatedStorage // 0')
        ENDPOINT_ADDRESS=$(echo "$INSTANCE" | jq -r '.Endpoint.Address // "N/A"')
        ENDPOINT_PORT=$(echo "$INSTANCE" | jq -r '.Endpoint.Port // 0')
        MULTI_AZ=$(echo "$INSTANCE" | jq -r '.MultiAZ // false')
        PUBLICLY_ACCESSIBLE=$(echo "$INSTANCE" | jq -r '.PubliclyAccessible // false')
        INSTANCE_CREATE_TIME=$(echo "$INSTANCE" | jq -r '.InstanceCreateTime // "N/A"')
        TAGS=$(echo "$INSTANCE" | jq -c '.TagList // []')

        sqlite3 "$DB_NAME" "INSERT OR REPLACE INTO rds_instances (id, account_id, region, db_instance_class, engine, engine_version, db_instance_status, allocated_storage_gb, endpoint_address, endpoint_port, multi_az, publicly_accessible, instance_create_time, tags, eol_date, eos_date, monthly_cost) VALUES (
            '$DB_INSTANCE_IDENTIFIER',
            '$AWS_ACCOUNT_ID',
            '$REGION',
            '$DB_INSTANCE_CLASS',
            '$ENGINE',
            '$ENGINE_VERSION',
            '$DB_INSTANCE_STATUS',
            $ALLOCATED_STORAGE,
            '$ENDPOINT_ADDRESS',
            $ENDPOINT_PORT,
            $MULTI_AZ,
            $PUBLICLY_ACCESSIBLE,
            '$INSTANCE_CREATE_TIME',
            '$(echo "$TAGS" | sed "s/'/''/g")',
            'N/A', -- Placeholder
            'N/A', -- Placeholder
            0.0    -- Placeholder
        );"
    done

    # 3. Fetch EKS Clusters
    echo "  Fetching EKS clusters..."
    EKS_CLUSTERS=$(aws eks list-clusters --region "$REGION" --output json --no-cli-pager)

    echo "$EKS_CLUSTERS" | jq -r '.clusters[]' | while read -r CLUSTER_NAME; do
        CLUSTER_DETAILS=$(aws eks describe-cluster --name "$CLUSTER_NAME" --region "$REGION" --output json --no-cli-pager)
        
        CLUSTER_ARN=$(echo "$CLUSTER_DETAILS" | jq -r '.cluster.arn // "N/A"')
        VERSION=$(echo "$CLUSTER_DETAILS" | jq -r '.cluster.version // "N/A"')
        PLATFORM_VERSION=$(echo "$CLUSTER_DETAILS" | jq -r '.cluster.platformVersion // "N/A"')
        STATUS=$(echo "$CLUSTER_DETAILS" | jq -r '.cluster.status // "N/A"')
        ENDPOINT=$(echo "$CLUSTER_DETAILS" | jq -r '.cluster.endpoint // "N/A"')
        ROLE_ARN=$(echo "$CLUSTER_DETAILS" | jq -r '.cluster.roleArn // "N/A"')
        CREATED_AT=$(echo "$CLUSTER_DETAILS" | jq -r '.cluster.createdAt // "N/A"')
        VPC_ID=$(echo "$CLUSTER_DETAILS" | jq -r '.cluster.resourcesVpcConfig.vpcId // "N/A"')
        SUBNET_IDS=$(echo "$CLUSTER_DETAILS" | jq -c '.cluster.resourcesVpcConfig.subnetIds // []')
        SECURITY_GROUP_IDS=$(echo "$CLUSTER_DETAILS" | jq -c '.cluster.resourcesVpcConfig.securityGroupIds // []')

        sqlite3 "$DB_NAME" "INSERT OR REPLACE INTO eks_clusters (id, account_id, region, arn, version, platform_version, status, endpoint, role_arn, vpc_id, subnet_ids, security_group_ids, created_at, eol_date, eos_date, monthly_cost) VALUES (
            '$CLUSTER_NAME',
            '$AWS_ACCOUNT_ID',
            '$REGION',
            '$CLUSTER_ARN',
            '$VERSION',
            '$PLATFORM_VERSION',
            '$STATUS',
            '$ENDPOINT',
            '$ROLE_ARN',
            '$VPC_ID',
            '$(echo "$SUBNET_IDS" | sed "s/'/''/g")',
            '$(echo "$SECURITY_GROUP_IDS" | sed "s/'/''/g")',
            '$CREATED_AT',
            'N/A', -- Placeholder
            'N/A', -- Placeholder
            0.0    -- Placeholder
        );"
    done

    # 4. Fetch Lambda Functions
    echo "  Fetching Lambda functions..."
    # Loop through Lambda functions, handling pagination if necessary
    NEXT_MARKER=""
    while true; do
        LAMBDA_FUNCTIONS=$(aws lambda list-functions --region "$REGION" --max-items 50 --marker "$NEXT_MARKER" --output json --no-cli-pager)
        
        echo "$LAMBDA_FUNCTIONS" | jq -c '.Functions[]' | while read -r FUNC; do
            FUNCTION_NAME=$(echo "$FUNC" | jq -r '.FunctionName')
            FUNCTION_ARN=$(echo "$FUNC" | jq -r '.FunctionArn // "N/A"')
            RUNTIME=$(echo "$FUNC" | jq -r '.Runtime // "N/A"')
            HANDLER=$(echo "$FUNC" | jq -r '.Handler // "N/A"')
            DESCRIPTION=$(echo "$FUNC" | jq -r '.Description // "N/A"')
            MEMORY_SIZE=$(echo "$FUNC" | jq -r '.MemorySize // 0')
            TIMEOUT=$(echo "$FUNC" | jq -r '.Timeout // 0')
            LAST_MODIFIED=$(echo "$FUNC" | jq -r '.LastModified // "N/A"')
            CODE_SIZE=$(echo "$FUNC" | jq -r '.CodeSize // 0')
            STATE=$(echo "$FUNC" | jq -r '.State // "N/A"')
            PACKAGE_TYPE=$(echo "$FUNC" | jq -r '.PackageType // "N/A"')
            ROLE=$(echo "$FUNC" | jq -r '.Role // "N/A"')
            
            # Fetch tags separately as list-functions doesn't always include them.
            # get-function configuration will include tags.
            LAMBDA_CONFIG=$(aws lambda get-function-configuration --function-name "$FUNCTION_NAME" --region "$REGION" --output json --no-cli-pager)
            TAGS=$(echo "$LAMBDA_CONFIG" | jq -c '.Tags // {}') # Tags are an object, store as JSON string

            sqlite3 "$DB_NAME" "INSERT OR REPLACE INTO lambda_functions (id, account_id, region, arn, runtime, handler, description, memory_size_mb, timeout_seconds, last_modified, code_size_bytes, state, package_type, role, tags, eol_date, eos_date, monthly_cost) VALUES (
                '$FUNCTION_NAME',
                '$AWS_ACCOUNT_ID',
                '$REGION',
                '$FUNCTION_ARN',
                '$RUNTIME',
                '$HANDLER',
                '$DESCRIPTION',
                $MEMORY_SIZE,
                $TIMEOUT,
                '$LAST_MODIFIED',
                $CODE_SIZE,
                '$STATE',
                '$PACKAGE_TYPE',
                '$ROLE',
                '$(echo "$TAGS" | sed "s/'/''/g")',
                'N/A', -- Placeholder
                'N/A', -- Placeholder
                0.0    -- Placeholder
            );"
        done

        NEXT_MARKER=$(echo "$LAMBDA_FUNCTIONS" | jq -r '.NextMarker // ""')
        if [ -z "$NEXT_MARKER" ] || [ "$NEXT_MARKER" == "null" ]; then
            break
        fi
    done

done

echo "Data fetching complete. SQLite database '$DB_NAME' updated."