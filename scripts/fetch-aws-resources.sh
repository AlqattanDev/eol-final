#!/bin/bash

# AWS EOL Dashboard - Resource Fetcher Script (Fixed Version)
# Compatible with both macOS and Linux

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Configuration
OUTPUT_DIR="${1:-./data}"
EOL_MAPPING_FILE="${SCRIPT_DIR}/aws-eol-dates.json"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TEMP_DIR="/tmp/aws-eol-${TIMESTAMP}"

# Create directories
mkdir -p "${OUTPUT_DIR}"
mkdir -p "${TEMP_DIR}"

echo -e "${GREEN}AWS EOL Dashboard - Resource Fetcher${NC}"
echo "======================================"
echo ""

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    if ! command -v aws &> /dev/null; then
        missing_deps+=("aws-cli")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
    fi
    
    if ! command -v python3 &> /dev/null; then
        missing_deps+=("python3")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}Error: Missing dependencies:${NC}"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo ""
        echo "Please install missing dependencies and try again."
        exit 1
    fi
}

check_dependencies

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured${NC}"
    echo "Please run: aws configure"
    exit 1
fi

# Check EOL mapping file
if [ ! -f "$EOL_MAPPING_FILE" ]; then
    echo -e "${YELLOW}Warning: EOL mapping file not found. Will proceed without EOL dates.${NC}"
    EOL_MAPPING_FILE=""
fi

# Get AWS account info
echo -e "${YELLOW}Fetching AWS account information...${NC}"
ACCOUNT_INFO=$(aws sts get-caller-identity --output json)
ACCOUNT_ID=$(echo "$ACCOUNT_INFO" | jq -r '.Account')

# Try to get account alias
ACCOUNT_ALIAS=$(aws iam list-account-aliases --query AccountAliases[0] --output text 2>/dev/null || echo "")
if [ -z "$ACCOUNT_ALIAS" ] || [ "$ACCOUNT_ALIAS" = "None" ]; then
    ACCOUNT_NAME="AWS Account ${ACCOUNT_ID}"
else
    ACCOUNT_NAME="${ACCOUNT_ALIAS}"
fi

echo -e "Account ID: ${GREEN}${ACCOUNT_ID}${NC}"
echo -e "Account Name: ${GREEN}${ACCOUNT_NAME}${NC}"
echo ""

# Get list of enabled regions
echo -e "${YELLOW}Getting enabled regions...${NC}"
REGIONS=$(aws ec2 describe-regions --query 'Regions[?OptInStatus==`opt-in-not-required` || OptInStatus==`opted-in`].RegionName' --output text)
REGION_COUNT=$(echo "$REGIONS" | wc -w | tr -d ' ')
echo -e "Found ${GREEN}${REGION_COUNT}${NC} enabled regions"
echo ""

# Cross-platform date calculation using Python
calculate_days_until() {
    local date_str=$1
    python3 -c "
from datetime import datetime
try:
    eol = datetime.strptime('$date_str', '%Y-%m-%d')
    now = datetime.now()
    days = (eol - now).days
    print(days)
except:
    print('999999')  # Return large number if date parsing fails
"
}

# Calculate status based on EOL date
calculate_status() {
    local eol_date=$1
    
    if [ "$eol_date" = "null" ] || [ -z "$eol_date" ]; then
        echo "supported"
        return
    fi
    
    # Remove quotes if present
    eol_date=$(echo "$eol_date" | tr -d '"')
    
    local days_until=$(calculate_days_until "$eol_date")
    
    if [ $days_until -lt 0 ]; then
        echo "expired"
    elif [ $days_until -lt 90 ]; then
        echo "expiring"
    else
        echo "supported"
    fi
}

