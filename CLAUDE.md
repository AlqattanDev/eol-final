# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The AWS End-of-Life Dashboard is a React-based application for tracking and monitoring AWS resources with end-of-life and end-of-support information. It features a client-side IndexedDB database for offline functionality. The project is currently in transition, with the original backend being replaced by MongoDB Realm (migration in progress).

## Development Commands

### Frontend Commands

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

### Server Commands (Currently Non-functional)

Note: The server components are currently being migrated to MongoDB Realm. The following commands exist but are not fully implemented:

```bash
# Navigate to server directory
cd server

# Install server dependencies
npm install

# AWS data fetcher (stub only)
npm run fetch

# Portable database CLI (works with JSON files only)
npm run db
```

### All-in-One Commands

```bash
# Start frontend only (backend is MongoDB Realm - not implemented)
./start-all.sh
```

## Architecture Overview

### Frontend Structure

The application follows a component-based architecture using React and is styled with TailwindCSS. Key architectural elements include:

1. **Routing**: React Router is used for navigation between dashboard, resources, and settings pages.

2. **Context API**: The AccountContext provides account selection state management across components.

3. **Components Structure**:

   - UI components in `src/components/ui/` provide the design system
   - Page components in `src/components/` implement the main views (Dashboard, Resources, Settings)
   - Specialized visualization components handle charts and data display (StatusChart, TypeDistributionChart)
   - AnimatedBackground component provides an immersive visual experience with CSS animations
   - ChartCard component provides consistent styling for chart visualization elements

4. **Custom Hooks**:

   - `useChartAnimation` in `src/hooks/useChartAnimation.js` provides chart animation capabilities with configurable easing functions (cubic and elastic)
   - `useDatabase` provides reactive data querying from the local IndexedDB database
   - `useResources` and `useAccounts` are specialized hooks built on `useDatabase`

5. **Data System**: The application uses Dexie (IndexedDB wrapper) for client-side data persistence with offline capabilities.

6. **Responsive Design**: The application is designed to work on both desktop and mobile with responsive layouts and a collapsible sidebar.

7. **CSS Architecture**:
   - **Centralized Design System**: Core styling managed through design tokens and utilities
   - **Design Tokens**: All colors, spacing, typography, and animations defined in `src/config/design-tokens.js`
   - **Style Utilities**: Reusable style patterns and component presets in `src/utils/styleUtils.js`
   - **CSS Modules**: Component-specific styling (e.g., AnimatedBackground.module.css)
   - **TailwindCSS**: Utility-based styling extended with design tokens
   - **CSS Variables**: Theming and dark mode support
   - **Style Guide**: Comprehensive documentation in `STYLE_GUIDE.md`

### Backend Structure (In Transition)

The original backend has been removed and is being migrated to MongoDB Realm. Current server-side components are mostly stubs:

1. **AWS Data Fetcher** (`aws-fetcher.js`): Stub file only - actual implementation pending
2. **Portable Database** (`portable-db.js`): Empty implementation - SQLite functionality removed
3. **CLI Tools** (`cli/db-cli.js`): Limited functionality - works with JSON files only
4. **MongoDB Realm**: Mentioned in comments but not yet implemented

### Key Features

- Dashboard visualization with summary statistics
- Status and type distribution charts using Chart.js
- Recent expirations table with filtering capabilities
- Multi-account support with color-coded accounts
- Dark mode toggle with system preference detection
- Offline-first functionality with IndexedDB

## Data Flow

1. **Collection**: Server-side AWS fetcher collects resource information from AWS APIs
2. **Storage**: Data stored in SQLite database on server
3. **Export**: Server exports data to JSON format (`data/*.json`)
4. **Import**: Frontend imports JSON data into IndexedDB on startup
5. **Query**: React components use Dexie hooks to query IndexedDB
6. **Display**: UI components visualize the data through cards, charts, and tables

### Data Collection Strategy

- The way the data will be fetched is through a shell script that utilize aws cli to export all the data then add them to our offline database

## Database Architecture

### Client-Side Database (Dexie/IndexedDB)

The application uses Dexie (v4.0.11) as an IndexedDB wrapper for client-side data storage:

- **Configuration**: Located in `src/config/database.js` with schema definitions
- **Collections**:
  - `resources`: AWS resource information including service, region, EOL dates, and status
  - `accounts`: AWS account metadata with color coding
  - Note: `collectionRuns` is mentioned in docs but not implemented in schema
- **Custom Hooks**: Database-specific hooks in `src/hooks/useDatabase.js`
- **Browser Access**: `window.dbCli` provides database operations in browser console
- **Legacy Support**: Contains legacy `useRealmQuery` hook for future MongoDB Realm compatibility

