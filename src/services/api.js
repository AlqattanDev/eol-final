/**
 * API service for fetching data from the backend
 */

const API_BASE_URL = 'http://localhost:8083/api';

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Parsed response
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Get all accounts
 * @returns {Promise<Array>} List of accounts
 */
export async function getAccounts() {
  return apiRequest('/accounts');
}

/**
 * Get account summary
 * @param {string} accountId - AWS account ID
 * @returns {Promise<Object>} Account summary statistics
 */
export async function getAccountSummary(accountId) {
  return apiRequest(`/accounts/${accountId}/summary`);
}

/**
 * Get all resources with EOL information
 * @param {string} accountId - Optional account ID to filter by
 * @returns {Promise<Array>} List of resources with EOL information
 */
export async function getEOLResources(accountId = null) {
  const endpoint = accountId 
    ? `/eol?account_id=${accountId}` 
    : '/eol';
  return apiRequest(endpoint);
}

/**
 * Get EOL summary statistics
 * @param {string} accountId - Optional account ID to filter by
 * @returns {Promise<Object>} EOL summary statistics
 */
export async function getEOLStats(accountId = null) {
  const endpoint = accountId 
    ? `/eol/stats/summary?account_id=${accountId}` 
    : '/eol/stats/summary';
  return apiRequest(endpoint);
}

/**
 * Get EC2 instances
 * @param {string} accountId - Optional account ID to filter by
 * @returns {Promise<Array>} List of EC2 instances
 */
export async function getEC2Instances(accountId = null) {
  const endpoint = accountId 
    ? `/ec2?account_id=${accountId}` 
    : '/ec2';
  return apiRequest(endpoint);
}

/**
 * Get RDS instances
 * @param {string} accountId - Optional account ID to filter by
 * @returns {Promise<Array>} List of RDS instances
 */
export async function getRDSInstances(accountId = null) {
  const endpoint = accountId 
    ? `/rds?account_id=${accountId}` 
    : '/rds';
  return apiRequest(endpoint);
}

/**
 * Get EKS clusters
 * @param {string} accountId - Optional account ID to filter by
 * @returns {Promise<Array>} List of EKS clusters
 */
export async function getEKSClusters(accountId = null) {
  const endpoint = accountId 
    ? `/eks?account_id=${accountId}` 
    : '/eks';
  return apiRequest(endpoint);
}

/**
 * Get Lambda functions
 * @param {string} accountId - Optional account ID to filter by
 * @returns {Promise<Array>} List of Lambda functions
 */
export async function getLambdaFunctions(accountId = null) {
  const endpoint = accountId 
    ? `/lambda?account_id=${accountId}` 
    : '/lambda';
  return apiRequest(endpoint);
}

/**
 * Get resource by ID
 * @param {string} type - Resource type (ec2, rds, eks, lambda)
 * @param {string} id - Resource ID
 * @returns {Promise<Object>} Resource details
 */
export async function getResourceById(type, id) {
  return apiRequest(`/${type}/${id}`);
}

/**
 * Get health status
 * @returns {Promise<Object>} API health status
 */
export async function getHealthStatus() {
  return apiRequest('/health');
}