# Lookup EOL dates from mapping file
lookup_eol_dates() {
    local service=$1
    local type=$2
    local version=$3
    
    if [ -z "$EOL_MAPPING_FILE" ] || [ ! -f "$EOL_MAPPING_FILE" ]; then
        echo "null|null"
        return
    fi
    
    # Clean version number
    version=$(echo "$version" | grep -oE '^[0-9]+\.[0-9]+' || echo "$version")
    
    local eol_date="null"
    local eos_date="null"
    
    case "$service" in
        "RDS")
            if [[ "$type" =~ mysql ]]; then
                eol_date=$(jq -r ".RDS.mysql.\"$version\".eol // null" "$EOL_MAPPING_FILE" 2>/dev/null || echo "null")
                eos_date=$(jq -r ".RDS.mysql.\"$version\".eos // null" "$EOL_MAPPING_FILE" 2>/dev/null || echo "null")
            elif [[ "$type" =~ postgres ]]; then
                eol_date=$(jq -r ".RDS.postgres.\"$version\".eol // null" "$EOL_MAPPING_FILE" 2>/dev/null || echo "null")
                eos_date=$(jq -r ".RDS.postgres.\"$version\".eos // null" "$EOL_MAPPING_FILE" 2>/dev/null || echo "null")
            elif [[ "$type" =~ mariadb ]]; then
                eol_date=$(jq -r ".RDS.mariadb.\"$version\".eol // null" "$EOL_MAPPING_FILE" 2>/dev/null || echo "null")
                eos_date=$(jq -r ".RDS.mariadb.\"$version\".eos // null" "$EOL_MAPPING_FILE" 2>/dev/null || echo "null")
            fi
            ;;
        "Lambda")
            eol_date=$(jq -r ".Lambda.runtimes.\"$type\".eol // null" "$EOL_MAPPING_FILE" 2>/dev/null || echo "null")
            eos_date=$(jq -r ".Lambda.runtimes.\"$type\".eos // null" "$EOL_MAPPING_FILE" 2>/dev/null || echo "null")
            ;;
        "EKS")
            eol_date=$(jq -r ".EKS.kubernetes.\"$version\".eol // null" "$EOL_MAPPING_FILE" 2>/dev/null || echo "null")
            eos_date=$(jq -r ".EKS.kubernetes.\"$version\".eos // null" "$EOL_MAPPING_FILE" 2>/dev/null || echo "null")
            ;;
    esac
    
    echo "${eol_date}|${eos_date}"
}

# Initialize resources array
echo "[]" > "${TEMP_DIR}/all_resources.json"

