import { format, parseISO, differenceInDays } from 'date-fns';

/**
 * Format a date string in a human-readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Calculate days until a given date
 * @param {string} dateString - ISO date string
 * @returns {number} Number of days
 */
export const getDaysUntil = (dateString) => {
  try {
    const date = parseISO(dateString);
    const today = new Date();
    return differenceInDays(date, today);
  } catch (error) {
    return 0;
  }
};

/**
 * Get a human-readable string for days remaining
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted days remaining text
 */
export const getDaysRemainingText = (dateString) => {
  const days = getDaysUntil(dateString);
  
  if (days < 0) {
    return `${Math.abs(days)} days ago`;
  }
  
  if (days === 0) {
    return 'Today';
  }
  
  return `${days} days remaining`;
};