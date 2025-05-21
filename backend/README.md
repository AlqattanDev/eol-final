# AWS End-of-Life Dashboard Backend

This directory contains the backend components for the AWS End-of-Life Dashboard, including:

1. A SQLite database for storing AWS resource data
2. A data collection script to fetch AWS resource information
3. A Node.js API server to serve the data to the frontend

## Setup and Installation

### Prerequisites

- Node.js 14.x or later
- npm or yarn
- AWS CLI configured with appropriate permissions
- SQLite3

### Installation

1. Install dependencies:

```bash
cd backend
npm install
```

2. Generate mock data for development (no AWS credentials required):

```bash
node generate_mock_data.js
```

3. For real AWS data collection (requires AWS credentials):

```bash
chmod +x fetch_aws_data.sh
./fetch_aws_data.sh
```

4. Start the API server:

```bash
npm start
```

The server will start on port 3001 by default. You can change this by setting the `PORT` environment variable.

## Database Schema

The SQLite database (`backend.db`) includes the following tables:

- `aws_accounts`: Information about AWS accounts
- `ec2_instances`: EC2 instance details
- `rds_instances`: RDS database details
- `eks_clusters`: EKS cluster details
- `lambda_functions`: Lambda function details

Each resource table includes the following EOL-related fields:
- `eol_date`: End-of-Life date for the resource
- `eos_date`: End-of-Support date for the resource

## API Endpoints

### Account Endpoints

- `GET /api/accounts`: List all AWS accounts
- `GET /api/accounts/:id`: Get details for a specific account
- `GET /api/accounts/:id/summary`: Get summary statistics for an account

### EC2 Endpoints

- `GET /api/ec2`: List all EC2 instances
- `GET /api/ec2/:id`: Get details for a specific EC2 instance
- `GET /api/ec2/stats/summary`: Get summary statistics for EC2 instances

### RDS Endpoints

- `GET /api/rds`: List all RDS instances
- `GET /api/rds/:id`: Get details for a specific RDS instance
- `GET /api/rds/stats/summary`: Get summary statistics for RDS instances

### EKS Endpoints

- `GET /api/eks`: List all EKS clusters
- `GET /api/eks/:id`: Get details for a specific EKS cluster
- `GET /api/eks/stats/summary`: Get summary statistics for EKS clusters

### Lambda Endpoints

- `GET /api/lambda`: List all Lambda functions
- `GET /api/lambda/:id`: Get details for a specific Lambda function
- `GET /api/lambda/stats/summary`: Get summary statistics for Lambda functions

### EOL Endpoints

- `GET /api/eol`: List all resources with EOL information
- `GET /api/eol/stats/summary`: Get summary EOL statistics across all resources

### Health Check

- `GET /api/health`: Check API server and database status

## Data Collection

The `fetch_aws_data.sh` script:

1. Creates the SQLite database schema if it doesn't exist
2. Connects to AWS using the configured AWS CLI credentials
3. Collects EC2, RDS, EKS, and Lambda resource information
4. Stores the data in the SQLite database

The script is designed to be run periodically to keep the database up-to-date.