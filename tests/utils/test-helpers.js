/**
 * Test utilities and helper functions for AWS EOL Dashboard testing
 */

/**
 * Wait for element to be visible with custom timeout
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector or test ID
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 */
export async function waitForElement(page, selector, timeout = 10000) {
  await page.waitForSelector(selector, { timeout });
}

/**
 * Wait for charts to load (canvas elements)
 * @param {Page} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 */
export async function waitForCharts(page, timeout = 10000) {
  await page.waitForSelector('canvas', { timeout });
  // Additional wait for chart animation to complete
  await page.waitForTimeout(1000);
}

/**
 * Take a screenshot with a descriptive name
 * @param {Page} page - Playwright page object
 * @param {string} name - Screenshot name
 */
export async function takeScreenshot(page, name) {
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

/**
 * Check if element exists without throwing error
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector or test ID
 * @returns {boolean} - True if element exists
 */
export async function elementExists(page, selector) {
  try {
    const element = page.locator(selector);
    return await element.count() > 0;
  } catch {
    return false;
  }
}

/**
 * Fill form field if it exists
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector or test ID
 * @param {string} value - Value to fill
 */
export async function fillIfExists(page, selector, value) {
  if (await elementExists(page, selector)) {
    await page.fill(selector, value);
    return true;
  }
  return false;
}

/**
 * Click element if it exists and is visible
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector or test ID
 */
export async function clickIfExists(page, selector) {
  if (await elementExists(page, selector)) {
    const element = page.locator(selector);
    if (await element.isVisible()) {
      await element.click();
      return true;
    }
  }
  return false;
}

/**
 * Wait for network requests to complete
 * @param {Page} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 */
export async function waitForNetworkIdle(page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Simulate mobile viewport
 * @param {Page} page - Playwright page object
 */
export async function setMobileViewport(page) {
  await page.setViewportSize({ width: 375, height: 667 });
}

/**
 * Simulate tablet viewport
 * @param {Page} page - Playwright page object
 */
export async function setTabletViewport(page) {
  await page.setViewportSize({ width: 768, height: 1024 });
}

/**
 * Simulate desktop viewport
 * @param {Page} page - Playwright page object
 */
export async function setDesktopViewport(page) {
  await page.setViewportSize({ width: 1920, height: 1080 });
}

/**
 * Check if page has loaded successfully
 * @param {Page} page - Playwright page object
 * @param {string} expectedTitle - Expected page title or heading
 */
export async function verifyPageLoad(page, expectedTitle) {
  await waitForElement(page, 'h1');
  const heading = await page.locator('h1').textContent();
  return heading.includes(expectedTitle);
}

/**
 * Test data attributes for components
 */
export const testIds = {
  // Dashboard
  dashboard: '[data-testid="dashboard"]',
  statusChart: '[data-testid="status-chart"]',
  typeDistributionChart: '[data-testid="type-distribution-chart"]',
  recentExpirationsTable: '[data-testid="recent-expirations-table"]',
  statCard: '[data-testid="stat-card"]',
  statValue: '[data-testid="stat-value"]',
  
  // Resources
  resourcesPage: '[data-testid="resources-page"]',
  resourceTable: '[data-testid="resource-table"]',
  resourceFilter: '[data-testid="resource-filter"]',
  statusFilter: '[data-testid="status-filter"]',
  serviceFilter: '[data-testid="service-filter"]',
  regionFilter: '[data-testid="region-filter"]',
  resourceSearch: '[data-testid="resource-search"]',
  exportButton: '[data-testid="export-button"]',
  
  // Navigation
  mobileMenuButton: '[data-testid="mobile-menu-button"]',
  mobileMenu: '[data-testid="mobile-menu"]',
  darkModeToggle: '[data-testid="dark-mode-toggle"]',
  
  // Account
  accountSelector: '[data-testid="account-selector"]',
  accountOption: '[data-testid="account-option"]',
  
  // Common
  errorBoundary: '[data-testid="error-boundary"]',
  errorMessage: '[data-testid="error-message"]',
  emptyState: '[data-testid="empty-state"]',
  noResults: '[data-testid="no-results"]',
  loadingSpinner: '[data-testid="loading-spinner"]',
  
  // Pagination
  pagination: '[data-testid="pagination"]',
  paginationNext: '[data-testid="pagination-next"]',
  paginationPrev: '[data-testid="pagination-prev"]',
  
  // Modal
  modal: '[data-testid="modal"]',
  modalTrigger: '[data-testid="modal-trigger"]',
  resourceDetailsModal: '[data-testid="resource-details-modal"]',
  
  // Mobile
  mobileResourceList: '[data-testid="mobile-resource-list"]',
  mobileFilterButton: '[data-testid="mobile-filter-button"]',
  mobileFilterPanel: '[data-testid="mobile-filter-panel"]'
};

/**
 * Common test data for forms and inputs
 */
export const testData = {
  search: {
    ec2: 'ec2',
    rds: 'rds',
    lambda: 'lambda',
    empty: ''
  },
  accounts: {
    production: 'production',
    staging: 'staging',
    development: 'development'
  },
  statuses: {
    expired: 'expired',
    expiring: 'expiring',
    supported: 'supported'
  },
  services: {
    ec2: 'EC2',
    rds: 'RDS',
    lambda: 'Lambda',
    eks: 'EKS'
  }
};

/**
 * Performance testing helpers
 */
export class PerformanceHelper {
  constructor(page) {
    this.page = page;
    this.metrics = {};
  }

  async startTiming(label) {
    this.metrics[label] = { start: Date.now() };
  }

  async endTiming(label) {
    if (this.metrics[label]) {
      this.metrics[label].end = Date.now();
      this.metrics[label].duration = this.metrics[label].end - this.metrics[label].start;
    }
  }

  async measurePageLoad() {
    const navigationStart = await this.page.evaluate(() => performance.timing.navigationStart);
    const loadComplete = await this.page.evaluate(() => performance.timing.loadEventEnd);
    return loadComplete - navigationStart;
  }

  async measureFirstContentfulPaint() {
    const fcp = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              resolve(entry.startTime);
            }
          }
        }).observe({ entryTypes: ['paint'] });
      });
    });
    return fcp;
  }

  getMetrics() {
    return this.metrics;
  }
}

/**
 * Accessibility testing helpers
 */
export class AccessibilityHelper {
  constructor(page) {
    this.page = page;
  }

  async checkFocusVisible() {
    const focusedElement = this.page.locator(':focus');
    return await focusedElement.isVisible();
  }

  async tabThroughElements(count = 5) {
    const focusedElements = [];
    
    for (let i = 0; i < count; i++) {
      await this.page.keyboard.press('Tab');
      const focused = this.page.locator(':focus');
      
      if (await focused.isVisible()) {
        const tagName = await focused.evaluate(el => el.tagName);
        const role = await focused.getAttribute('role');
        focusedElements.push({ tagName, role, index: i });
      }
    }
    
    return focusedElements;
  }

  async checkHeadingStructure() {
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
    const structure = [];
    
    for (const heading of headings) {
      const level = await heading.evaluate(el => parseInt(el.tagName.charAt(1)));
      const text = await heading.textContent();
      structure.push({ level, text: text.trim() });
    }
    
    return structure;
  }
}
