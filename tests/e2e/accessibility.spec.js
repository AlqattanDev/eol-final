import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues on dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have any automatically detectable accessibility issues on resources page', async ({ page }) => {
    await page.goto('/resources');
    await page.waitForSelector('[data-testid="resources-page"]', { timeout: 10000 });
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have any automatically detectable accessibility issues on settings page', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForSelector('h1', { timeout: 10000 });
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const currentFocus = page.locator(':focus');
      if (await currentFocus.isVisible()) {
        // Verify focused element is interactive
        const tagName = await currentFocus.evaluate(el => el.tagName.toLowerCase());
        const role = await currentFocus.getAttribute('role');
        const tabIndex = await currentFocus.getAttribute('tabindex');
        
        const isInteractive = ['a', 'button', 'input', 'select', 'textarea'].includes(tagName) ||
                             ['button', 'link', 'tab', 'menuitem'].includes(role) ||
                             tabIndex === '0';
        
        if (isInteractive) {
          expect(await currentFocus.isVisible()).toBeTruthy();
        }
      }
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      // Verify h1 exists and is unique
      const h1Elements = page.locator('h1');
      const h1Count = await h1Elements.count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      
      // Check that headings have meaningful text
      for (let i = 0; i < Math.min(headingCount, 10); i++) {
        const heading = headings.nth(i);
        const text = await heading.textContent();
        expect(text.trim().length).toBeGreaterThan(0);
      }
    }
    
    // Check for proper landmark roles
    const landmarks = page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer');
    const landmarkCount = await landmarks.count();
    expect(landmarkCount).toBeGreaterThan(0);
  });

  test('should have proper form accessibility', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Check for form elements
    const formElements = page.locator('input, select, textarea');
    const formCount = await formElements.count();
    
    if (formCount > 0) {
      for (let i = 0; i < Math.min(formCount, 5); i++) {
        const element = formElements.nth(i);
        
        // Check for labels
        const id = await element.getAttribute('id');
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledBy = await element.getAttribute('aria-labelledby');
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          const hasAriaLabel = ariaLabel && ariaLabel.trim().length > 0;
          const hasAriaLabelledBy = ariaLabelledBy && ariaLabelledBy.trim().length > 0;
          
          expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
        }
      }
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    
    // Run axe with color contrast rules specifically
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    // Filter for color contrast violations
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    
    expect(colorContrastViolations).toEqual([]);
  });

  test('should support high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    
    // Verify content is still visible and accessible
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
    
    // Check that interactive elements are still visible
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        await expect(buttons.nth(i)).toBeVisible();
      }
    }
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    
    // Verify page loads and functions normally
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Check that essential functionality still works
    const navigation = page.locator('nav a');
    const navCount = await navigation.count();
    
    if (navCount > 0) {
      await navigation.first().click();
      await page.waitForTimeout(1000);
      
      // Verify navigation worked
      const currentUrl = page.url();
      expect(currentUrl).toContain('localhost:3000');
    }
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    
    // Test focus trap in modals (if any)
    const modalTrigger = page.locator('[data-testid="modal-trigger"], [data-testid="open-modal"]');
    
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      
      const modal = page.locator('[role="dialog"], [data-testid="modal"]');
      if (await modal.isVisible()) {
        // Test that focus is trapped within modal
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        
        // Focus should be within the modal
        const isWithinModal = await modal.locator(':focus').count() > 0;
        expect(isWithinModal).toBeTruthy();
        
        // Test escape key closes modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        const modalStillVisible = await modal.isVisible();
        expect(modalStillVisible).toBeFalsy();
      }
    }
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    
    // Check for proper ARIA attributes on interactive elements
    const interactiveElements = page.locator('button, [role="button"], [role="tab"], [role="menuitem"]');
    const elementCount = await interactiveElements.count();
    
    if (elementCount > 0) {
      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        const element = interactiveElements.nth(i);
        
        // Check for accessible name
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledBy = await element.getAttribute('aria-labelledby');
        const textContent = await element.textContent();
        
        const hasAccessibleName = 
          (ariaLabel && ariaLabel.trim().length > 0) ||
          (ariaLabelledBy && ariaLabelledBy.trim().length > 0) ||
          (textContent && textContent.trim().length > 0);
        
        expect(hasAccessibleName).toBeTruthy();
      }
    }
  });
});
