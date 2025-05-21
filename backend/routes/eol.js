const express = require('express');
const router = express.Router();
const { runQuery } = require('../db');

// Get all resources with their EOL status
router.get('/', async (req, res) => {
  try {
    const { account_id, resource_type } = req.query;
    
    let resourceTypeQuery = '';
    if (resource_type) {
      const validTypes = ['ec2', 'rds', 'eks', 'lambda'];
      if (!validTypes.includes(resource_type.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid resource type. Must be one of: ec2, rds, eks, lambda' });
      }
      
      const resourceTypeMap = {
        'ec2': 'ec2_instances',
        'rds': 'rds_instances',
        'eks': 'eks_clusters',
        'lambda': 'lambda_functions'
      };
      
      resourceTypeQuery = `AND resource_type = '${resourceTypeMap[resource_type.toLowerCase()]}'`;
    }
    
    // Union query to get all resources with their EOL/EOS dates
    const query = `
      SELECT 
        id, 
        account_id, 
        region, 
        'ec2_instances' as resource_type, 
        platform_name as resource_subtype, 
        eol_date, 
        eos_date,
        launch_time as creation_date
      FROM ec2_instances 
      WHERE eol_date IS NOT NULL AND eol_date != 'N/A' 
        ${account_id ? `AND account_id = '${account_id}'` : ''} 
        ${resource_type && resource_type.toLowerCase() === 'ec2' ? resourceTypeQuery : ''}
      
      UNION
      
      SELECT 
        id, 
        account_id, 
        region, 
        'rds_instances' as resource_type, 
        engine as resource_subtype, 
        eol_date, 
        eos_date,
        instance_create_time as creation_date
      FROM rds_instances 
      WHERE eol_date IS NOT NULL AND eol_date != 'N/A' 
        ${account_id ? `AND account_id = '${account_id}'` : ''} 
        ${resource_type && resource_type.toLowerCase() === 'rds' ? resourceTypeQuery : ''}
      
      UNION
      
      SELECT 
        id, 
        account_id, 
        region, 
        'eks_clusters' as resource_type, 
        version as resource_subtype, 
        eol_date, 
        eos_date,
        created_at as creation_date
      FROM eks_clusters 
      WHERE eol_date IS NOT NULL AND eol_date != 'N/A' 
        ${account_id ? `AND account_id = '${account_id}'` : ''} 
        ${resource_type && resource_type.toLowerCase() === 'eks' ? resourceTypeQuery : ''}
      
      UNION
      
      SELECT 
        id, 
        account_id, 
        region, 
        'lambda_functions' as resource_type, 
        runtime as resource_subtype, 
        eol_date, 
        eos_date,
        last_modified as creation_date
      FROM lambda_functions 
      WHERE eol_date IS NOT NULL AND eol_date != 'N/A' 
        ${account_id ? `AND account_id = '${account_id}'` : ''} 
        ${resource_type && resource_type.toLowerCase() === 'lambda' ? resourceTypeQuery : ''}
        
      ORDER BY eol_date ASC
    `;
    
    const resources = await runQuery(query);
    
    // Add status field based on EOL date
    const now = new Date();
    const ninetyDaysFromNow = new Date(now);
    ninetyDaysFromNow.setDate(now.getDate() + 90);
    
    resources.forEach(resource => {
      try {
        const eolDate = new Date(resource.eol_date);
        
        if (eolDate <= now) {
          resource.status = 'expired';
        } else if (eolDate <= ninetyDaysFromNow) {
          resource.status = 'expiring';
        } else {
          resource.status = 'supported';
        }
      } catch (e) {
        resource.status = 'unknown';
      }
    });
    
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get EOL summary statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { account_id } = req.query;
    let accountCondition = '';
    
    if (account_id) {
      accountCondition = `AND account_id = '${account_id}'`;
    }
    
    // Current time and 90 days from now for status calculation
    const now = new Date().toISOString();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    const ninetyDaysISOString = ninetyDaysFromNow.toISOString();
    
    // Combined query to get status counts across all resource types
    const query = `
      WITH all_resources AS (
        SELECT eol_date, 'ec2_instances' as resource_type FROM ec2_instances WHERE eol_date IS NOT NULL AND eol_date != 'N/A' ${accountCondition}
        UNION ALL
        SELECT eol_date, 'rds_instances' as resource_type FROM rds_instances WHERE eol_date IS NOT NULL AND eol_date != 'N/A' ${accountCondition}
        UNION ALL
        SELECT eol_date, 'eks_clusters' as resource_type FROM eks_clusters WHERE eol_date IS NOT NULL AND eol_date != 'N/A' ${accountCondition}
        UNION ALL
        SELECT eol_date, 'lambda_functions' as resource_type FROM lambda_functions WHERE eol_date IS NOT NULL AND eol_date != 'N/A' ${accountCondition}
      )
      
      SELECT
        COUNT(CASE WHEN datetime(eol_date) <= datetime('${now}') THEN 1 END) as expired_count,
        COUNT(CASE WHEN datetime(eol_date) > datetime('${now}') AND datetime(eol_date) <= datetime('${ninetyDaysISOString}') THEN 1 END) as expiring_count,
        COUNT(CASE WHEN datetime(eol_date) > datetime('${ninetyDaysISOString}') THEN 1 END) as supported_count,
        COUNT(*) as total_count
      FROM all_resources
    `;
    
    const result = await runQuery(query);
    
    // Get counts by resource type
    const resourceTypeQuery = `
      WITH all_resources AS (
        SELECT eol_date, 'ec2_instances' as resource_type FROM ec2_instances WHERE eol_date IS NOT NULL AND eol_date != 'N/A' ${accountCondition}
        UNION ALL
        SELECT eol_date, 'rds_instances' as resource_type FROM rds_instances WHERE eol_date IS NOT NULL AND eol_date != 'N/A' ${accountCondition}
        UNION ALL
        SELECT eol_date, 'eks_clusters' as resource_type FROM eks_clusters WHERE eol_date IS NOT NULL AND eol_date != 'N/A' ${accountCondition}
        UNION ALL
        SELECT eol_date, 'lambda_functions' as resource_type FROM lambda_functions WHERE eol_date IS NOT NULL AND eol_date != 'N/A' ${accountCondition}
      )
      
      SELECT resource_type, COUNT(*) as count
      FROM all_resources
      GROUP BY resource_type
    `;
    
    const resourceTypeStats = await runQuery(resourceTypeQuery);
    
    res.json({
      expiredCount: result[0].expired_count,
      expiringCount: result[0].expiring_count,
      supportedCount: result[0].supported_count,
      totalCount: result[0].total_count,
      resourceTypeStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;