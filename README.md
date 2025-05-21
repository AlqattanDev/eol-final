# AWS End-of-Life Dashboard

A modern dashboard for tracking and monitoring AWS resources with end-of-life and end-of-support information, helping organizations manage their infrastructure lifecycle more effectively.

![AWS EOL Dashboard](/public/dashboard-preview.png)

## Features

- **Resource Tracking**: Monitor end-of-life and end-of-support dates for AWS resources (EC2, RDS, AKS, Lambda)
- **Dashboard Visualization**: Visual representation of resource status, types, and timelines
- **Advanced Filtering**: Search, filter, and sort resources by various attributes
- **Status Indicators**: Easily identify expired resources, resources expiring soon, and supported resources
- **Notification Settings**: Configure email and Slack notifications for resources approaching end-of-life
- **AWS Integration**: Support for multiple AWS accounts and regions

## Technology Stack

- React for frontend UI components
- TailwindCSS for styling with dark mode support
- Chart.js for data visualization
- React Router for navigation
- date-fns for date formatting and calculations

## Getting Started

### Prerequisites

- Node.js (v14.0 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/aws-eol-dashboard.git
   cd aws-eol-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
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
├── public/
├── src/
│   ├── components/     # React components
│   ├── data/           # Mock data and data utilities
│   ├── hooks/          # Custom React hooks
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
1. Update the mock data generation in `src/data/mockData.js`
2. Add appropriate icons and labels in the UI components

### Custom Filter Criteria

Additional filters can be added by:
1. Extending the filter state in `src/components/Resources.js`
2. Adding UI controls in `src/components/ResourceFilter.js`
3. Implementing the filter logic in the `filteredResources` function

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons provided by [Heroicons](https://heroicons.com/)
- Styling based on [Tailwind CSS](https://tailwindcss.com/)