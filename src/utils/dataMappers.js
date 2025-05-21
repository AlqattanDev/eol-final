/**
 * Utility functions to map backend data to frontend data structures
 */

/**
 * Maps a resource from the backend format to the frontend format
 * @param {Object} resource - Backend resource object
 * @returns {Object} Frontend resource object
 */
export function mapResourceToFrontend(resource) {
  // Map resource type from backend format
  const typeMap = {
    'ec2_instances': 'EC2',
    'rds_instances': 'RDS',
    'eks_clusters': 'EKS',
    'lambda_functions': 'Lambda'
  };

  return {
    id: resource.id,
    name: getResourceName(resource),
    type: typeMap[resource.resource_type] || resource.resource_type,
    region: resource.region,
    eolDate: resource.eol_date,
    eosDate: resource.eos_date,
    monthlyCost: resource.monthly_cost || 0,
    status: resource.status || 'unknown',
    // Additional metadata
    subType: resource.resource_subtype,
    accountId: resource.account_id,
    creationDate: resource.creation_date
  };
}

/**
 * Create a descriptive name for a resource based on its type and properties
 * @param {Object} resource - Backend resource object
 * @returns {string} A descriptive name for the resource
 */
function getResourceName(resource) {
  const typePrefix = {
    'ec2_instances': 'EC2',
    'rds_instances': 'DB',
    'eks_clusters': 'Cluster',
    'lambda_functions': 'Function'
  };
  
  const prefix = typePrefix[resource.resource_type] || 'Resource';
  
  // For some resources, use the subtype in the name
  let subtype = '';
  if (resource.resource_subtype) {
    subtype = `-${resource.resource_subtype}`;
  }
  
  return `${prefix}${subtype}-${resource.id.slice(-6)}`;
}

/**
 * Maps an array of backend resources to frontend format
 * @param {Array} resources - Array of backend resource objects
 * @returns {Array} Array of frontend resource objects
 */
export function mapResourcesToFrontend(resources) {
  if (!resources || !Array.isArray(resources)) {
    return [];
  }
  
  return resources.map(mapResourceToFrontend);
}