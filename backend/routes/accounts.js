const express = require('express');
const router = express.Router();
const { runQuery } = require('../db');

// Get all AWS accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await runQuery('SELECT * FROM aws_accounts');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific AWS account by ID
router.get('/:id', async (req, res) => {
  try {
    const account = await runQuery('SELECT * FROM aws_accounts WHERE id = ?', [req.params.id]);
    
    if (account.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json(account[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get summary statistics for a specific account
router.get('/:id/summary', async (req, res) => {
  try {
    const accountId = req.params.id;
    
    // Get counts of resources for this account
    const ec2Count = await runQuery('SELECT COUNT(*) as count FROM ec2_instances WHERE account_id = ?', [accountId]);
    const rdsCount = await runQuery('SELECT COUNT(*) as count FROM rds_instances WHERE account_id = ?', [accountId]);
    const eksCount = await runQuery('SELECT COUNT(*) as count FROM eks_clusters WHERE account_id = ?', [accountId]);
    const lambdaCount = await runQuery('SELECT COUNT(*) as count FROM lambda_functions WHERE account_id = ?', [accountId]);
    
    // Get regions used in this account
    const regionsQuery = `
      SELECT DISTINCT region FROM (
        SELECT region FROM ec2_instances WHERE account_id = ?
        UNION 
        SELECT region FROM rds_instances WHERE account_id = ?
        UNION 
        SELECT region FROM eks_clusters WHERE account_id = ?
        UNION 
        SELECT region FROM lambda_functions WHERE account_id = ?
      )
    `;
    const regions = await runQuery(regionsQuery, [accountId, accountId, accountId, accountId]);
    
    res.json({
      ec2Count: ec2Count[0].count,
      rdsCount: rdsCount[0].count,
      eksCount: eksCount[0].count,
      lambdaCount: lambdaCount[0].count,
      totalResourceCount: ec2Count[0].count + rdsCount[0].count + eksCount[0].count + lambdaCount[0].count,
      regions: regions.map(r => r.region)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;