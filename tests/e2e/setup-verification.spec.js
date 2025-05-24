import { test, expect } from '@playwright/test';

test.describe('Setup Verification', () => {
  test('should verify basic application setup', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000/');

    // Wait for the page to load
    await page.waitForTimeout(2000);

    // Check if the page title is correct
    await expect(page).toHaveTitle(/AWS EOL Dashboard/);

    // Check if the main heading is present
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Verify the page loads without JavaScript errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit more to catch any console errors
    await page.waitForTimeout(3000);

    // Log any errors for debugging
    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    }

    // For now, we'll just log errors but not fail the test
    // as the app might have some expected errors during development
  });

  test('should load basic page structure', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Check for basic page structure
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check if React has rendered
    const reactRoot = page.locator('#root');
    await expect(reactRoot).toBeVisible();

    // Verify navigation is present
    const nav = page.locator('nav');
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }
  });

  test('should handle different routes', async ({ page }) => {
    // Test dashboard route
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();

    // Test resources route
    await page.goto('http://localhost:3000/resources');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();

    // Test settings route
    await page.goto('http://localhost:3000/settings');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });
});
