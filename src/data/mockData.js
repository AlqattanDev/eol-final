import { addDays, subDays, format } from 'date-fns';

const today = new Date();

// Helper to generate a future date
const getFutureDate = (daysAhead) => {
  return format(addDays(today, daysAhead), 'yyyy-MM-dd');
};

// Helper to generate a past date
const getPastDate = (daysBehind) => {
  return format(subDays(today, daysBehind), 'yyyy-MM-dd');
};

// Generate AWS regions
const regions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-central-1',
  'ap-southeast-1',
  'ap-northeast-1',
];

// Generate resource names
const generateResourceName = (type, index) => {
  const prefixes = {
    EC2: ['web', 'app', 'worker', 'batch', 'test', 'dev', 'prod'],
    RDS: ['db', 'postgress', 'mysql', 'aurora', 'redis', 'cache'],
    EKS: ['cluster', 'k8s', 'kube', 'container'],
    Lambda: ['func', 'processor', 'handler', 'worker', 'trigger']
  };
  
  const prefix = prefixes[type][Math.floor(Math.random() * prefixes[type].length)];
  return `${prefix}-${type.toLowerCase()}-${index}`;
};

// Generate mock resources
const generateMockResources = (count) => {
  const resources = [];
  const types = ['EC2', 'RDS', 'EKS', 'Lambda'];
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    
    // Randomly determine if the resource is expired, expiring soon, or supported
    const status = Math.random();
    let eolDate, eosDate;
    
    if (status < 0.2) {
      // Expired
      eolDate = getPastDate(Math.floor(Math.random() * 90 + 1));
      eosDate = getPastDate(Math.floor(Math.random() * 180 + 91));
    } else if (status < 0.5) {
      // Expiring soon (within 90 days)
      eolDate = getFutureDate(Math.floor(Math.random() * 90 + 1));
      eosDate = getFutureDate(Math.floor(Math.random() * 180 + 91));
    } else {
      // Supported
      eolDate = getFutureDate(Math.floor(Math.random() * 365 + 91));
      eosDate = getFutureDate(Math.floor(Math.random() * 180 + 366));
    }
    
    resources.push({
      id: `resource-${i}`,
      name: generateResourceName(type, i),
      type,
      region,
      eolDate,
      eosDate,
      monthlyCost: Math.floor(Math.random() * 1000) + 50,
    });
  }
  
  return resources;
};

export const mockResources = generateMockResources(50);

// Get resource status by comparing dates
export const getResourceStatus = (eolDate) => {
  const today = new Date();
  const eol = new Date(eolDate);
  
  // If EOL date is in the past, the resource is expired
  if (eol < today) {
    return 'expired';
  }
  
  // If EOL date is within the next 90 days, the resource is expiring soon
  const ninetyDaysFromNow = addDays(today, 90);
  if (eol <= ninetyDaysFromNow) {
    return 'expiring';
  }
  
  // Otherwise, the resource is supported
  return 'supported';
};