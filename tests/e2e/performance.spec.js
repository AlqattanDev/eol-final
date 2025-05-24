import { test, expect } from '@playwright/test';
import { PerformanceHelper, waitForElement, waitForCharts } from '../utils/test-helpers.js';

test.describe('Performance Tests', () => {
  let performanceHelper;

  test.beforeEach(async ({ page }) => {
    performanceHelper = new PerformanceHelper(page);
  });

  test('should load dashboard within acceptable time', async ({ page }) => {
    await performanceHelper.startTiming('dashboard-load');
    
    await page.goto('/');
    await waitForElement(page, '[data-testid="dashboard"]');
    
    await performanceHelper.endTiming('dashboard-load');
    
    const metrics = performanceHelper.getMetrics();
    const loadTime = metrics['dashboard-load'].duration;
    
    // Dashboard should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`Dashboard load time: ${loadTime}ms`);
  });

  test('should render charts within acceptable time', async ({ page }) => {
    await page.goto('/');
    await waitForElement(page, '[data-testid="dashboard"]');
    
    await performanceHelper.startTiming('charts-render');
    await waitForCharts(page);
    await performanceHelper.endTiming('charts-render');
    
    const metrics = performanceHelper.getMetrics();
    const renderTime = metrics['charts-render'].duration;
    
    // Charts should render within 3 seconds
    expect(renderTime).toBeLessThan(3000);
    
    console.log(`Charts render time: ${renderTime}ms`);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    await waitForElement(page, '[data-testid="dashboard"]');
    
    // Measure First Contentful Paint
    const fcp = await performanceHelper.measureFirstContentfulPaint();
    
    // Measure Largest Contentful Paint
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });

    // Measure Cumulative Layout Shift
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Resolve after a reasonable time
        setTimeout(() => resolve(clsValue), 3000);
      });
    });

    console.log(`Core Web Vitals - FCP: ${fcp}ms, LCP: ${lcp}ms, CLS: ${cls}`);
    
    // Core Web Vitals thresholds
    expect(fcp).toBeLessThan(1800); // Good FCP < 1.8s
    if (lcp > 0) {
      expect(lcp).toBeLessThan(2500); // Good LCP < 2.5s
    }
    expect(cls).toBeLessThan(0.1); // Good CLS < 0.1
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/resources');
    await waitForElement(page, '[data-testid="resources-page"]');
    
    await performanceHelper.startTiming('table-render');
    
    // Wait for table to load
    await waitForElement(page, '[data-testid="resource-table"]');
    
    await performanceHelper.endTiming('table-render');
    
    const metrics = performanceHelper.getMetrics();
    const renderTime = metrics['table-render'].duration;
    
    // Table should render within 2 seconds even with large datasets
    expect(renderTime).toBeLessThan(2000);
    
    console.log(`Table render time: ${renderTime}ms`);
  });

  test('should filter data efficiently', async ({ page }) => {
    await page.goto('/resources');
    await waitForElement(page, '[data-testid="resources-page"]');
    
    const statusFilter = page.locator('[data-testid="status-filter"]');
    
    if (await statusFilter.isVisible()) {
      await performanceHelper.startTiming('filter-apply');
      
      await statusFilter.click();
      
      const expiredOption = page.locator('[data-testid="status-option-expired"]');
      if (await expiredOption.isVisible()) {
        await expiredOption.click();
        
        // Wait for filter to apply
        await page.waitForTimeout(100);
        
        await performanceHelper.endTiming('filter-apply');
        
        const metrics = performanceHelper.getMetrics();
        const filterTime = metrics['filter-apply'].duration;
        
        // Filtering should be near-instantaneous
        expect(filterTime).toBeLessThan(1000);
        
        console.log(`Filter apply time: ${filterTime}ms`);
      }
    }
  });

  test('should search efficiently', async ({ page }) => {
    await page.goto('/resources');
    await waitForElement(page, '[data-testid="resources-page"]');
    
    const searchInput = page.locator('[data-testid="resource-search"]');
    
    if (await searchInput.isVisible()) {
      await performanceHelper.startTiming('search-response');
      
      await searchInput.fill('ec2');
      
      // Wait for search results
      await page.waitForTimeout(500);
      
      await performanceHelper.endTiming('search-response');
      
      const metrics = performanceHelper.getMetrics();
      const searchTime = metrics['search-response'].duration;
      
      // Search should respond within 1 second
      expect(searchTime).toBeLessThan(1000);
      
      console.log(`Search response time: ${searchTime}ms`);
    }
  });

  test('should navigate between pages efficiently', async ({ page }) => {
    await page.goto('/');
    await waitForElement(page, '[data-testid="dashboard"]');
    
    await performanceHelper.startTiming('navigation');
    
    // Navigate to resources
    await page.click('a[href="/resources"]');
    await waitForElement(page, '[data-testid="resources-page"]');
    
    await performanceHelper.endTiming('navigation');
    
    const metrics = performanceHelper.getMetrics();
    const navTime = metrics['navigation'].duration;
    
    // Navigation should be fast (SPA)
    expect(navTime).toBeLessThan(1000);
    
    console.log(`Navigation time: ${navTime}ms`);
  });

  test('should handle mobile performance well', async ({ page }) => {
    // Simulate mobile device
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Simulate slower network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100); // Add 100ms delay
    });
    
    await performanceHelper.startTiming('mobile-load');
    
    await page.goto('/');
    await waitForElement(page, '[data-testid="dashboard"]');
    
    await performanceHelper.endTiming('mobile-load');
    
    const metrics = performanceHelper.getMetrics();
    const loadTime = metrics['mobile-load'].duration;
    
    // Mobile should still load reasonably fast
    expect(loadTime).toBeLessThan(8000);
    
    console.log(`Mobile load time: ${loadTime}ms`);
  });

  test('should have efficient memory usage', async ({ page }) => {
    await page.goto('/');
    await waitForElement(page, '[data-testid="dashboard"]');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });
    
    if (initialMemory) {
      // Navigate through pages to test for memory leaks
      await page.click('a[href="/resources"]');
      await waitForElement(page, '[data-testid="resources-page"]');
      
      await page.click('a[href="/settings"]');
      await waitForElement(page, 'h1');
      
      await page.click('a[href="/"]');
      await waitForElement(page, '[data-testid="dashboard"]');
      
      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });
      
      if (finalMemory) {
        const memoryIncrease = finalMemory.used - initialMemory.used;
        const memoryIncreasePercent = (memoryIncrease / initialMemory.used) * 100;
        
        console.log(`Memory usage - Initial: ${(initialMemory.used / 1024 / 1024).toFixed(2)}MB, Final: ${(finalMemory.used / 1024 / 1024).toFixed(2)}MB`);
        console.log(`Memory increase: ${memoryIncreasePercent.toFixed(2)}%`);
        
        // Memory increase should be reasonable (less than 50% increase)
        expect(memoryIncreasePercent).toBeLessThan(50);
      }
    }
  });

  test('should handle concurrent operations efficiently', async ({ page }) => {
    await page.goto('/');
    await waitForElement(page, '[data-testid="dashboard"]');
    
    await performanceHelper.startTiming('concurrent-operations');
    
    // Perform multiple operations concurrently
    const operations = [
      page.click('a[href="/resources"]'),
      page.waitForSelector('[data-testid="resources-page"]'),
      page.goBack(),
      page.waitForSelector('[data-testid="dashboard"]')
    ];
    
    await Promise.all(operations);
    
    await performanceHelper.endTiming('concurrent-operations');
    
    const metrics = performanceHelper.getMetrics();
    const operationTime = metrics['concurrent-operations'].duration;
    
    // Concurrent operations should complete efficiently
    expect(operationTime).toBeLessThan(3000);
    
    console.log(`Concurrent operations time: ${operationTime}ms`);
  });
});
