# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The AWS End-of-Life Dashboard is a React application for tracking and monitoring AWS resources with end-of-life and end-of-support information. It helps organizations manage their infrastructure lifecycle more effectively.

## Development Commands

### Core Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Architecture Overview

### Frontend Structure

The application follows a component-based architecture using React and is styled with TailwindCSS. Key architectural elements include:

1. **Routing**: React Router is used for navigation between dashboard, resources, and settings pages.

2. **Context API**: The AccountContext provides account selection state management across components.

3. **Components Structure**:
   - UI components in `src/components/ui/` provide the design system
   - Page components in `src/components/` implement the main views
   - Specialized visualization components handle charts and data display
   - AnimatedBackground component provides an immersive visual experience with CSS animations
   - ChartCard component provides consistent styling for chart visualization elements

4. **Custom Hooks**:
   - `useChartAnimation` in `src/hooks/useChartAnimation.js` provides chart animation capabilities with configurable easing functions (cubic and elastic)

5. **Mock Data System**: The application currently uses mock data generated in `src/data/mockData.js` to simulate AWS resources with EOL dates. In a production version, this would be replaced with real API calls.

6. **Responsive Design**: The application is designed to work on both desktop and mobile with responsive layouts and a collapsible sidebar.

7. **CSS Architecture**:
   - CSS Modules for component-specific styling (e.g., AnimatedBackground.module.css)
   - TailwindCSS for utility-based styling
   - CSS variables for theming and dark mode support

### Key Features

- Dashboard visualization with summary statistics
- Status and type distribution charts
- Recent expirations table with filtering capabilities
- Multi-account support
- Dark mode toggle with system preference detection

## Data Flow

1. Mock resource data is generated in `mockData.js`
2. The Dashboard component filters resources based on the selected account
3. Stats are calculated from the filtered resources
4. UI components visualize the data through cards, charts, and tables

## UI Component System

The application implements a custom UI component system in `src/components/ui/` that provides:

- Layout components (PageContainer, ContentGrid)
- Interactive elements (Button, Select, Dropdown)
- Data visualization (StatCard, Table, ChartCard)
- Motion and animation utilities

### Custom Hooks

The application uses custom React hooks to encapsulate and reuse complex logic:

- **useChartAnimation**: Provides smooth, configurable animations for chart data with support for different easing functions (cubic, elastic)

### Styling and Visual Effects

- **AnimatedBackground**: Creates an immersive visual experience with floating particles, gradient backgrounds, and subtle animations
- **Glassmorphism**: Applied to cards and UI elements for a modern, translucent effect
- **Dark Mode**: Full support for light and dark themes with system preference detection
- **Responsive Animations**: Subtle UI animations that respond to user interactions

## Resource Status Logic

Resources are classified into three statuses:
- Expired: EOL date is in the past
- Expiring: EOL date is within the next 90 days
- Supported: EOL date is more than 90 days in the future