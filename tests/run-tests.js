#!/usr/bin/env node

/**
 * Test runner script for AWS EOL Dashboard
 * Provides a simple interface to run different types of tests
 */

const { spawn } = require('child_process');
const path = require('path');

const testTypes = {
  unit: 'npm test -- --watchAll=false',
  e2e: 'npx playwright test',
  'e2e-ui': 'npx playwright test --ui',
  'e2e-headed': 'npx playwright test --headed',
  'e2e-debug': 'npx playwright test --debug',
  accessibility: 'npx playwright test tests/e2e/accessibility.spec.js',
  performance: 'npx playwright test tests/e2e/performance.spec.js',
  all: 'npm run test:all'
};

function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running: ${command}\n`);
    
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      cwd: path.resolve(__dirname, '..')
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ Command completed successfully\n`);
        resolve();
      } else {
        console.log(`\n❌ Command failed with exit code ${code}\n`);
        reject(new Error(`Command failed: ${command}`));
      }
    });

    child.on('error', (error) => {
      console.error(`\n❌ Error running command: ${error.message}\n`);
      reject(error);
    });
  });
}

async function main() {
  const testType = process.argv[2];
  
  if (!testType) {
    console.log(`
🧪 AWS EOL Dashboard Test Runner

Usage: node tests/run-tests.js <test-type>

Available test types:
${Object.keys(testTypes).map(type => `  • ${type}`).join('\n')}

Examples:
  node tests/run-tests.js unit
  node tests/run-tests.js e2e
  node tests/run-tests.js accessibility
  node tests/run-tests.js all
`);
    process.exit(1);
  }

  if (!testTypes[testType]) {
    console.error(`❌ Unknown test type: ${testType}`);
    console.log(`Available types: ${Object.keys(testTypes).join(', ')}`);
    process.exit(1);
  }

  try {
    console.log(`🧪 Starting ${testType} tests for AWS EOL Dashboard`);
    await runCommand(testTypes[testType]);
    console.log(`🎉 ${testType} tests completed successfully!`);
  } catch (error) {
    console.error(`💥 ${testType} tests failed:`, error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runCommand, testTypes };
