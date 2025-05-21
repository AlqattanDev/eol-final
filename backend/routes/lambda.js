const express = require('express');
const router = express.Router();
const { runQuery } = require('../db');

// Get all Lambda functions
router.get('/', async (req, res) => {
  try {
    const { account_id, region, runtime } = req.query;
    let query = 'SELECT * FROM lambda_functions';
    const params = [];
    const conditions = [];
    
    if (account_id) {
      conditions.push('account_id = ?');
      params.push(account_id);
    }
    
    if (region) {
      conditions.push('region = ?');
      params.push(region);
    }
    
    if (runtime) {
      conditions.push('runtime = ?');
      params.push(runtime);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    const functions = await runQuery(query, params);
    
    // Parse the tags JSON field
    functions.forEach(func => {
      try {
        if (func.tags && func.tags !== 'N/A') {
          func.tags = JSON.parse(func.tags);
        } else {
          func.tags = {};
        }
      } catch (e) {
        func.tags = {};
      }
    });
    
    res.json(functions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific Lambda function by ID
router.get('/:id', async (req, res) => {
  try {
    const func = await runQuery('SELECT * FROM lambda_functions WHERE id = ?', [req.params.id]);
    
    if (func.length === 0) {
      return res.status(404).json({ error: 'Lambda function not found' });
    }
    
    // Parse the tags JSON field
    try {
      if (func[0].tags && func[0].tags !== 'N/A') {
        func[0].tags = JSON.parse(func[0].tags);
      } else {
        func[0].tags = {};
      }
    } catch (e) {
      func[0].tags = {};
    }
    
    res.json(func[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get summary statistics for Lambda functions
router.get('/stats/summary', async (req, res) => {
  try {
    const { account_id } = req.query;
    let params = [];
    let accountCondition = '';
    
    if (account_id) {
      accountCondition = 'WHERE account_id = ?';
      params.push(account_id);
    }
    
    // Get counts by runtime
    const runtimeQuery = `
      SELECT runtime, COUNT(*) as count 
      FROM lambda_functions 
      ${accountCondition}
      GROUP BY runtime
    `;
    const runtimeStats = await runQuery(runtimeQuery, params);
    
    // Get counts by memory size
    const memorySizeQuery = `
      SELECT memory_size_mb, COUNT(*) as count 
      FROM lambda_functions 
      ${accountCondition}
      GROUP BY memory_size_mb
    `;
    const memorySizeStats = await runQuery(memorySizeQuery, params);
    
    // Get counts by region
    const regionQuery = `
      SELECT region, COUNT(*) as count 
      FROM lambda_functions 
      ${accountCondition}
      GROUP BY region
    `;
    const regionStats = await runQuery(regionQuery, params);
    
    // Get counts by package type
    const packageTypeQuery = `
      SELECT package_type, COUNT(*) as count 
      FROM lambda_functions 
      ${accountCondition}
      GROUP BY package_type
    `;
    const packageTypeStats = await runQuery(packageTypeQuery, params);
    
    res.json({
      runtimeStats,
      memorySizeStats,
      regionStats,
      packageTypeStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;