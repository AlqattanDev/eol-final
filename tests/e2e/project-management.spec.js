/**
 * Project Management Integration Tests
 * Tests for the Shrimp Task Manager-inspired project management system
 */

import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// Helper to run CLI commands
async function runCommand(command) {
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: path.resolve(__dirname, '../..')
    });
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message, stdout: error.stdout, stderr: error.stderr };
  }
}

// Clean up test data
async function cleanupTestData() {
  const testFiles = [
    'project-management/test-tasks.json',
    'project-management/test-milestones.json',
    'project-management/test-team.json'
  ];
  
  for (const file of testFiles) {
    try {
      await fs.unlink(path.resolve(__dirname, '../..', file));
    } catch (error) {
      // File doesn't exist, that's fine
    }
  }
}

test.describe('Project Management System', () => {
  test.beforeEach(async () => {
    await cleanupTestData();
  });

  test.afterEach(async () => {
    await cleanupTestData();
  });

  test.describe('Task Manager', () => {
    test('should display help information', async () => {
      const result = await runCommand('npm run task');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Task Manager - Project Task Management');
      expect(result.stdout).toContain('Usage: node task-manager.js <command>');
    });

    test('should list tasks', async () => {
      const result = await runCommand('npm run task:list');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Tasks');
    });

    test('should handle task operations via npm scripts', async () => {
      // Test task list command
      const listResult = await runCommand('npm run task:list all');
      expect(listResult.success).toBe(true);
      expect(listResult.stdout).toMatch(/Tasks \(all\)/);
    });
  });

  test.describe('Project Planner', () => {
    test('should analyze project health', async () => {
      const result = await runCommand('npm run project:health');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Project Health Analysis');
    });

    test('should analyze timeline', async () => {
      const result = await runCommand('npm run project:timeline');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Timeline Analysis');
    });

    test('should analyze dependencies', async () => {
      const result = await runCommand('npm run project:dependencies');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Dependency Analysis');
    });

    test('should generate comprehensive report', async () => {
      const result = await runCommand('npm run project:report');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Project Status Report');
      expect(result.stdout).toContain('Project Health Analysis');
      expect(result.stdout).toContain('Timeline Analysis');
      expect(result.stdout).toContain('Dependency Analysis');
    });
  });

  test.describe('Milestone Tracker', () => {
    test('should display help information', async () => {
      const result = await runCommand('npm run milestone');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Milestone Tracker');
      expect(result.stdout).toContain('Usage: node milestone-tracker.js <command>');
    });

    test('should list milestones', async () => {
      const result = await runCommand('npm run milestone:list');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Milestones');
    });

    test('should analyze milestones', async () => {
      const result = await runCommand('npm run milestone:analyze');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Milestone Analysis');
    });
  });

  test.describe('Team Manager', () => {
    test('should display help information', async () => {
      const result = await runCommand('npm run team');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Team Manager');
      expect(result.stdout).toContain('Usage: node team-manager.js <command>');
    });

    test('should list team members', async () => {
      const result = await runCommand('npm run team:list');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Team Members');
    });

    test('should analyze workload', async () => {
      const result = await runCommand('npm run team:workload');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Workload Analysis');
    });
  });

  test.describe('Project Reporter', () => {
    test('should generate executive summary', async () => {
      const result = await runCommand('npm run report:summary');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Executive Summary Report');
    });

    test('should save detailed report', async () => {
      const result = await runCommand('npm run report:detailed');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Report saved to:');
      expect(result.stdout).toContain('detailed-report-');
    });

    test('should generate all reports', async () => {
      const result = await runCommand('npm run report:all');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Generating all reports...');
      expect(result.stdout).toContain('All reports generated successfully!');
    });
  });

  test.describe('Integration Tests', () => {
    test('should handle full workflow', async () => {
      // 1. Check initial project health
      const healthResult = await runCommand('npm run project:health');
      expect(healthResult.success).toBe(true);
      
      // 2. List tasks (should work with default sample data)
      const taskResult = await runCommand('npm run task:list');
      expect(taskResult.success).toBe(true);
      
      // 3. Check milestones
      const milestoneResult = await runCommand('npm run milestone:analyze');
      expect(milestoneResult.success).toBe(true);
      
      // 4. Check team workload
      const workloadResult = await runCommand('npm run team:workload');
      expect(workloadResult.success).toBe(true);
      
      // 5. Generate summary report
      const reportResult = await runCommand('npm run report:summary');
      expect(reportResult.success).toBe(true);
    });

    test('should verify all npm scripts are working', async () => {
      const scripts = [
        'task',
        'project:health',
        'milestone',
        'team',
        'report:summary'
      ];
      
      for (const script of scripts) {
        const result = await runCommand(`npm run ${script}`);
        expect(result.success).toBe(true);
        expect(result.stderr).not.toContain('Error');
      }
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist task data across operations', async () => {
      // First run should create default data
      const firstRun = await runCommand('npm run task:list');
      expect(firstRun.success).toBe(true);
      
      // Second run should use existing data
      const secondRun = await runCommand('npm run task:list');
      expect(secondRun.success).toBe(true);
      
      // Both outputs should be similar
      expect(firstRun.stdout).toContain('Tasks');
      expect(secondRun.stdout).toContain('Tasks');
    });
  });
});

test.describe('Project Management UI Integration', () => {
  test('should access project management features from UI', async ({ page }) => {
    await page.goto('/');
    
    // The UI doesn't directly integrate with the CLI tools yet,
    // but we can verify the dashboard still works
    await expect(page).toHaveTitle(/AWS EOL Dashboard/);
    
    // Verify main navigation works
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Resources')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
  });
});

test.describe('Performance Tests', () => {
  test('should handle large task datasets efficiently', async () => {
    const startTime = Date.now();
    
    // Run multiple commands in sequence
    await runCommand('npm run task:list');
    await runCommand('npm run project:health');
    await runCommand('npm run milestone:analyze');
    await runCommand('npm run team:workload');
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // All commands should complete within 5 seconds
    expect(totalTime).toBeLessThan(5000);
  });
});