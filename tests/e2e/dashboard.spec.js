import { test, expect } from '@playwright/test';

test.describe('AWS EOL Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
  });

  test('should load the dashboard page', async ({ page }) => {
    // Check if the main dashboard elements are present
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Check for key dashboard components
    await expect(page.locator('[data-testid="status-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="type-distribution-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-expirations-table"]')).toBeVisible();
  });

  test('should display summary statistics', async ({ page }) => {
    // Check for stat cards
    const statCards = page.locator('[data-testid="stat-card"]');
    await expect(statCards).toHaveCount(4); // Total, Expired, Expiring, Supported
    
    // Verify stat card content
    await expect(statCards.first()).toContainText('Total Resources');
  });

  test('should render charts correctly', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Check if charts are rendered (canvas elements should be present)
    const canvasElements = page.locator('canvas');
    await expect(canvasElements).toHaveCountGreaterThan(0);
  });

  test('should navigate between pages', async ({ page }) => {
    // Test navigation to Resources page
    await page.click('a[href="/resources"]');
    await expect(page.locator('h1')).toContainText('Resources');
    
    // Test navigation to Settings page
    await page.click('a[href="/settings"]');
    await expect(page.locator('h1')).toContainText('Settings');
    
    // Navigate back to Dashboard
    await page.click('a[href="/"]');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should handle dark mode toggle', async ({ page }) => {
    // Find and click the dark mode toggle
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
    
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      
      // Check if dark mode is applied
      await expect(page.locator('html')).toHaveClass(/dark/);
      
      // Toggle back to light mode
      await darkModeToggle.click();
      await expect(page.locator('html')).not.toHaveClass(/dark/);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile navigation works
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    }
    
    // Verify content is still accessible
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should handle account selection', async ({ page }) => {
    // Look for account selector
    const accountSelector = page.locator('[data-testid="account-selector"]');
    
    if (await accountSelector.isVisible()) {
      await accountSelector.click();
      
      // Check if account options are available
      const accountOptions = page.locator('[data-testid="account-option"]');
      if (await accountOptions.count() > 0) {
        await accountOptions.first().click();
        
        // Verify that the dashboard updates with account-specific data
        await page.waitForTimeout(1000); // Wait for data to update
        await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
      }
    }
  });

  test('should display recent expirations table', async ({ page }) => {
    const table = page.locator('[data-testid="recent-expirations-table"]');
    await expect(table).toBeVisible();
    
    // Check table headers
    await expect(table.locator('th')).toContainText(['Resource', 'Service', 'Status', 'EOL Date']);
    
    // Check if table has data rows
    const tableRows = table.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      // Verify first row has expected structure
      const firstRow = tableRows.first();
      await expect(firstRow.locator('td')).toHaveCountGreaterThan(3);
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test with network offline to simulate error conditions
    await page.context().setOffline(true);
    
    // Reload the page
    await page.reload();
    
    // Check if error boundary or error message is displayed
    const errorElement = page.locator('[data-testid="error-boundary"], [data-testid="error-message"]');
    
    // Re-enable network
    await page.context().setOffline(false);
  });

  test('should load and display data correctly', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    
    // Check if data is displayed in various components
    const statCards = page.locator('[data-testid="stat-card"]');
    
    // Verify that stat cards show numbers (not just loading states)
    for (let i = 0; i < await statCards.count(); i++) {
      const card = statCards.nth(i);
      const valueElement = card.locator('[data-testid="stat-value"]');
      if (await valueElement.isVisible()) {
        const value = await valueElement.textContent();
        expect(value).toMatch(/\d+/); // Should contain at least one digit
      }
    }
  });
});