# Process each region
for region in $REGIONS; do
    echo -e "${BLUE}Processing region: ${region}${NC}"
    
    # Create region-specific temp file
    echo "[]" > "${TEMP_DIR}/region_${region}.json"
    
    # Fetch RDS instances
    echo -e "  Fetching RDS instances..."
    aws rds describe-db-instances --region "$region" --output json 2>/dev/null | \
    jq -r '.DBInstances[]? | @base64' | while read -r instance_b64; do
        if [ ! -z "$instance_b64" ]; then
            # Decode the instance data
            instance=$(echo "$instance_b64" | base64 -d)
            
            # Extract fields
            db_id=$(echo "$instance" | jq -r '.DBInstanceIdentifier // "unknown"')
            engine=$(echo "$instance" | jq -r '.Engine // "unknown"')
            version=$(echo "$instance" | jq -r '.EngineVersion // "unknown"')
            arn=$(echo "$instance" | jq -r '.DBInstanceArn // ""')
            instance_class=$(echo "$instance" | jq -r '.DBInstanceClass // "unknown"')
            
            # Lookup EOL dates
            IFS='|' read -r eol_date eos_date <<< $(lookup_eol_dates "RDS" "$engine" "$version")
            
            # Calculate status
            status=$(calculate_status "$eol_date")
            
            # Create resource JSON using jq for proper escaping
            resource_json=$(jq -n \
                --arg rid "$arn" \
                --arg name "$db_id" \
                --arg service "RDS" \
                --arg type "$engine" \
                --arg region "$region" \
                --arg account "$ACCOUNT_ID" \
                --arg eol "$eol_date" \
                --arg eos "$eos_date" \
                --arg status "$status" \
                --arg desc "Engine: $engine $version, Class: $instance_class" \
                '{
                    resourceId: $rid,
                    name: $name,
                    service: $service,
                    type: $type,
                    region: $region,
                    account: $account,
                    eolDate: (if $eol == "null" then null else $eol end),
                    eosDate: (if $eos == "null" then null else $eos end),
                    status: $status,
                    description: $desc
                }')
            
            # Append to region file
            echo "$resource_json" >> "${TEMP_DIR}/region_${region}_resources.json"
            echo -e "    Found RDS: ${GREEN}${db_id}${NC} ($engine $version)"
        fi
    done
    
    # Fetch Lambda functions
    echo -e "  Fetching Lambda functions..."
    aws lambda list-functions --region "$region" --output json 2>/dev/null | \
    jq -r '.Functions[]? | @base64' | while read -r function_b64; do
        if [ ! -z "$function_b64" ]; then
            # Decode the function data
            function=$(echo "$function_b64" | base64 -d)
            
            # Extract fields
            function_name=$(echo "$function" | jq -r '.FunctionName // "unknown"')
            runtime=$(echo "$function" | jq -r '.Runtime // "unknown"')
            arn=$(echo "$function" | jq -r '.FunctionArn // ""')
            memory=$(echo "$function" | jq -r '.MemorySize // 128')
            
            # Skip if runtime is unknown or doesn't exist
            if [ "$runtime" != "unknown" ] && [ "$runtime" != "null" ]; then
                # Lookup EOL dates
                IFS='|' read -r eol_date eos_date <<< $(lookup_eol_dates "Lambda" "$runtime" "")
                
                # Calculate status
                status=$(calculate_status "$eol_date")
                
                # Create resource JSON
                resource_json=$(jq -n \
                    --arg rid "$arn" \
                    --arg name "$function_name" \
                    --arg service "Lambda" \
                    --arg type "Function" \
                    --arg region "$region" \
                    --arg account "$ACCOUNT_ID" \
                    --arg eol "$eol_date" \
                    --arg eos "$eos_date" \
                    --arg status "$status" \
                    --arg desc "Runtime: $runtime, Memory: ${memory}MB" \
                    '{
                        resourceId: $rid,
                        name: $name,
                        service: $service,
                        type: $type,
                        region: $region,
                        account: $account,
                        eolDate: (if $eol == "null" then null else $eol end),
                        eosDate: (if $eos == "null" then null else $eos end),
                        status: $status,
                        description: $desc
                    }')
                
                echo "$resource_json" >> "${TEMP_DIR}/region_${region}_resources.json"
                echo -e "    Found Lambda: ${GREEN}${function_name}${NC} ($runtime)"
            fi
        fi
    done
    
    # Fetch EKS clusters
    echo -e "  Fetching EKS clusters..."
    eks_clusters=$(aws eks list-clusters --region "$region" --query 'clusters[]' --output text 2>/dev/null || echo "")
    
    if [ ! -z "$eks_clusters" ]; then
        for cluster in $eks_clusters; do
            # Get cluster details
            cluster_info=$(aws eks describe-cluster --region "$region" --name "$cluster" --output json 2>/dev/null)
            
            if [ ! -z "$cluster_info" ]; then
                version=$(echo "$cluster_info" | jq -r '.cluster.version // "unknown"')
                arn=$(echo "$cluster_info" | jq -r '.cluster.arn // ""')
                cluster_status=$(echo "$cluster_info" | jq -r '.cluster.status // "unknown"')
                
                # Lookup EOL dates
                IFS='|' read -r eol_date eos_date <<< $(lookup_eol_dates "EKS" "" "$version")
                
                # Calculate status
                status=$(calculate_status "$eol_date")
                
                # Create resource JSON
                resource_json=$(jq -n \
                    --arg rid "$arn" \
                    --arg name "$cluster" \
                    --arg service "EKS" \
                    --arg type "Cluster" \
                    --arg region "$region" \
                    --arg account "$ACCOUNT_ID" \
                    --arg eol "$eol_date" \
                    --arg eos "$eos_date" \
                    --arg status "$status" \
                    --arg desc "Kubernetes v$version, Status: $cluster_status" \
                    '{
                        resourceId: $rid,
                        name: $name,
                        service: $service,
                        type: $type,
                        region: $region,
                        account: $account,
                        eolDate: (if $eol == "null" then null else $eol end),
                        eosDate: (if $eos == "null" then null else $eos end),
                        status: $status,
                        description: $desc
                    }')
                
                echo "$resource_json" >> "${TEMP_DIR}/region_${region}_resources.json"
                echo -e "    Found EKS: ${GREEN}${cluster}${NC} (v$version)"
            fi
        done
    fi
    
    # Fetch EC2 instances (basic info, no specific EOL)
    echo -e "  Fetching EC2 instances..."
    aws ec2 describe-instances --region "$region" --output json 2>/dev/null | \
    jq -r '.Reservations[].Instances[] | @base64' | while read -r instance_b64; do
        if [ ! -z "$instance_b64" ]; then
            # Decode the instance data
            instance=$(echo "$instance_b64" | base64 -d)
            
            # Extract fields
            instance_id=$(echo "$instance" | jq -r '.InstanceId // "unknown"')
            instance_type=$(echo "$instance" | jq -r '.InstanceType // "unknown"')
            state=$(echo "$instance" | jq -r '.State.Name // "unknown"')
            
            # Get Name tag if exists
            name=$(echo "$instance" | jq -r '.Tags[]? | select(.Key=="Name") | .Value // empty' || echo "$instance_id")
            
            if [ "$state" = "running" ] || [ "$state" = "stopped" ]; then
                # Create resource JSON (no EOL for EC2 instances)
                resource_json=$(jq -n \
                    --arg rid "$instance_id" \
                    --arg name "$name" \
                    --arg service "EC2" \
                    --arg type "Instance" \
                    --arg region "$region" \
                    --arg account "$ACCOUNT_ID" \
                    --arg status "supported" \
                    --arg desc "Type: $instance_type, State: $state" \
                    '{
                        resourceId: $rid,
                        name: $name,
                        service: $service,
                        type: $type,
                        region: $region,
                        account: $account,
                        eolDate: null,
                        eosDate: null,
                        status: $status,
                        description: $desc
                    }')
                
                echo "$resource_json" >> "${TEMP_DIR}/region_${region}_resources.json"
                echo -e "    Found EC2: ${GREEN}${name}${NC} ($instance_type)"
            fi
        fi
    done
