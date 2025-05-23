import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Enhanced cn utility with design token awareness
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Status-based styling utilities
export const getStatusStyles = (status) => {
  const statusMap = {
    expired: {
      background: 'bg-destructive/10',
      text: 'text-destructive',
      border: 'border-destructive/20',
      shadow: 'hover:shadow-destructive/25',
    },
    expiring: {
      background: 'bg-warning/10',
      text: 'text-warning',
      border: 'border-warning/20',
      shadow: 'hover:shadow-warning/25',
    },
    supported: {
      background: 'bg-success/10',
      text: 'text-success',
      border: 'border-success/20',
      shadow: 'hover:shadow-success/25',
    },
  };
  
  return statusMap[status] || statusMap.supported;
};

// Common component style builders
export const cardStyles = {
  base: cn(
    'rounded-lg p-lg',
    'bg-card text-card-foreground',
    'shadow-default',
    'border border-border',
    'transition-all duration-default'
  ),
  elevated: cn(
    'rounded-lg p-lg',
    'bg-card text-card-foreground',
    'shadow-lg hover:shadow-xl',
    'border border-border',
    'transition-all duration-default'
  ),
  glass: cn(
    'rounded-lg p-lg',
    'backdrop-blur-[10px]',
    'bg-white/70 dark:bg-black/50',
    'border border-white/30 dark:border-white/10',
    'shadow-lg',
    'transition-all duration-default'
  ),
};

export const buttonStyles = {
  base: cn(
    'inline-flex items-center justify-center',
    'rounded-md px-md py-sm',
    'text-sm font-medium',
    'transition-all duration-default',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ),
  variants: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  },
  sizes: {
    sm: 'h-8 px-sm text-xs',
    default: 'h-10 px-md',
    lg: 'h-12 px-lg text-base',
  },
};

export const inputStyles = {
  base: cn(
    'flex w-full',
    'rounded-md border border-input',
    'bg-transparent px-sm py-xs',
    'text-sm',
    'transition-colors duration-default',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50'
  ),
  error: 'border-destructive focus:ring-destructive',
  success: 'border-success focus:ring-success',
};

// Animation presets
export const animationPresets = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideIn: 'animate-slide-in',
  scaleIn: 'animate-scale-in',
  shimmer: 'animate-shimmer bg-shimmer-gradient bg-[length:200%_100%]',
};

// Consistent hover states
export const hoverEffects = {
  lift: 'hover:-translate-y-1 hover:shadow-lg',
  glow: 'hover:shadow-colored-primary',
  scale: 'hover:scale-105',
  brighten: 'hover:brightness-110',
};

// Focus states
export const focusRing = 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

// Chart style helpers
export const getChartTheme = (isDark) => ({
  textColor: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
  gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  tooltipBackground: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
  tooltipBorder: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
});

// Responsive utilities
export const hideOnMobile = 'hidden sm:block';
export const hideOnDesktop = 'block sm:hidden';
export const stackOnMobile = 'flex flex-col sm:flex-row';

// Consistent spacing utilities
export const sectionSpacing = 'space-y-lg';
export const cardSpacing = 'space-y-md';
export const formSpacing = 'space-y-sm';

// Typography presets
export const headingStyles = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-semibold tracking-tight',
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-medium',
  h5: 'text-lg font-medium',
  h6: 'text-base font-medium',
};

export const textStyles = {
  body: 'text-base text-foreground',
  muted: 'text-sm text-muted-foreground',
  small: 'text-xs text-muted-foreground',
  error: 'text-sm text-destructive',
  success: 'text-sm text-success',
};

// Layout utilities
export const containerStyles = {
  page: 'container mx-auto px-md py-lg',
  section: 'space-y-lg',
  grid: 'grid gap-md',
};

// Export all design tokens for direct use
export * from '../config/design-tokens';