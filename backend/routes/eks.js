const express = require('express');
const router = express.Router();
const { runQuery } = require('../db');

// Get all EKS clusters
router.get('/', async (req, res) => {
  try {
    const { account_id, region, version } = req.query;
    let query = 'SELECT * FROM eks_clusters';
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
    
    if (version) {
      conditions.push('version = ?');
      params.push(version);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    const clusters = await runQuery(query, params);
    
    // Parse the JSON array fields
    clusters.forEach(cluster => {
      try {
        if (cluster.subnet_ids && cluster.subnet_ids !== 'N/A') {
          cluster.subnet_ids = JSON.parse(cluster.subnet_ids);
        } else {
          cluster.subnet_ids = [];
        }
        
        if (cluster.security_group_ids && cluster.security_group_ids !== 'N/A') {
          cluster.security_group_ids = JSON.parse(cluster.security_group_ids);
        } else {
          cluster.security_group_ids = [];
        }
      } catch (e) {
        cluster.subnet_ids = [];
        cluster.security_group_ids = [];
      }
    });
    
    res.json(clusters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific EKS cluster by ID
router.get('/:id', async (req, res) => {
  try {
    const cluster = await runQuery('SELECT * FROM eks_clusters WHERE id = ?', [req.params.id]);
    
    if (cluster.length === 0) {
      return res.status(404).json({ error: 'EKS cluster not found' });
    }
    
    // Parse the JSON array fields
    try {
      if (cluster[0].subnet_ids && cluster[0].subnet_ids !== 'N/A') {
        cluster[0].subnet_ids = JSON.parse(cluster[0].subnet_ids);
      } else {
        cluster[0].subnet_ids = [];
      }
      
      if (cluster[0].security_group_ids && cluster[0].security_group_ids !== 'N/A') {
        cluster[0].security_group_ids = JSON.parse(cluster[0].security_group_ids);
      } else {
        cluster[0].security_group_ids = [];
      }
    } catch (e) {
      cluster[0].subnet_ids = [];
      cluster[0].security_group_ids = [];
    }
    
    res.json(cluster[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get summary statistics for EKS clusters
router.get('/stats/summary', async (req, res) => {
  try {
    const { account_id } = req.query;
    let params = [];
    let accountCondition = '';
    
    if (account_id) {
      accountCondition = 'WHERE account_id = ?';
      params.push(account_id);
    }
    
    // Get counts by Kubernetes version
    const versionQuery = `
      SELECT version, COUNT(*) as count 
      FROM eks_clusters 
      ${accountCondition}
      GROUP BY version
    `;
    const versionStats = await runQuery(versionQuery, params);
    
    // Get counts by status
    const statusQuery = `
      SELECT status, COUNT(*) as count 
      FROM eks_clusters 
      ${accountCondition}
      GROUP BY status
    `;
    const statusStats = await runQuery(statusQuery, params);
    
    // Get counts by region
    const regionQuery = `
      SELECT region, COUNT(*) as count 
      FROM eks_clusters 
      ${accountCondition}
      GROUP BY region
    `;
    const regionStats = await runQuery(regionQuery, params);
    
    res.json({
      versionStats,
      statusStats,
      regionStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;