### Server-Side Database (Currently Non-functional)

The original SQLite backend has been removed. Current state:

- **Portable Database**: `server/portable-db.js` exists but is empty
- **JSON Database**: `server/portable-db-json.js` provides basic JSON file operations
- **Data Import/Export**: Static JSON files in `/data/` directory with sample data
- **AWS Integration**: Not implemented - AWS fetcher is stub only
- **Future**: Planning migration to MongoDB Realm (not yet implemented)

## UI Component System

The application implements a custom UI component system in `src/components/ui/` that provides:

- **Layout components**: PageContainer, ContentGrid
- **Interactive elements**: Button, Select, Dropdown with consistent styling
- **Data visualization**: StatCard, Table, ChartCard with centralized theming
- **Motion and animation utilities**: Predefined animation presets
- **Error boundary**: Graceful error handling
- **Design System**: All components use centralized design tokens for consistency

### Design Token System

The application uses a comprehensive design token system for maintainable styling:

- **Colors**: Status colors (expired/expiring/supported), brand colors, semantic colors
- **Spacing**: Consistent scale from xs (8px) to 3xl (64px)
- **Typography**: Predefined font sizes, weights, and heading styles
- **Shadows**: Standardized shadow scale including colored shadows
- **Border Radius**: Consistent rounding values
- **Animations**: Predefined durations, easing functions, and animation presets
- **Component Styles**: Reusable patterns for cards, buttons, inputs, and form elements

### Custom Hooks

The application uses custom React hooks to encapsulate and reuse complex logic:

- **useDatabase**: Core hook for IndexedDB operations through Dexie
- **useResources**: Specialized hook for resource data with optional account filtering
- **useAccounts**: Specialized hook for account data
- **useChartAnimation**: Provides smooth, configurable animations for chart data with support for different easing functions (cubic, elastic)

### Styling and Visual Effects

- **Centralized Design System**: All styling values managed through design tokens for consistency
- **AnimatedBackground**: Creates an immersive visual experience with floating particles, gradient backgrounds, and subtle animations
- **Glassmorphism**: Applied to cards and UI elements for a modern, translucent effect
- **Dark Mode**: Full support for light and dark themes with system preference detection
- **Responsive Animations**: Subtle UI animations that respond to user interactions using Framer Motion
- **Chart Theming**: Centralized color system for charts with status-based and brand colors
- **Component Presets**: Predefined styles for cards, buttons, inputs, and other UI elements

## Resource Status Logic

Resources are classified into three statuses:

- **Expired**: EOL date is in the past
- **Expiring**: EOL date is within the next 90 days
- **Supported**: EOL date is more than 90 days in the future

## Technology Stack

### Frontend Dependencies

- **React 18.2**: UI framework with hooks and context
- **React Router 6**: Client-side routing
- **Dexie 4.0.11**: IndexedDB wrapper for client-side storage
- **Chart.js 4.4**: Data visualization library with react-chartjs-2
- **Framer Motion 12.12.1**: Animation library
- **TailwindCSS 3.4**: Utility-first CSS framework
- **Heroicons & Lucide React**: Icon libraries
- **Date-fns 3.6**: Date manipulation utilities
- **Class Variance Authority**: Component variant management
- **clsx & tailwind-merge**: ClassName utilities
- **@tailwindcss/forms**: Form styling plugin
- **tailwindcss-animate**: Animation utilities

### Server Dependencies (Stubs only)

- **AWS SDK v3**: Various AWS service clients (not actively used)
- **Node.js**: ES modules support (type: "module")
- Note: Better SQLite3 has been removed

## Data Models

### Resource Schema

```javascript
{
  id: 'auto-increment',
  resourceId: 'string',
  service: 'string',
  region: 'string',
  eolDate: 'date',
  eosDate: 'date',
  status: 'string',
  account: 'string',
  type: 'string',
  name: 'string',
  description: 'string'
}
```

### Account Schema

```javascript
{
  id: 'auto-increment',
  accountId: 'string',
  name: 'string',
  color: 'string',
  description: 'string'
}
```

### Collection Run Schema (Not Implemented)

Note: This schema is documented but not currently implemented in the database configuration.

## Multi-Server Deployment (Not Implemented)

Note: Multi-server deployment is documented but not currently functional due to backend migration.

1. `server/aws-config.json` exists as example only
2. Deploy script referenced but not implemented
3. See `MULTI_SERVER_GUIDE.md` for original design intentions

## AWS Data Fetching (Functional)

The application includes AWS CLI-based scripts for collecting resource data:

- **Fetch Script**: `scripts/fetch-aws-resources.sh` - Comprehensive AWS resource collection
- **EOL Mapping**: `scripts/aws-eol-dates.json` - End-of-life date mappings for AWS services
- **Cross-platform**: Compatible with macOS/Linux, uses Python for date calculations
- **Resource Coverage**: EC2, RDS, Lambda, EKS with extensible architecture
- **Output**: Generates `data/resources.json` for import into the application

### Running AWS Data Collection

```bash
# Make script executable
chmod +x scripts/fetch-aws-resources.sh

# Run data collection (requires AWS CLI configured)
./scripts/fetch-aws-resources.sh

# Import collected data into application
# Data is automatically loaded from data/resources.json on startup
```

## Development Guidance

### Data Operations

- Use Dexie hooks (`useDatabase`, `useResources`, `useAccounts`) for all client-side data operations
- The application currently works offline with IndexedDB storage only
- Server components are non-functional pending MongoDB Realm migration
- No authentication or real AWS data connectivity currently exists
- The application initializes with static sample data from `/data/*.json`
- Use the `resetDatabase` function in development to refresh sample data
- Browser console provides `dbCli` for direct database operations during development
- The codebase is in transition - avoid relying on server-side functionality

### Styling Guidelines

- **Always use design tokens**: Import from `src/utils/styleUtils.js` for consistency
- **Use semantic colors**: Status-based colors for expired/expiring/supported resources
- **Apply component presets**: Use `cardStyles`, `buttonStyles`, `inputStyles` for consistency
- **Follow the style guide**: Reference `STYLE_GUIDE.md` for patterns and best practices
- **Centralize changes**: Modify design tokens in `src/config/design-tokens.js` for global updates
- **Use helper functions**: `getStatusStyles()`, `getChartColors()`, `getChartTheme()` for dynamic styling
- **Maintain responsiveness**: Use consistent breakpoints and responsive utilities

## Current State and Known Issues

1. **Backend Migration**: Original SQLite backend removed, MongoDB Realm migration incomplete
2. **No Real Data**: Only sample data available, no AWS API integration
3. **Server Stubs**: Server directory contains mostly empty implementations
4. **Missing Features**: Collection runs, real-time updates, multi-server deployment not functional
5. **IDE Files**: `.idea/` directory should be added to `.gitignore`
6. **Missing README**: Main README.md file has been deleted

## Code Quality

- **Qodana Integration**: Code quality analysis configured via `qodana.yaml`
- **Build Output**: Production builds available in `build/` directory
- **Type Safety**: No TypeScript, relying on PropTypes for React components
- **Style Consistency**: Centralized design system ensures consistent UI patterns
- **Documentation**: Comprehensive style guide and component examples available

## Style System Files

### Core Files

- **`src/config/design-tokens.js`**: Central source of truth for all design values
- **`src/utils/styleUtils.js`**: Style utilities, component presets, and helper functions
- **`src/utils/chartColors.js`**: Chart-specific color system (legacy, now uses design tokens)
- **`STYLE_GUIDE.md`**: Comprehensive styling documentation and guidelines
- **`src/index.css`**: CSS variables, global styles, and Tailwind imports
- **`tailwind.config.js`**: Tailwind configuration extended with design tokens

### Key Styling Patterns

```javascript
// Import design utilities
import { cn, getStatusStyles, cardStyles, getChartColors } from '@/utils/styleUtils';

// Use status-based styling
const styles = getStatusStyles('expired');

// Apply component presets
<div className={cardStyles.elevated}>

// Get chart colors
const chartColors = getChartColors('background', 0.8);
```

## 🧪 Testing Framework

### Comprehensive Testing Suite

The project includes a comprehensive testing automation framework with AutoSpectra-inspired capabilities:

#### Test Categories

- **Unit Tests**: Jest + React Testing Library for component testing
- **E2E Tests**: Playwright with multi-browser support (Chrome, Firefox, Safari, Mobile)
- **Accessibility Tests**: WCAG 2.1 AA compliance with axe-core integration
- **Performance Tests**: Core Web Vitals monitoring (FCP, LCP, CLS)
- **Visual Tests**: Screenshot comparison and UI validation

#### Test Structure

```
tests/
├── e2e/                          # End-to-end tests
│   ├── dashboard.spec.js         # Dashboard functionality
│   ├── resources.spec.js         # Resources page testing
│   ├── accessibility.spec.js     # A11y compliance
│   ├── performance.spec.js       # Performance metrics
│   └── setup-verification.spec.js # Basic verification
├── utils/test-helpers.js         # Testing utilities
├── playwright.config.js          # Playwright configuration
└── README.md                     # Testing documentation
```

#### Running Tests

