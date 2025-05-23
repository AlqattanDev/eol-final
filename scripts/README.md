# AWS Resource Fetch Scripts

This directory contains scripts for fetching AWS resource data and importing it into the EOL Dashboard.

## Files

- **`fetch-aws-resources.sh`** - Main script to fetch AWS resources with EOL data
- **`aws-eol-dates.json`** - EOL/EOS date mappings for AWS services

## Usage

```bash
# Fetch resources to default ./data directory
./fetch-aws-resources.sh

# Fetch to custom directory
./fetch-aws-resources.sh ~/my-aws-data
```

## Requirements

- AWS CLI configured with credentials
- `jq` for JSON processing
- `python3` for date calculations
- Read permissions for AWS services (EC2, RDS, Lambda, EKS)

## Output

The script generates:
- `resources.json` - All AWS resources with EOL information
- `accounts.json` - AWS account details
- `fetch-metadata.json` - Metadata about the fetch operation

See [AWS_FETCH_GUIDE.md](../AWS_FETCH_GUIDE.md) for detailed documentation.