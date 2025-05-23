// Design Tokens - Centralized design system configuration
// This file contains all design tokens used throughout the application

// Color Palette
export const colors = {
  // Status Colors (matching chartColors.js)
  status: {
    expired: {
      main: 'rgb(239, 68, 68)',      // Red
      light: 'rgba(239, 68, 68, 0.1)',
      dark: 'rgba(239, 68, 68, 0.9)',
    },
    expiring: {
      main: 'rgb(251, 146, 60)',      // Orange
      light: 'rgba(251, 146, 60, 0.1)',
      dark: 'rgba(251, 146, 60, 0.9)',
    },
    supported: {
      main: 'rgb(34, 197, 94)',       // Green
      light: 'rgba(34, 197, 94, 0.1)',
      dark: 'rgba(34, 197, 94, 0.9)',
    },
  },
  
  // Brand Colors (for charts and UI elements)
  brand: {
    blue: 'rgb(59, 130, 246)',
    purple: 'rgb(147, 51, 234)',
    pink: 'rgb(236, 72, 153)',
    indigo: 'rgb(99, 102, 241)',
    cyan: 'rgb(6, 182, 212)',
    teal: 'rgb(20, 184, 166)',
    yellow: 'rgb(245, 158, 11)',
    rose: 'rgb(244, 63, 94)',
  },
  
  // Semantic Colors (CSS variable references)
  semantic: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    destructive: 'hsl(var(--destructive))',
    warning: 'hsl(var(--warning))',
    success: 'hsl(var(--success))',
    muted: 'hsl(var(--muted))',
    accent: 'hsl(var(--accent))',
  },
  
  // Text Colors
  text: {
    primary: 'hsl(var(--foreground))',
    secondary: 'hsl(var(--muted-foreground))',
    inverse: 'hsl(var(--primary-foreground))',
  },
  
  // Background Colors
  background: {
    primary: 'hsl(var(--background))',
    secondary: 'hsl(var(--secondary))',
    muted: 'hsl(var(--muted))',
    card: 'hsl(var(--card))',
  },
  
  // Border Colors
  border: {
    default: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
  },
};

// Spacing Scale
export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

// Typography Scale
export const typography = {
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.25rem',     // 4px
  default: '0.5rem', // 8px
  md: '0.75rem',     // 12px (matches --radius)
  lg: '1rem',        // 16px
  xl: '1.5rem',      // 24px
  '2xl': '2rem',     // 32px
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // Colored shadows for interactive elements
  colored: {
    primary: '0 10px 15px -3px rgb(var(--primary-rgb) / 0.25)',
    success: '0 10px 15px -3px rgb(34 197 94 / 0.25)',
    warning: '0 10px 15px -3px rgb(251 146 60 / 0.25)',
    destructive: '0 10px 15px -3px rgb(239 68 68 / 0.25)',
  },
};

// Animation/Transition Presets
export const animation = {
  duration: {
    fast: '150ms',
    default: '200ms',
    slow: '300ms',
    verySlow: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  transition: {
    default: `all var(--transition-duration, 200ms) cubic-bezier(0.4, 0, 0.2, 1)`,
    colors: `colors var(--transition-duration, 200ms) cubic-bezier(0.4, 0, 0.2, 1)`,
    transform: `transform var(--transition-duration, 200ms) cubic-bezier(0.4, 0, 0.2, 1)`,
    opacity: `opacity var(--transition-duration, 200ms) cubic-bezier(0.4, 0, 0.2, 1)`,
  },
};

// Z-Index Scale
export const zIndex = {
  dropdown: 50,
  sticky: 100,
  fixed: 200,
  modalBackdrop: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
};

// Breakpoints (matching Tailwind)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Glass Morphism Effects
export const glassmorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
};

// Common Component Styles
export const componentStyles = {
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.default,
  },
  button: {
    paddingX: spacing.md,
    paddingY: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    transition: animation.transition.default,
  },
  input: {
    paddingX: spacing.sm,
    paddingY: spacing.xs,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    borderWidth: '1px',
    transition: animation.transition.colors,
  },
};

// Export helper functions
export const getStatusColor = (status, opacity = 0.8) => {
  const color = colors.status[status]?.main || colors.status.supported.main;
  return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
};

export const getBrandColors = (count = 8) => {
  const brandColorArray = Object.values(colors.brand);
  return brandColorArray.slice(0, count);
};

export const getChartColors = (type = 'background', opacity = 0.8) => {
  const brandColorArray = getBrandColors();
  return brandColorArray.map(color => {
    const rgba = color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    if (type === 'border') {
      return rgba.replace(opacity, '1');
    }
    return rgba;
  });
};