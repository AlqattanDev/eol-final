#!/usr/bin/env node

/**
 * VS Code Integration Test Script
 * Tests the VS Code configuration and integration setup
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  '.vscode/settings.json',
  '.vscode/extensions.json',
  '.vscode/tasks.json',
  '.vscode/launch.json',
  '.vscode/snippets.code-snippets',
  '.prettierrc',
  '.prettierignore',
  'aws-eol-dashboard.code-workspace'
];

const requiredExtensions = [
  'esbenp.prettier-vscode',
  'dbaeumer.vscode-eslint',
  'bradlc.vscode-tailwindcss',
  'dsznajder.es7-react-js-snippets',
  'ms-playwright.playwright'
];

function testFileExists(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${filePath}`);
  return exists;
}

function testJsonFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    JSON.parse(content);
    console.log(`✅ ${filePath} - Valid JSON`);
    return true;
  } catch (error) {
    console.log(`❌ ${filePath} - Invalid JSON: ${error.message}`);
    return false;
  }
}

function testExtensionsFile() {
  try {
    const extensionsPath = path.join(process.cwd(), '.vscode/extensions.json');
    const content = JSON.parse(fs.readFileSync(extensionsPath, 'utf8'));
    
    let allFound = true;
    console.log('\n📦 Checking recommended extensions:');
    
    requiredExtensions.forEach(ext => {
      const found = content.recommendations && content.recommendations.includes(ext);
      console.log(`${found ? '✅' : '❌'} ${ext}`);
      if (!found) allFound = false;
    });
    
    return allFound;
  } catch (error) {
    console.log(`❌ Error checking extensions: ${error.message}`);
    return false;
  }
}

function testTasksFile() {
  try {
    const tasksPath = path.join(process.cwd(), '.vscode/tasks.json');
    const content = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
    
    const requiredTasks = [
      'Start Development Server',
      'Build Production',
      'Run Unit Tests',
      'Run E2E Tests',
      'Lint Code',
      'Format Code'
    ];
    
    let allFound = true;
    console.log('\n🔧 Checking VS Code tasks:');
    
    requiredTasks.forEach(taskName => {
      const found = content.tasks && content.tasks.some(task => task.label === taskName);
      console.log(`${found ? '✅' : '❌'} ${taskName}`);
      if (!found) allFound = false;
    });
    
    return allFound;
  } catch (error) {
    console.log(`❌ Error checking tasks: ${error.message}`);
    return false;
  }
}

function testLaunchConfigurations() {
  try {
    const launchPath = path.join(process.cwd(), '.vscode/launch.json');
    const content = JSON.parse(fs.readFileSync(launchPath, 'utf8'));
    
    const requiredConfigs = [
      'Debug React App',
      'Debug React App in Chrome',
      'Debug Jest Tests',
      'Debug Playwright Tests'
    ];
    
    let allFound = true;
    console.log('\n🐛 Checking debug configurations:');
    
    requiredConfigs.forEach(configName => {
      const found = content.configurations && content.configurations.some(config => config.name === configName);
      console.log(`${found ? '✅' : '❌'} ${configName}`);
      if (!found) allFound = false;
    });
    
    return allFound;
  } catch (error) {
    console.log(`❌ Error checking launch configurations: ${error.message}`);
    return false;
  }
}

function testSnippets() {
  try {
    const snippetsPath = path.join(process.cwd(), '.vscode/snippets.code-snippets');
    const content = JSON.parse(fs.readFileSync(snippetsPath, 'utf8'));
    
    const requiredSnippets = [
      'React Functional Component',
      'React Hook useState',
      'React Hook useEffect',
      'Playwright Test',
      'Jest Test'
    ];
    
    let allFound = true;
    console.log('\n📝 Checking code snippets:');
    
    requiredSnippets.forEach(snippetName => {
      const found = content[snippetName] !== undefined;
      console.log(`${found ? '✅' : '❌'} ${snippetName}`);
      if (!found) allFound = false;
    });
    
    return allFound;
  } catch (error) {
    console.log(`❌ Error checking snippets: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🔍 Testing VS Code Integration Setup\n');
  
  console.log('📁 Checking required files:');
  const filesExist = requiredFiles.every(testFileExists);
  
  console.log('\n🔧 Validating JSON files:');
  const jsonValid = requiredFiles
    .filter(file => file.endsWith('.json'))
    .every(testJsonFile);
  
  const extensionsValid = testExtensionsFile();
  const tasksValid = testTasksFile();
  const launchValid = testLaunchConfigurations();
  const snippetsValid = testSnippets();
  
  console.log('\n📊 Summary:');
  console.log(`Files exist: ${filesExist ? '✅' : '❌'}`);
  console.log(`JSON valid: ${jsonValid ? '✅' : '❌'}`);
  console.log(`Extensions: ${extensionsValid ? '✅' : '❌'}`);
  console.log(`Tasks: ${tasksValid ? '✅' : '❌'}`);
  console.log(`Launch configs: ${launchValid ? '✅' : '❌'}`);
  console.log(`Snippets: ${snippetsValid ? '✅' : '❌'}`);
  
  const allPassed = filesExist && jsonValid && extensionsValid && tasksValid && launchValid && snippetsValid;
  
  console.log(`\n${allPassed ? '🎉' : '💥'} VS Code Integration: ${allPassed ? 'PASSED' : 'FAILED'}`);
  
  if (allPassed) {
    console.log('\n✨ VS Code integration is properly configured!');
    console.log('💡 To get started:');
    console.log('   1. Open the workspace: code aws-eol-dashboard.code-workspace');
    console.log('   2. Install recommended extensions when prompted');
    console.log('   3. Use Ctrl+Shift+P to access tasks and debug configurations');
    console.log('   4. Use code snippets by typing prefixes like "rfc", "us", "pwtest"');
  }
  
  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { testFileExists, testJsonFile, testExtensionsFile, testTasksFile };
