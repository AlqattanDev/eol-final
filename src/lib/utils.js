import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getResourceStatus } from '../data/mockData';

/**
 * Combines multiple class names with tailwind-merge to handle conflicts
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
 * Calculates resource statistics from an array of resources
 * @param {Array} resources - Array of resource objects
 * @returns {Object} Object containing total, expired, expiring, supported, and totalCost
 */
export function calculateResourceStats(resources) {
  let total = 0;
  let expired = 0;
  let expiring = 0;
  let supported = 0;
  let totalCost = 0;
  
  resources.forEach(resource => {
    total++;
    totalCost += resource.monthlyCost;
    
    const status = getResourceStatus(resource.eolDate);
    if (status === 'expired') expired++;
    else if (status === 'expiring') expiring++;
    else supported++;
  });
  
  return {
    total,
    expired,
    expiring,
    supported,
    totalCost
  };
}