const express = require('express');
const router = express.Router();
const { runQuery } = require('../db');

// Get all RDS instances
router.get('/', async (req, res) => {
  try {
    const { account_id, region, engine } = req.query;
    let query = 'SELECT * FROM rds_instances';
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
    
    if (engine) {
      conditions.push('engine = ?');
      params.push(engine);
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

// Get a specific RDS instance by ID
router.get('/:id', async (req, res) => {
  try {
    const instance = await runQuery('SELECT * FROM rds_instances WHERE id = ?', [req.params.id]);
    
    if (instance.length === 0) {
      return res.status(404).json({ error: 'RDS instance not found' });
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

// Get summary statistics for RDS instances
router.get('/stats/summary', async (req, res) => {
  try {
    const { account_id } = req.query;
    let params = [];
    let accountCondition = '';
    
    if (account_id) {
      accountCondition = 'WHERE account_id = ?';
      params.push(account_id);
    }
    
    // Get counts by engine
    const engineQuery = `
      SELECT engine, COUNT(*) as count 
      FROM rds_instances 
      ${accountCondition}
      GROUP BY engine
    `;
    const engineStats = await runQuery(engineQuery, params);
    
    // Get counts by db instance class
    const instanceClassQuery = `
      SELECT db_instance_class, COUNT(*) as count 
      FROM rds_instances 
      ${accountCondition}
      GROUP BY db_instance_class
    `;
    const instanceClassStats = await runQuery(instanceClassQuery, params);
    
    // Get counts by region
    const regionQuery = `
      SELECT region, COUNT(*) as count 
      FROM rds_instances 
      ${accountCondition}
      GROUP BY region
    `;
    const regionStats = await runQuery(regionQuery, params);
    
    // Get counts by multi_az
    const multiAzQuery = `
      SELECT multi_az, COUNT(*) as count 
      FROM rds_instances 
      ${accountCondition}
      GROUP BY multi_az
    `;
    const multiAzStats = await runQuery(multiAzQuery, params);
    
    res.json({
      engineStats,
      instanceClassStats,
      regionStats,
      multiAzStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;