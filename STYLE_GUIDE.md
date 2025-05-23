# AWS EOL Dashboard Style Guide

This document provides comprehensive guidelines for maintaining consistent styling across the application.

## Overview

The application uses a centralized design system built on:
- **TailwindCSS** for utility-based styling
- **CSS Variables** for theming
- **Design Tokens** for consistent values
- **Style Utilities** for reusable patterns

## File Structure

### Core Style Files

1. **`src/config/design-tokens.js`**
   - Central source of truth for all design values
   - Colors, spacing, typography, shadows, animations
   - Export helper functions for dynamic styling

2. **`src/utils/styleUtils.js`**
   - Utility functions and style builders
   - Component style presets
   - Animation and hover effects
   - Re-exports design tokens

3. **`src/index.css`**
   - CSS variables for theming
   - Global styles and resets
   - Tailwind imports

4. **`tailwind.config.js`**
   - Extends Tailwind with design tokens
   - Custom animations and utilities

## Color System

### Status Colors (Semantic)
```javascript
// Always use these for status indicators
const statusColors = {
  expired: 'destructive',    // Red
  expiring: 'warning',       // Orange
  supported: 'success',      // Green
};
```

### Brand Colors (Charts/UI)
```javascript
// Use for non-semantic elements like charts
const brandColors = {
  blue: 'rgb(59, 130, 246)',
  purple: 'rgb(147, 51, 234)',
  pink: 'rgb(236, 72, 153)',
  // ... see design-tokens.js for full list
};
```

### Usage Examples
```javascript
// Status-based styling
import { getStatusStyles } from '@/utils/styleUtils';
const styles = getStatusStyles('expired');
// Returns: { background, text, border, shadow }

// Chart colors
import { getChartColors } from '@/utils/styleUtils';
const colors = getChartColors('background', 0.8);
```

## Spacing Scale

Use consistent spacing values:
```javascript
spacing: {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
}
```

**Usage:** `p-lg`, `gap-md`, `space-y-sm`

## Typography

### Font Sizes
```javascript
fontSize: {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
}
```

### Heading Styles
```javascript
import { headingStyles } from '@/utils/styleUtils';
// h1, h2, h3, h4, h5, h6 presets available
```

## Component Patterns

### Cards
```javascript
import { cardStyles } from '@/utils/styleUtils';

// Basic card
<div className={cardStyles.base}>

// Elevated card (more shadow)
<div className={cardStyles.elevated}>

// Glass morphism card
<div className={cardStyles.glass}>
```

### Buttons
```javascript
import { Button } from '@/components/ui/button';

// Variants: default, destructive, outline, secondary, ghost, success, warning
<Button variant="primary" size="default">
```

### Inputs
```javascript
import { inputStyles } from '@/utils/styleUtils';

<input className={inputStyles.base} />
<input className={cn(inputStyles.base, inputStyles.error)} />
```

## Animation Guidelines

### Durations
```javascript
animation.duration = {
  fast: '150ms',
  default: '200ms',
  slow: '300ms',
  verySlow: '500ms',
}
```

### Preset Animations
```javascript
import { animationPresets } from '@/utils/styleUtils';

// fadeIn, slideUp, slideIn, scaleIn, shimmer
<div className={animationPresets.fadeIn}>
```

### Hover Effects
```javascript
import { hoverEffects } from '@/utils/styleUtils';

// lift, glow, scale, brighten
<div className={hoverEffects.lift}>
```

## Dark Mode

The application supports automatic dark mode. Always consider both themes:

```javascript
// CSS Variables automatically switch
color: 'text-foreground'  // Changes based on theme

// Manual dark mode classes
<div className="bg-white dark:bg-black">

// Use theme-aware helpers
const chartTheme = getChartTheme(isDarkMode);
```

## Chart Styling

Charts use centralized colors and themes:

```javascript
import { getStatusColor, getChartTheme } from '@/utils/styleUtils';

// Status charts
backgroundColor: [
  getStatusColor('expired', 0.8),
  getStatusColor('expiring', 0.8),
  getStatusColor('supported', 0.8),
]

// Type distribution charts
backgroundColor: getChartColors('background', 0.8),
```

## Best Practices

### 1. Always Use Design Tokens
```javascript
// ❌ Bad
<div className="p-6 rounded-lg">

// ✅ Good
<div className="p-lg rounded-default">
```

### 2. Use Semantic Colors
```javascript
// ❌ Bad
<div className="text-red-500">

// ✅ Good
<div className="text-destructive">
```

### 3. Consistent Hover States
```javascript
// ❌ Bad
<button className="hover:bg-gray-100">

// ✅ Good
<button className="hover:bg-accent">
```

### 4. Centralize Component Styles
```javascript
// ❌ Bad - inline complex styles
<div className="rounded-lg p-lg bg-card shadow-lg border...">

// ✅ Good - use presets
<div className={cardStyles.elevated}>
```

### 5. Responsive Design
```javascript
// Use responsive utilities consistently
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## Making Style Changes

### To change colors globally:
1. Update `src/config/design-tokens.js`
2. Run the app to see changes propagate

### To add new design tokens:
1. Add to `design-tokens.js`
2. Export from `styleUtils.js` if needed
3. Update Tailwind config if needed

### To modify component styles:
1. Check if a preset exists in `styleUtils.js`
2. Update the preset or create a new variant
3. Use consistently across the app

## CSS Architecture

### File Organization
- Global styles: `src/index.css`
- Design tokens: `src/config/design-tokens.js`
- Utilities: `src/utils/styleUtils.js`
- Component styles: Colocated with components
- CSS Modules: For complex animations (e.g., AnimatedBackground)

### Naming Conventions
- CSS Variables: `--kebab-case`
- JavaScript tokens: `camelCase`
- Tailwind classes: Follow Tailwind conventions
- Component variants: Descriptive names (primary, destructive, etc.)

## Performance Considerations

1. **Minimize Runtime Calculations**
   - Use CSS variables for theme switching
   - Precalculate values in design tokens

2. **Reduce Bundle Size**
   - Use Tailwind's purge in production
   - Avoid importing entire style objects

3. **Optimize Animations**
   - Use CSS transforms over position changes
   - Limit animation duration for better UX

## Accessibility

1. **Focus States**
   - Always visible focus rings
   - Use `focusRing` utility from styleUtils

2. **Color Contrast**
   - Maintain WCAG AA compliance
   - Test with both light and dark themes

3. **Motion Preferences**
   - Respect `prefers-reduced-motion`
   - Provide alternatives to animations

## Quick Reference

### Import Paths
```javascript
import { cn, cardStyles, buttonStyles } from '@/utils/styleUtils';
import { colors, spacing, animation } from '@/config/design-tokens';
```

### Common Patterns
```javascript
// Conditional styling
className={cn(
  baseStyles,
  condition && conditionalStyles,
  className
)}

// Status-based colors
const styles = getStatusStyles(resource.status);

// Theme-aware values
const isDark = document.documentElement.classList.contains('dark');
const theme = getChartTheme(isDark);
```

### Debugging Styles
1. Check design tokens first
2. Verify CSS variable values in DevTools
3. Use Tailwind CSS IntelliSense extension
4. Check for specificity conflicts

---

Remember: Consistency is key. When in doubt, check existing patterns in the codebase or refer to this guide.