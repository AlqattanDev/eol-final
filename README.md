# AWS End-of-Life Dashboard

A modern dashboard for tracking and monitoring AWS resources with end-of-life and end-of-support information, helping organizations manage their infrastructure lifecycle more effectively.

![AWS EOL Dashboard](/public/dashboard-preview.png)

## Features

- **Resource Tracking**: Monitor end-of-life and end-of-support dates for AWS resources (EC2, RDS, EKS, Lambda)
- **Dashboard Visualization**: Visual representation of resource status, types, and timelines
- **Advanced Filtering**: Search, filter, and sort resources by various attributes
- **Status Indicators**: Easily identify expired resources, resources expiring soon, and supported resources
- **Notification Settings**: Configure email and Slack notifications for resources approaching end-of-life
- **AWS Integration**: Support for multiple AWS accounts and regions

## Technology Stack

### Frontend
- React for UI components
- TailwindCSS for styling with dark mode support
- Chart.js for data visualization
- React Router for navigation
- date-fns for date formatting and calculations

### Backend
- Node.js Express API server
- SQLite database for storing AWS resource data
- Bash script for AWS resource data collection
- AWS CLI for interacting with AWS services

## Getting Started

### Prerequisites

- Node.js (v14.0 or later)
- npm or yarn
- AWS CLI (configured with appropriate permissions)
- SQLite3

### Backend Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate mock data for development (no AWS credentials required):
   ```bash
   node generate_mock_data.js
   ```

4. OR collect real AWS data (requires AWS credentials):
   ```bash
   chmod +x fetch_aws_data.sh
   ./fetch_aws_data.sh
   ```

5. Start the API server:
   ```bash
   npm start
   ```

   The server will start on port 3001 by default.

### Frontend Installation

1. In a new terminal, navigate to the project root:
   ```bash
   cd ..
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the dashboard in your browser.

## Usage

### Dashboard

The main dashboard provides a high-level overview of your resources, including:
- Summary statistics for total resources, expired resources, and resources expiring soon
- Status distribution chart showing the proportion of resources by status
- Resources by type visualization
- Recently expiring resources table

### Resources

The Resources page allows you to:
- View all resources in a sortable, filterable table
- Search for specific resources by name
- Filter resources by type, region, cost, and status
- Sort resources by any column

### Settings

The Settings page enables you to configure:
- Notification preferences for expiring resources
- Alert thresholds for warnings and critical notifications
- AWS account settings and region selection
- Data refresh intervals

## Project Structure

```
aws-eol-dashboard/
├── backend/
│   ├── routes/         # API route handlers
│   ├── fetch_aws_data.sh  # AWS data collection script
│   ├── generate_mock_data.js  # Mock data generator
│   ├── db.js           # Database middleware
│   ├── server.js       # Express API server
│   └── package.json    # Backend dependencies
├── public/
├── src/
│   ├── components/     # React components
│   ├── context/        # React context providers
│   ├── data/           # Mock data and data utilities
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── App.js          # Main App component with routing
│   └── index.js        # Entry point
├── package.json
└── README.md
```

## Customization

### Theming

The dashboard supports both light and dark modes. The theme can be toggled using the button in the sidebar.

### Adding New Resource Types

To add support for additional AWS resource types:
1. Update the backend database schema in `backend/fetch_aws_data.sh`
2. Add a new route handler in the `backend/routes/` directory
3. Update the mock data generation in `src/data/mockData.js`
4. Add appropriate icons and labels in the UI components
5. Update the API service in `src/services/api.js`

### Custom Filter Criteria

Additional filters can be added by:
1. Extending the filter state in `src/components/Resources.js`
2. Adding UI controls in `src/components/ResourceFilter.js`
3. Implementing the filter logic in the `filteredResources` function

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## API Endpoints

- `/api/accounts` - AWS account information
- `/api/ec2` - EC2 instance data
- `/api/rds` - RDS instance data 
- `/api/eks` - EKS cluster data (replaces AKS)
- `/api/lambda` - Lambda function data
- `/api/eol` - EOL status across all resources
- `/api/health` - API health status

## Resource Status Logic

Resources are classified into three statuses:
- **Expired**: EOL date is in the past
- **Expiring**: EOL date is within the next 90 days
- **Supported**: EOL date is more than 90 days in the future

## Acknowledgments

- Icons provided by [Heroicons](https://heroicons.com/) and [Lucide](https://lucide.dev/)
- Styling based on [Tailwind CSS](https://tailwindcss.com/)
- Backend powered by [Express](https://expressjs.com/) and [SQLite](https://www.sqlite.org/)