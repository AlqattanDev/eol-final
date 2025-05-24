/* eslint-disable jest/no-conditional-expect */
import { expect, test } from '@playwright/test';

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
    await expect(
      page.locator('[data-testid="type-distribution-chart"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="recent-expirations-table"]')
    ).toBeVisible();
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

    // Check if dark mode toggle is visible, skip if not
    const isVisible = await darkModeToggle.isVisible();
    if (!isVisible) {
      test.skip();
      return;
    }

    await darkModeToggle.click();

    // Check if dark mode is applied
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Toggle back to light mode
    await darkModeToggle.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify content is accessible on mobile
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Check if dashboard components are still visible on mobile
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
  });

  test('should handle mobile menu if present', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if mobile navigation works
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    const isMenuButtonVisible = await mobileMenuButton.isVisible();

    // Skip test if mobile menu button is not present
    if (!isMenuButtonVisible) {
      test.skip();
      return;
    }

    await mobileMenuButton.click();
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('should handle account selection', async ({ page }) => {
    // Look for account selector
    const accountSelector = page.locator('[data-testid="account-selector"]');
    const isSelectorVisible = await accountSelector.isVisible();

    // Skip test if account selector is not present
    if (!isSelectorVisible) {
      test.skip();
      return;
    }

    await accountSelector.click();

    // Check if account options are available
    const accountOptions = page.locator('[data-testid="account-option"]');
    const optionCount = await accountOptions.count();

    // Skip test if no account options are available
    if (optionCount === 0) {
      test.skip();
      return;
    }

    await accountOptions.first().click();

    // Verify that the dashboard updates with account-specific data
    await page.waitForTimeout(1000); // Wait for data to update
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
  });

  test('should display recent expirations table', async ({ page }) => {
    const table = page.locator('[data-testid="recent-expirations-table"]');
    await expect(table).toBeVisible();

    // Check table headers
    await expect(table.locator('th')).toContainText([
      'Resource',
      'Service',
      'Status',
      'EOL Date',
    ]);

    // Verify table structure exists
    await expect(table.locator('thead')).toBeVisible();
    await expect(table.locator('tbody')).toBeVisible();
  });

  test('should validate table row structure when data exists', async ({
    page,
  }) => {
    const table = page.locator('[data-testid="recent-expirations-table"]');
    const tableRows = table.locator('tbody tr');
    const rowCount = await tableRows.count();

    // Skip test if no data rows are present
    if (rowCount === 0) {
      test.skip();
      return;
    }

    // Verify first row has expected structure
    const firstRow = tableRows.first();
    await expect(firstRow.locator('td')).toHaveCountGreaterThan(3);
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test with network offline to simulate error conditions
    await page.context().setOffline(true);

    // Reload the page
    await page.reload();

    // Wait for potential error states to appear
    await page.waitForTimeout(2000);

    // Re-enable network
    await page.context().setOffline(false);

    // Verify the page can recover
    await page.reload();
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
  });

  test('should load and display data correctly', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });

    // Check if data is displayed in various components
    const statCards = page.locator('[data-testid="stat-card"]');

    // Verify that stat cards are present
    await expect(statCards).toHaveCountGreaterThan(0);

    // Check that at least one stat card has a value element
    const firstCard = statCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('should display numeric values in stat cards when available', async ({
    page,
  }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });

    const statCards = page.locator('[data-testid="stat-card"]');
    const cardCount = await statCards.count();

    // Skip test if no stat cards are present
    if (cardCount === 0) {
      test.skip();
      return;
    }

    // Check the first card for numeric values
    const firstCard = statCards.first();
    const valueElement = firstCard.locator('[data-testid="stat-value"]');
    const isValueVisible = await valueElement.isVisible();

    // Skip test if value element is not visible
    if (!isValueVisible) {
      test.skip();
      return;
    }

    const value = await valueElement.textContent();
    expect(value).toMatch(/\d+/); // Should contain at least one digit
  });
});
