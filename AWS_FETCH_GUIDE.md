# AWS Resource Fetch Guide

This guide explains how to use the AWS CLI scripts to fetch resource data and import it into the EOL Dashboard.

## Prerequisites

1. **AWS CLI Installation**
   ```bash
   # macOS
   brew install awscli

   # Linux
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install

   # Windows
   # Download and run the MSI installer from https://aws.amazon.com/cli/
   ```

2. **jq Installation** (for JSON processing)
   ```bash
   # macOS
   brew install jq

   # Linux
   sudo apt-get install jq  # Debian/Ubuntu
   sudo yum install jq      # RHEL/CentOS
   ```

3. **AWS Credentials Configuration**
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Enter your default region (e.g., us-east-1)
   # Enter output format (json)
   ```

## Using the Fetch Scripts

### AWS Resource Fetch Script

The script provides a comprehensive way to fetch AWS resources:

```bash
cd /path/to/eol-final
./scripts/fetch-aws-resources.sh

# Or specify a custom output directory:
./scripts/fetch-aws-resources.sh ~/aws-data
```

This will:
- Fetch EC2, RDS, Lambda, and EKS resources from all regions
- Map resources to their EOL/EOS dates
- Save data to `./data/resources.json` (or specified directory)
- Create/update `./data/accounts.json`
- Generate metadata about the fetch operation

Features:
- Cross-platform compatible (macOS and Linux)
- Comprehensive EOL date mapping from `aws-eol-dates.json`
- Proper JSON handling with escaping
- Progress reporting with colored output
- Resource summaries by service and status
- Error handling and validation

## Importing Data into the Dashboard

1. **Run the fetch script** to generate the data files
2. **Open the EOL Dashboard** in your browser
3. **Navigate to Settings** page
4. **Find the Import/Export section**
5. **Click "Import from File"**
6. **Select the `resources.json` file** from your data directory
7. **Choose whether to replace or merge** with existing data

## Automating Data Updates

### Using Cron (Linux/macOS)

Add a cron job to fetch data automatically:

```bash
# Edit crontab
crontab -e

# Add one of these lines:
# Daily at 6 AM
0 6 * * * /path/to/eol-final/scripts/fetch-aws-resources.sh

# Weekly on Mondays at 6 AM
0 6 * * 1 /path/to/eol-final/scripts/fetch-aws-resources.sh

# Monthly on the 1st at 6 AM
0 6 1 * * /path/to/eol-final/scripts/fetch-aws-resources.sh
```

### Using Task Scheduler (Windows)

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (daily/weekly/monthly)
4. Set action to start a program
5. Program: `bash` or `wsl`
6. Arguments: `/path/to/fetch-aws-resources.sh`

### Using AWS Lambda (Serverless)

You can also run the fetch logic in AWS Lambda:

1. Create a Lambda function
2. Use the AWS SDK to fetch resources
3. Store results in S3
4. Download and import into the dashboard

## Multi-Account Setup

To fetch data from multiple AWS accounts:

1. **Configure AWS CLI profiles**:
   ```bash
   # Add a named profile
   aws configure --profile account2
   ```

2. **Create a multi-account fetch script**:
   ```bash
   #!/bin/bash
   
   # Fetch from default account
   ./scripts/fetch-aws-resources.sh ./data/account1
   
   # Fetch from other accounts
   AWS_PROFILE=account2 ./scripts/fetch-aws-resources.sh ./data/account2
   AWS_PROFILE=account3 ./scripts/fetch-aws-resources.sh ./data/account3
   
   # Combine all resources
   jq -s 'add' ./data/*/resources.json > ./data/all-resources.json
   ```

3. **Import the combined data** into the dashboard

## Customizing EOL Dates

The EOL dates are stored in `scripts/aws-eol-dates.json`. To add or update EOL dates:

1. Edit the JSON file
2. Add new versions or services
3. Use ISO date format (YYYY-MM-DD)
4. Include both EOL and EOS dates when available

Example:
```json
{
  "RDS": {
    "mysql": {
      "8.1": { "eol": "2027-04-30", "eos": "2027-10-31" }
    }
  }
}
```

## Troubleshooting

### Permission Errors
- Ensure your AWS credentials have read permissions for all services
- Required IAM permissions:
  - `ec2:Describe*`
  - `rds:Describe*`
  - `lambda:List*`
  - `eks:List*` and `eks:Describe*`

### No Resources Found
- Check that resources exist in the regions being scanned
- Verify AWS CLI is using the correct profile
- Check CloudTrail for API call failures

### Script Errors
- Ensure all dependencies are installed (aws, jq)
- Check script has execute permissions: `chmod +x script.sh`
- Run with debug mode: `bash -x script.sh`

## Security Best Practices

1. **Use IAM roles** instead of access keys when possible
2. **Limit permissions** to read-only access
3. **Rotate credentials** regularly
4. **Store credentials securely** (use aws-vault or similar)
5. **Audit access** through CloudTrail

## Performance Tips

1. **Use the enhanced script** for parallel processing
2. **Limit regions** if you only use specific ones:
   ```bash
   AWS_DEFAULT_REGION=us-east-1 ./scripts/fetch-aws-resources-v2.sh
   ```
3. **Schedule during off-peak hours** to avoid rate limits
4. **Cache results** and only fetch when needed

## Example IAM Policy

Create a read-only policy for the fetch script:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeRegions",
        "rds:DescribeDBInstances",
        "lambda:ListFunctions",
        "eks:ListClusters",
        "eks:DescribeCluster",
        "iam:ListAccountAliases",
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

## Next Steps

1. Set up automated fetching with cron or Task Scheduler
2. Configure multiple AWS accounts if needed
3. Customize EOL dates for your specific needs
4. Consider implementing real-time updates with AWS EventBridge
5. Set up alerts for expiring resources