```bash
# Unit tests
npm test                          # Jest unit tests
npm run test:coverage            # With coverage

# E2E tests
npm run test:e2e                 # All E2E tests
npm run test:e2e:ui              # Interactive mode
npm run test:e2e:headed          # Visible browser
npm run test:e2e:debug           # Debug mode

# Specialized tests
npm run test:accessibility       # A11y tests only
npm run test:performance         # Performance tests only
npm run test:all                 # All tests

# Test runner script
node tests/run-tests.js [type]   # Interactive runner
```

#### Test Features

- **Multi-browser testing**: Chrome, Firefox, Safari, Mobile Chrome/Safari
- **Accessibility compliance**: WCAG 2.1 AA automated checks with axe-core
- **Performance monitoring**: Core Web Vitals (FCP, LCP, CLS) measurement
- **Visual regression**: Screenshot comparison and UI validation
- **Error handling**: Graceful failure and error boundary testing
- **Mobile responsiveness**: Cross-device and viewport testing
- **CI/CD integration**: GitHub Actions workflow for automated testing
- **Test data attributes**: Comprehensive `data-testid` coverage for reliable element selection

#### Test Utilities

- **Performance helpers**: Timing measurements and Core Web Vitals monitoring
- **Accessibility helpers**: Keyboard navigation and screen reader testing
- **Common functions**: Element waiting, screenshot capture, viewport management
- **Test data**: Predefined test scenarios and mock data

## 🔧 VS Code Integration

### Comprehensive Development Environment

The project includes a complete VS Code integration setup inspired by Code MCP capabilities:

#### VS Code Configuration Files

```
.vscode/
├── settings.json              # Editor and workspace settings
├── extensions.json            # Recommended extensions
├── tasks.json                 # Build and development tasks
├── launch.json               # Debug configurations
└── snippets.code-snippets    # Custom code snippets
```

#### Essential Extensions

- **Code Quality**: ESLint, Prettier, Error Lens, Spell Checker
- **React Development**: ES7+ React/Redux snippets, Auto Rename Tag, Path IntelliSense
- **Testing**: Playwright Test for VS Code, Jest Runner, Test Explorer
- **Git Integration**: GitLens, GitHub Pull Requests, GitHub Copilot
- **Styling**: Tailwind CSS IntelliSense, CSS Peek
- **Documentation**: Markdown All in One, Markdown Lint, Mermaid Preview

#### Development Tasks

```bash
# Available via Ctrl+Shift+P > Tasks: Run Task
- Start Development Server      # npm start
- Build Production             # npm run build
- Run Unit Tests              # npm test
- Run E2E Tests               # npm run test:e2e
- Run E2E Tests (UI Mode)     # npm run test:e2e:ui
- Run Accessibility Tests     # npm run test:accessibility
- Run Performance Tests       # npm run test:performance
- Lint Code                   # ESLint validation
- Format Code                 # Prettier formatting
- Clean Build                 # Remove build artifacts
- Fetch AWS Resources         # Run AWS data collection
- Open Test Report            # View Playwright reports
```

#### Debug Configurations

- **Debug React App**: Node.js debugging for React development server
- **Debug React App in Chrome**: Browser debugging with source maps
- **Debug Jest Tests**: Unit test debugging with breakpoints
- **Debug Current Jest Test**: Debug specific test with input prompt
- **Debug Playwright Tests**: E2E test debugging with Playwright inspector
- **Debug Specific Playwright Test**: Debug individual E2E test files
- **Debug Build Process**: Troubleshoot build issues

#### Code Snippets

- **React Components**: `rfc` (functional component), `rfcp` (component with props)
- **React Hooks**: `us` (useState), `ue` (useEffect), `ucb` (useCallback), `um` (useMemo)
- **Testing**: `pwtest` (Playwright test), `jtest` (Jest test), `rtlr` (React Testing Library)
- **Utilities**: `cl` (console.log), `tc` (try-catch), `af` (async function)
- **Project-specific**: `eolstatus` (AWS EOL status helper), `chartjs` (Chart.js config)

#### Workspace Features

- **File Nesting**: Organized file explorer with related files grouped
- **Search Exclusions**: Optimized search excluding build artifacts and dependencies
- **Auto-formatting**: Format on save with Prettier integration
- **Import Organization**: Automatic import sorting and cleanup
- **Git Integration**: Smart commits, auto-fetch, and conflict resolution
- **Terminal Integration**: Configured for macOS/zsh with proper font sizing

#### Getting Started with VS Code

```bash
# Open the workspace
code aws-eol-dashboard.code-workspace

# Or open the project directory
code .

# Install recommended extensions when prompted
# Use Ctrl+Shift+P to access command palette
# Use Ctrl+Shift+` to open integrated terminal
```
