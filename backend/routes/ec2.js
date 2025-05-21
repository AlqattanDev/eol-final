const express = require('express');
const router = express.Router();
const { runQuery } = require('../db');

// Get all EC2 instances
router.get('/', async (req, res) => {
  try {
    const { account_id, region, state } = req.query;
    let query = 'SELECT * FROM ec2_instances';
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
    
    if (state) {
      conditions.push('state = ?');
      params.push(state);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    const instances = await runQuery(query, params);
    
    // Parse the tags JSON field
    instances.forEach(instance => {
      try {
        if (instance.tags && instance.tags !== 'N/A') {
          instance.tags = JSON.parse(instance.tags);
        } else {
          instance.tags = [];
        }
      } catch (e) {
        instance.tags = [];
      }
    });
    
    res.json(instances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific EC2 instance by ID
router.get('/:id', async (req, res) => {
  try {
    const instance = await runQuery('SELECT * FROM ec2_instances WHERE id = ?', [req.params.id]);
    
    if (instance.length === 0) {
      return res.status(404).json({ error: 'Instance not found' });
    }
    
    // Parse the tags JSON field
    try {
      if (instance[0].tags && instance[0].tags !== 'N/A') {
        instance[0].tags = JSON.parse(instance[0].tags);
      } else {
        instance[0].tags = [];
      }
    } catch (e) {
      instance[0].tags = [];
    }
    
    res.json(instance[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get summary statistics for EC2 instances
router.get('/stats/summary', async (req, res) => {
  try {
    const { account_id } = req.query;
    let params = [];
    let accountCondition = '';
    
    if (account_id) {
      accountCondition = 'WHERE account_id = ?';
      params.push(account_id);
    }
    
    // Get counts by state
    const stateQuery = `
      SELECT state, COUNT(*) as count 
      FROM ec2_instances 
      ${accountCondition}
      GROUP BY state
    `;
    const stateStats = await runQuery(stateQuery, params);
    
    // Get counts by instance type
    const instanceTypeQuery = `
      SELECT instance_type, COUNT(*) as count 
      FROM ec2_instances 
      ${accountCondition}
      GROUP BY instance_type
    `;
    const instanceTypeStats = await runQuery(instanceTypeQuery, params);
    
    // Get counts by region
    const regionQuery = `
      SELECT region, COUNT(*) as count 
      FROM ec2_instances 
      ${accountCondition}
      GROUP BY region
    `;
    const regionStats = await runQuery(regionQuery, params);
    
    // Get counts by platform
    const platformQuery = `
      SELECT platform_name, COUNT(*) as count 
      FROM ec2_instances 
      ${accountCondition}
      GROUP BY platform_name
    `;
    const platformStats = await runQuery(platformQuery, params);
    
    res.json({
      stateStats,
      instanceTypeStats,
      regionStats,
      platformStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;