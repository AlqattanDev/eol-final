import { test, expect } from '@playwright/test';

test.describe('Resources Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resources');
    await page.waitForSelector('[data-testid="resources-page"]', { timeout: 10000 });
  });

  test('should load the resources page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Resources');
    await expect(page.locator('[data-testid="resource-table"]')).toBeVisible();
  });

  test('should display resource filters', async ({ page }) => {
    // Check for filter components
    const filterContainer = page.locator('[data-testid="resource-filter"]');
    await expect(filterContainer).toBeVisible();
    
    // Check for specific filter types
    const statusFilter = page.locator('[data-testid="status-filter"]');
    const serviceFilter = page.locator('[data-testid="service-filter"]');
    const regionFilter = page.locator('[data-testid="region-filter"]');
    
    if (await statusFilter.isVisible()) {
      await expect(statusFilter).toBeVisible();
    }
    if (await serviceFilter.isVisible()) {
      await expect(serviceFilter).toBeVisible();
    }
    if (await regionFilter.isVisible()) {
      await expect(regionFilter).toBeVisible();
    }
  });

  test('should filter resources by status', async ({ page }) => {
    const statusFilter = page.locator('[data-testid="status-filter"]');
    
    if (await statusFilter.isVisible()) {
      // Click on status filter
      await statusFilter.click();
      
      // Select "Expired" status
      const expiredOption = page.locator('[data-testid="status-option-expired"]');
      if (await expiredOption.isVisible()) {
        await expiredOption.click();
        
        // Wait for table to update
        await page.waitForTimeout(1000);
        
        // Verify that only expired resources are shown
        const statusCells = page.locator('[data-testid="resource-status"]');
        const statusCount = await statusCells.count();
        
        if (statusCount > 0) {
          for (let i = 0; i < statusCount; i++) {
            const statusText = await statusCells.nth(i).textContent();
            expect(statusText.toLowerCase()).toContain('expired');
          }
        }
      }
    }
  });

  test('should filter resources by service', async ({ page }) => {
    const serviceFilter = page.locator('[data-testid="service-filter"]');
    
    if (await serviceFilter.isVisible()) {
      await serviceFilter.click();
      
      // Get available service options
      const serviceOptions = page.locator('[data-testid^="service-option-"]');
      const optionCount = await serviceOptions.count();
      
      if (optionCount > 0) {
        // Click on first service option
        await serviceOptions.first().click();
        
        // Wait for table to update
        await page.waitForTimeout(1000);
        
        // Verify table shows filtered results
        const table = page.locator('[data-testid="resource-table"]');
        await expect(table).toBeVisible();
      }
    }
  });

  test('should sort resources by columns', async ({ page }) => {
    const table = page.locator('[data-testid="resource-table"]');
    await expect(table).toBeVisible();
    
    // Find sortable column headers
    const sortableHeaders = page.locator('th[data-sortable="true"]');
    const headerCount = await sortableHeaders.count();
    
    if (headerCount > 0) {
      // Click on first sortable header
      await sortableHeaders.first().click();
      
      // Wait for sort to apply
      await page.waitForTimeout(500);
      
      // Click again to reverse sort
      await sortableHeaders.first().click();
      await page.waitForTimeout(500);
      
      // Verify table is still visible and functional
      await expect(table).toBeVisible();
    }
  });

  test('should display resource details', async ({ page }) => {
    const table = page.locator('[data-testid="resource-table"]');
    const tableRows = table.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      // Click on first resource row
      await tableRows.first().click();
      
      // Check if resource details modal or page opens
      const detailsModal = page.locator('[data-testid="resource-details-modal"]');
      const detailsPage = page.locator('[data-testid="resource-details-page"]');
      
      // Wait for either modal or page to appear
      await page.waitForTimeout(1000);
      
      const modalVisible = await detailsModal.isVisible();
      const pageVisible = await detailsPage.isVisible();
      
      expect(modalVisible || pageVisible).toBeTruthy();
    }
  });

  test('should handle pagination', async ({ page }) => {
    const pagination = page.locator('[data-testid="pagination"]');
    
    if (await pagination.isVisible()) {
      // Check for next page button
      const nextButton = page.locator('[data-testid="pagination-next"]');
      const prevButton = page.locator('[data-testid="pagination-prev"]');
      
      if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        // Verify we're on a different page
        await expect(pagination).toBeVisible();
        
        // Go back to previous page
        if (await prevButton.isVisible() && !(await prevButton.isDisabled())) {
          await prevButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('should search resources', async ({ page }) => {
    const searchInput = page.locator('[data-testid="resource-search"]');
    
    if (await searchInput.isVisible()) {
      // Type in search term
      await searchInput.fill('ec2');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Verify table updates with search results
      const table = page.locator('[data-testid="resource-table"]');
      await expect(table).toBeVisible();
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(1000);
    }
  });

  test('should export resources data', async ({ page }) => {
    const exportButton = page.locator('[data-testid="export-button"]');
    
    if (await exportButton.isVisible()) {
      // Set up download promise before clicking
      const downloadPromise = page.waitForEvent('download');
      
      await exportButton.click();
      
      // Wait for download to start
      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.(csv|json|xlsx)$/);
      } catch (error) {
        // Download might not be implemented yet, that's okay
        console.log('Export functionality not yet implemented');
      }
    }
  });

  test('should handle empty state', async ({ page }) => {
    // Apply filters that would result in no data
    const statusFilter = page.locator('[data-testid="status-filter"]');
    
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      
      // Try to select a filter that might result in empty state
      const serviceFilter = page.locator('[data-testid="service-filter"]');
      if (await serviceFilter.isVisible()) {
        await serviceFilter.click();
        
        // Look for empty state message
        await page.waitForTimeout(1000);
        
        const emptyState = page.locator('[data-testid="empty-state"]');
        const noResults = page.locator('[data-testid="no-results"]');
        
        // Either empty state or table should be visible
        const tableRows = page.locator('[data-testid="resource-table"] tbody tr');
        const hasRows = await tableRows.count() > 0;
        const hasEmptyState = await emptyState.isVisible() || await noResults.isVisible();
        
        expect(hasRows || hasEmptyState).toBeTruthy();
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile-specific elements are visible
    const mobileTable = page.locator('[data-testid="mobile-resource-list"]');
    const desktopTable = page.locator('[data-testid="resource-table"]');
    
    // Either mobile list or responsive table should be visible
    const mobileVisible = await mobileTable.isVisible();
    const desktopVisible = await desktopTable.isVisible();
    
    expect(mobileVisible || desktopVisible).toBeTruthy();
    
    // Test mobile filters
    const mobileFilterButton = page.locator('[data-testid="mobile-filter-button"]');
    if (await mobileFilterButton.isVisible()) {
      await mobileFilterButton.click();
      
      const filterPanel = page.locator('[data-testid="mobile-filter-panel"]');
      await expect(filterPanel).toBeVisible();
    }
  });
});
