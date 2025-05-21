const express = require('express');
const cors = require('cors');
const path = require('path');
const { checkDatabase } = require('./db');

// Route handlers
const accountsRouter = require('./routes/accounts');
const ec2Router = require('./routes/ec2');
const rdsRouter = require('./routes/rds');
const eksRouter = require('./routes/eks');
const lambdaRouter = require('./routes/lambda');
const eolRouter = require('./routes/eol');

const app = express();
const PORT = process.env.PORT || 8083;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/accounts', accountsRouter);
app.use('/api/ec2', ec2Router);
app.use('/api/rds', rdsRouter);
app.use('/api/eks', eksRouter);
app.use('/api/lambda', lambdaRouter);
app.use('/api/eol', eolRouter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await checkDatabase();
  res.json({
    status: 'up',
    timestamp: new Date(),
    database: dbStatus ? 'connected' : 'disconnected or missing tables'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'AWS EOL Dashboard API',
    version: '1.0.0',
    endpoints: {
      '/api/accounts': 'AWS account information',
      '/api/ec2': 'EC2 instances data',
      '/api/rds': 'RDS instances data',
      '/api/eks': 'EKS clusters data',
      '/api/lambda': 'Lambda functions data',
      '/api/eol': 'EOL status across all resources',
      '/api/health': 'API health status'
    }
  });
});

// Serve static assets from the frontend build in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React frontend app
  app.use(express.static(path.join(__dirname, '../build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});

process.on('SIGINT', () => {
  console.log('Server shutting down...');
  process.exit();
});

module.exports = app;