done

# Combine all resources into a single array
echo -e "\n${YELLOW}Combining all resources...${NC}"
echo "[" > "${OUTPUT_DIR}/resources.json"
first=true

# Process all region files
for region_file in "${TEMP_DIR}"/region_*_resources.json; do
    if [ -f "$region_file" ]; then
        while read -r resource; do
            if [ ! -z "$resource" ] && [ "$resource" != "null" ]; then
                if [ "$first" = true ]; then
                    first=false
                else
                    echo "," >> "${OUTPUT_DIR}/resources.json"
                fi
                echo -n "$resource" >> "${OUTPUT_DIR}/resources.json"
            fi
        done < "$region_file"
    fi
done

echo "]" >> "${OUTPUT_DIR}/resources.json"

# Validate the generated JSON
if ! jq empty "${OUTPUT_DIR}/resources.json" 2>/dev/null; then
    echo -e "${RED}Error: Generated resources.json is invalid${NC}"
    exit 1
fi

# Count resources
TOTAL_RESOURCES=$(jq '. | length' "${OUTPUT_DIR}/resources.json")

# Create/update accounts.json
echo -e "${YELLOW}Creating accounts.json...${NC}"
if [ -f "${OUTPUT_DIR}/accounts.json" ]; then
    # Check if account already exists
    if ! jq --arg id "$ACCOUNT_ID" '.[] | select(.accountId == $id)' "${OUTPUT_DIR}/accounts.json" > /dev/null 2>&1; then
        # Add new account
        jq --arg id "$ACCOUNT_ID" \
           --arg name "$ACCOUNT_NAME" \
           '. += [{accountId: $id, name: $name, color: "#3B82F6", description: "AWS Account"}]' \
           "${OUTPUT_DIR}/accounts.json" > "${OUTPUT_DIR}/accounts.json.tmp"
        mv "${OUTPUT_DIR}/accounts.json.tmp" "${OUTPUT_DIR}/accounts.json"
    fi
else
    # Create new accounts file
    jq -n --arg id "$ACCOUNT_ID" \
          --arg name "$ACCOUNT_NAME" \
          '[{accountId: $id, name: $name, color: "#3B82F6", description: "AWS Account"}]' \
          > "${OUTPUT_DIR}/accounts.json"
fi

# Create metadata file
echo -e "${YELLOW}Creating metadata...${NC}"
jq -n --arg date "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
      --arg account_id "$ACCOUNT_ID" \
      --arg account_name "$ACCOUNT_NAME" \
      --arg count "$TOTAL_RESOURCES" \
      --arg regions "$REGION_COUNT" \
      '{
          fetchDate: $date,
          accountId: $account_id,
          accountName: $account_name,
          resourceCount: ($count | tonumber),
          regionCount: ($regions | tonumber),
          scriptVersion: "1.1.0"
      }' > "${OUTPUT_DIR}/fetch-metadata.json"

# Resource summary
echo -e "\n${YELLOW}Resource Summary:${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
jq -r 'group_by(.service) | .[] | "\(.[] | .service): \(. | length)"' "${OUTPUT_DIR}/resources.json" | \
while read line; do
    echo -e "  ${GREEN}${line}${NC}"
done

echo -e "\n${YELLOW}Status Summary:${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
jq -r 'group_by(.status) | .[] | "\(.[] | .status): \(. | length)"' "${OUTPUT_DIR}/resources.json" | \
while read line; do
    if [[ "$line" =~ expired ]]; then
        echo -e "  ${RED}${line}${NC}"
    elif [[ "$line" =~ expiring ]]; then
        echo -e "  ${YELLOW}${line}${NC}"
    else
        echo -e "  ${GREEN}${line}${NC}"
    fi
done

# Cleanup
rm -rf "${TEMP_DIR}"

# Final summary
echo -e "\n${GREEN}✓ Data fetch complete!${NC}"
echo "======================================"
echo -e "Total resources: ${GREEN}${TOTAL_RESOURCES}${NC}"
echo -e "Output directory: ${GREEN}${OUTPUT_DIR}${NC}"
echo ""
echo "Files created:"
ls -la "${OUTPUT_DIR}"/*.json | awk '{print "  - " $NF}'
echo ""
echo -e "${YELLOW}To import this data:${NC}"
echo "1. Open the EOL Dashboard"
echo "2. Go to Settings > Import/Export"
echo "3. Import the resources.json file"