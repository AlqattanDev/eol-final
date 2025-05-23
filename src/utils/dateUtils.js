import { format, parseISO, differenceInDays } from 'date-fns';

/**
 * Format a date string or Date object in a human-readable format
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date
 */
export const formatDate = (dateInput) => {
  if (!dateInput) {
    return '-';
  }
  
  try {
    let date;
    
    // Handle different input types
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Try parsing ISO string first, then fallback to new Date()
      try {
        date = parseISO(dateInput);
      } catch {
        date = new Date(dateInput);
      }
    } else {
      date = new Date(dateInput);
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.warn('Date formatting error:', error, 'Input:', dateInput);
    return 'Invalid date';
  }
};

/**
 * Calculate days until a given date
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {number} Number of days
 */
export const getDaysUntil = (dateInput) => {
  if (!dateInput) {
    return 0;
  }
  
  try {
    let date;
    
    // Handle different input types
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      try {
        date = parseISO(dateInput);
      } catch {
        date = new Date(dateInput);
      }
    } else {
      date = new Date(dateInput);
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 0;
    }
    
    const today = new Date();
    return differenceInDays(date, today);
  } catch (error) {
    console.warn('Date calculation error:', error, 'Input:', dateInput);
    return 0;
  }
};

/**
 * Get a human-readable string for days remaining
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted days remaining text
 */
export const getDaysRemainingText = (dateInput) => {
  const days = getDaysUntil(dateInput);
  
  if (days < 0) {
    return `${Math.abs(days)} days ago`;
  }
  
  if (days === 0) {
    return 'Today';
  }
  
  return `${days} days remaining`;
};