# AWS EOL Dashboard - Testing Suite

This directory contains comprehensive testing automation for the AWS End-of-Life Dashboard, providing end-to-end testing, accessibility testing, and performance testing capabilities.

## 🧪 Test Structure

```
tests/
├── e2e/                          # End-to-end tests
│   ├── dashboard.spec.js         # Dashboard functionality tests
│   ├── resources.spec.js         # Resources page tests
│   ├── accessibility.spec.js     # Accessibility compliance tests
│   ├── performance.spec.js       # Performance and Core Web Vitals tests
│   └── setup-verification.spec.js # Basic setup verification
├── utils/                        # Test utilities and helpers
│   └── test-helpers.js          # Common testing functions
├── playwright.config.js          # Playwright configuration
├── run-tests.js                 # Test runner script
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

1. **Node.js 18+** - Required for running tests
2. **Development server** - The app should be running on `http://localhost:3000`

### Installation

The testing dependencies are already included in the project. If you need to install them separately:

```bash
npm install --save-dev playwright @playwright/test @axe-core/playwright
npx playwright install
```

## 🎯 Running Tests

### Quick Start

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npm run test:e2e -- tests/e2e/dashboard.spec.js
```

### Test Categories

#### 1. End-to-End Tests
```bash
# All E2E tests
npm run test:e2e

# Dashboard tests only
npm run test:e2e -- tests/e2e/dashboard.spec.js

# Resources page tests only
npm run test:e2e -- tests/e2e/resources.spec.js
```

#### 2. Accessibility Tests
```bash
# Run accessibility tests
npm run test:accessibility

# Run with specific browser
npm run test:accessibility -- --project=chromium
```

#### 3. Performance Tests
```bash
# Run performance tests
npm run test:performance

# Run with detailed reporting
npm run test:performance -- --reporter=html
```

#### 4. All Tests
```bash
# Run unit tests + E2E tests
npm run test:all
```

### Using the Test Runner Script

```bash
# Interactive test runner
node tests/run-tests.js

# Run specific test type
node tests/run-tests.js e2e
node tests/run-tests.js accessibility
node tests/run-tests.js performance
node tests/run-tests.js all
```

## 📊 Test Reports

### HTML Reports
After running tests, view detailed reports:

```bash
# Show last test report
npm run test:e2e:report

# Or open manually
open playwright-report/index.html
```

### Test Results
- **Screenshots**: Captured on test failures
- **Videos**: Recorded for failed tests
- **Traces**: Available for debugging failed tests
- **Coverage**: Unit test coverage reports

## 🔧 Configuration

### Playwright Configuration

Key settings in `tests/playwright.config.js`:

- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Base URL**: `http://localhost:3000`
- **Timeouts**: 30s default, 120s for server startup
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots**: On failure only
- **Videos**: Retained on failure

### Test Data Attributes

The application uses `data-testid` attributes for reliable element selection:

```javascript
// Dashboard
'[data-testid="dashboard"]'
'[data-testid="stat-card"]'
'[data-testid="status-chart"]'

// Resources
'[data-testid="resources-page"]'
'[data-testid="resource-table"]'
'[data-testid="resource-filter"]'

// Navigation
'[data-testid="mobile-menu-button"]'
'[data-testid="dark-mode-toggle"]'
```

## 🛠 Test Utilities

### Helper Functions

```javascript
import { 
  waitForElement, 
  waitForCharts, 
  takeScreenshot,
  elementExists,
  clickIfExists 
} from '../utils/test-helpers.js';

// Wait for specific elements
await waitForElement(page, '[data-testid="dashboard"]');

// Wait for charts to load
await waitForCharts(page);

// Take screenshot
await takeScreenshot(page, 'dashboard-loaded');
```

### Performance Testing

```javascript
import { PerformanceHelper } from '../utils/test-helpers.js';

const perf = new PerformanceHelper(page);
await perf.startTiming('page-load');
// ... perform actions
await perf.endTiming('page-load');
```

### Accessibility Testing

```javascript
import { AccessibilityHelper } from '../utils/test-helpers.js';

const a11y = new AccessibilityHelper(page);
const focusedElements = await a11y.tabThroughElements(5);
const headingStructure = await a11y.checkHeadingStructure();
```

## 🎨 Test Categories Explained

### 1. Dashboard Tests (`dashboard.spec.js`)
- ✅ Page loading and basic structure
- ✅ Summary statistics display
- ✅ Chart rendering (Status & Type Distribution)
- ✅ Recent expirations table
- ✅ Navigation between pages
- ✅ Dark mode toggle
- ✅ Mobile responsiveness
- ✅ Account selection
- ✅ Error handling

### 2. Resources Tests (`resources.spec.js`)
- ✅ Resource table display
- ✅ Filtering by status, service, region
- ✅ Sorting functionality
- ✅ Search functionality
- ✅ Pagination
- ✅ Resource details modal/page
- ✅ Export functionality
- ✅ Empty state handling
- ✅ Mobile responsiveness

### 3. Accessibility Tests (`accessibility.spec.js`)
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast
- ✅ Focus management
- ✅ ARIA attributes
- ✅ Form accessibility
- ✅ High contrast mode support

### 4. Performance Tests (`performance.spec.js`)
- ✅ Page load times
- ✅ Chart rendering performance
- ✅ Core Web Vitals (FCP, LCP, CLS)
- ✅ Large dataset handling
- ✅ Filter/search performance
- ✅ Navigation performance
- ✅ Mobile performance
- ✅ Memory usage monitoring

## 🚨 Troubleshooting

### Common Issues

1. **Tests failing with "Cannot navigate to invalid URL"**
   ```bash
   # Make sure development server is running
   npm start
   ```

2. **Playwright browsers not installed**
   ```bash
   npx playwright install
   ```

3. **Port 3000 already in use**
   ```bash
   # Kill existing processes
   lsof -ti:3000 | xargs kill -9
   npm start
   ```

4. **Tests timing out**
   - Increase timeout in `playwright.config.js`
   - Check if app is loading slowly
   - Verify network connectivity

### Debug Mode

```bash
# Run tests in debug mode
npm run test:e2e:debug

# Run specific test in debug mode
npm run test:e2e -- tests/e2e/dashboard.spec.js --debug
```

## 📈 CI/CD Integration

The project includes GitHub Actions workflow (`.github/workflows/test.yml`) that runs:

1. **Unit Tests** - Jest/React Testing Library tests
2. **E2E Tests** - Full Playwright test suite
3. **Accessibility Tests** - WCAG compliance checks
4. **Performance Tests** - Core Web Vitals monitoring
5. **Build Tests** - Production build verification

## 🔄 Continuous Improvement

### Adding New Tests

1. **Create test file** in appropriate directory
2. **Use test helpers** for common operations
3. **Add data-testid attributes** to new components
4. **Update test documentation**
5. **Run tests locally** before committing

### Best Practices

- ✅ Use descriptive test names
- ✅ Group related tests with `describe` blocks
- ✅ Use `data-testid` for element selection
- ✅ Wait for elements before interacting
- ✅ Handle loading states and async operations
- ✅ Test both success and error scenarios
- ✅ Include accessibility checks
- ✅ Monitor performance metrics

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Axe Accessibility Testing](https://www.deque.com/axe/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Core Web Vitals](https://web.dev/vitals/)
