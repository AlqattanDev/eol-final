import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names with tailwind-merge to handle conflicts
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


/**
 * Returns a color based on status
 */
export function getStatusColor(status) {
  switch (status) {
    case 'expired':
      return 'destructive';
    case 'expiring':
      return 'warning';
    case 'supported':
      return 'success';
    default:
      return 'muted';
  }
}

/**
 * Calculates resource status based on EOL date
 * @param {Date|string} eolDate - The end-of-life date
 * @returns {string} Resource status: 'expired', 'expiring', 'supported', or 'unknown'
 */
export function calculateResourceStatus(eolDate) {
  if (!eolDate) return 'unknown';
  
  const today = new Date();
  const eol = new Date(eolDate);
  
  if (eol < today) {
    return 'expired';
  }
  
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(today.getDate() + 90);
  
  if (eol <= ninetyDaysFromNow) {
    return 'expiring';
  }
  
  return 'supported';
}

/**
 * Calculates resource statistics from an array of resources
 * @param {Array} resources - Array of resource objects
 * @returns {Object} Object containing total, expired, expiring, supported
 */
export function calculateResourceStats(resources) {
  let total = 0;
  let expired = 0;
  let expiring = 0;
  let supported = 0;
  
  resources.forEach(resource => {
    total++;
    
    const status = calculateResourceStatus(resource.eolDate);
    if (status === 'expired') expired++;
    else if (status === 'expiring') expiring++;
    else supported++;
  });
  
  return {
    total,
    expired,
    expiring,
    supported
  };
}