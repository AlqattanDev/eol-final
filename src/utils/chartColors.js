// This file is deprecated - use design-tokens.js and styleUtils.js instead
// Keeping for backward compatibility only

import { colors, getChartTheme as getTheme } from './styleUtils';

// Re-export from centralized design tokens for backward compatibility
export const chartColors = {
  // Status colors (semantic)
  status: {
    expired: {
      background: colors.status.expired.main.replace('rgb', 'rgba').replace(')', ', 0.8)'),
      border: colors.status.expired.main,
      hover: colors.status.expired.dark
    },
    expiring: {
      background: colors.status.expiring.main.replace('rgb', 'rgba').replace(')', ', 0.8)'),
      border: colors.status.expiring.main,
      hover: colors.status.expiring.dark
    },
    supported: {
      background: colors.status.supported.main.replace('rgb', 'rgba').replace(')', ', 0.8)'),
      border: colors.status.supported.main,
      hover: colors.status.supported.dark
    }
  },
  
  // Type distribution colors (categorical)
  types: {
    backgrounds: Object.values(colors.brand).map(c => c.replace('rgb', 'rgba').replace(')', ', 0.8)')),
    borders: Object.values(colors.brand),
    hovers: Object.values(colors.brand).map(c => c.replace('rgb', 'rgba').replace(')', ', 1)')),
  },
  
  // Grid and text colors
  grid: {
    light: 'rgba(156, 163, 175, 0.3)',
    dark: 'rgba(75, 85, 99, 0.3)'
  },
  
  text: {
    light: 'rgb(75, 85, 99)',
    dark: 'rgb(209, 213, 219)'
  }
};

// Helper functions re-exported from styleUtils
export const getTextColor = (isDarkMode) => {
  const theme = getTheme(isDarkMode);
  return theme.textColor;
};

export const getGridColor = (isDarkMode) => {
  const theme = getTheme(isDarkMode);
  return theme.gridColor;
};

// Re-export the main helper
export const getChartTheme = getTheme;