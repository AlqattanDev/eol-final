#!/usr/bin/env node

/**
 * Project Planner - Advanced project analysis and planning tool
 * Provides project insights, timeline analysis, and resource planning
 */

const fs = require('fs');
const path = require('path');

class ProjectPlanner {
  constructor() {
    this.tasksFile = path.join(__dirname, 'tasks.json');
    this.data = this.loadTasks();
  }

  loadTasks() {
    try {
      const content = fs.readFileSync(this.tasksFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error loading tasks:', error.message);
      return { tasks: [], projectInfo: {}, taskCategories: {}, priorities: {}, statuses: {} };
    }
  }

  analyzeProjectHealth() {
    const tasks = this.data.tasks;
    const totalTasks = tasks.length;
    
    if (totalTasks === 0) {
      console.log('No tasks found for analysis.');
      return;
    }

    // Status analysis
    const statusCounts = {};
    tasks.forEach(task => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    });

    const completedTasks = statusCounts.completed || 0;
    const inProgressTasks = statusCounts.in_progress || 0;
    const blockedTasks = statusCounts.blocked || 0;
    const pendingTasks = statusCounts.pending || 0;

    // Calculate health metrics
    const completionRate = Math.round((completedTasks / totalTasks) * 100);
    const blockedRate = Math.round((blockedTasks / totalTasks) * 100);
    const activeRate = Math.round((inProgressTasks / totalTasks) * 100);

    console.log('\n🏥 Project Health Analysis\n');
    
    // Overall health score
    let healthScore = 100;
    healthScore -= blockedRate * 2; // Blocked tasks heavily impact health
    healthScore += completionRate * 0.5; // Completed tasks improve health
    healthScore = Math.max(0, Math.min(100, healthScore));

    const healthIcon = healthScore >= 80 ? '🟢' : healthScore >= 60 ? '🟡' : '🔴';
    console.log(`${healthIcon} Overall Health Score: ${healthScore}/100`);
    
    console.log(`\n📊 Key Metrics:`);
    console.log(`  ✅ Completion Rate: ${completionRate}% (${completedTasks}/${totalTasks})`);
    console.log(`  🔄 Active Tasks: ${activeRate}% (${inProgressTasks}/${totalTasks})`);
    console.log(`  🚫 Blocked Tasks: ${blockedRate}% (${blockedTasks}/${totalTasks})`);
    console.log(`  ⏳ Pending Tasks: ${Math.round((pendingTasks / totalTasks) * 100)}% (${pendingTasks}/${totalTasks})`);

    // Risk assessment
    console.log(`\n⚠️ Risk Assessment:`);
    if (blockedRate > 20) {
      console.log(`  🔴 HIGH RISK: ${blockedRate}% of tasks are blocked`);
    } else if (blockedRate > 10) {
      console.log(`  🟡 MEDIUM RISK: ${blockedRate}% of tasks are blocked`);
    } else {
      console.log(`  🟢 LOW RISK: Only ${blockedRate}% of tasks are blocked`);
    }

    if (activeRate < 20 && pendingTasks > 5) {
      console.log(`  🟡 ATTENTION: Low active task rate with many pending tasks`);
    }

    // Recommendations
    console.log(`\n💡 Recommendations:`);
    if (blockedTasks > 0) {
      console.log(`  • Review and resolve ${blockedTasks} blocked task(s)`);
    }
    if (pendingTasks > inProgressTasks * 2) {
      console.log(`  • Consider starting more pending tasks to maintain momentum`);
    }
    if (completionRate < 30) {
      console.log(`  • Focus on completing in-progress tasks before starting new ones`);
    }
  }

  analyzeTimeline() {
    const tasks = this.data.tasks.filter(task => task.estimatedHours);
    
    if (tasks.length === 0) {
      console.log('No tasks with time estimates found.');
      return;
    }

    console.log('\n⏰ Timeline Analysis\n');

    // Calculate total estimated vs actual hours
    const totalEstimated = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const totalActual = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const completedEstimated = completedTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const completedActual = completedTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

    console.log(`📈 Time Estimates:`);
    console.log(`  Total Estimated: ${totalEstimated} hours`);
    console.log(`  Total Actual (so far): ${totalActual} hours`);
    
    if (completedTasks.length > 0) {
      const estimateAccuracy = Math.round((completedActual / completedEstimated) * 100);
      console.log(`  Estimate Accuracy: ${estimateAccuracy}% (${completedActual}h actual vs ${completedEstimated}h estimated)`);
      
      if (estimateAccuracy > 120) {
        console.log(`  ⚠️ Tasks are taking longer than estimated`);
      } else if (estimateAccuracy < 80) {
        console.log(`  ✅ Tasks are completing faster than estimated`);
      } else {
        console.log(`  ✅ Estimates are reasonably accurate`);
      }
    }

    // Remaining work calculation
    const remainingTasks = tasks.filter(task => task.status !== 'completed' && task.status !== 'cancelled');
    const remainingHours = remainingTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    
    console.log(`\n⏳ Remaining Work:`);
    console.log(`  Remaining Tasks: ${remainingTasks.length}`);
    console.log(`  Remaining Hours: ${remainingHours} hours`);
    console.log(`  Estimated Days (8h/day): ${Math.ceil(remainingHours / 8)} days`);
    console.log(`  Estimated Weeks (40h/week): ${Math.ceil(remainingHours / 40)} weeks`);
  }

  analyzeDependencies() {
    const tasks = this.data.tasks;
    const dependencyMap = new Map();
    const blockedTasks = [];

    console.log('\n🔗 Dependency Analysis\n');

    // Build dependency map
    tasks.forEach(task => {
      if (task.dependencies && task.dependencies.length > 0) {
        dependencyMap.set(task.id, task.dependencies);
        
        // Check for blocked dependencies
        const blockedDeps = task.dependencies.filter(depId => {
          const depTask = tasks.find(t => t.id === depId);
          return depTask && depTask.status !== 'completed';
        });
        
        if (blockedDeps.length > 0 && task.status !== 'completed') {
          blockedTasks.push({
            task: task,
            blockedBy: blockedDeps
          });
        }
      }
    });

    console.log(`📊 Dependency Statistics:`);
    console.log(`  Tasks with dependencies: ${dependencyMap.size}`);
    console.log(`  Tasks blocked by dependencies: ${blockedTasks.length}`);

    if (blockedTasks.length > 0) {
      console.log(`\n🚫 Blocked Tasks:`);
      blockedTasks.forEach(({ task, blockedBy }) => {
        console.log(`  ${task.id}: ${task.title}`);
        blockedBy.forEach(depId => {
          const depTask = tasks.find(t => t.id === depId);
          const status = depTask ? depTask.status : 'not found';
          console.log(`    ↳ Waiting for ${depId} (${status})`);
        });
      });
    }

    // Find critical path
    this.findCriticalPath(tasks, dependencyMap);
  }

  findCriticalPath(tasks, dependencyMap) {
    console.log(`\n🎯 Critical Path Analysis:`);
    
    // Simple critical path calculation based on dependencies and estimated hours
    const taskMap = new Map(tasks.map(task => [task.id, task]));
    const visited = new Set();
    const paths = [];

    function calculatePath(taskId, currentPath = [], currentHours = 0) {
      if (visited.has(taskId)) return;
      
      const task = taskMap.get(taskId);
      if (!task) return;
      
      const newPath = [...currentPath, taskId];
      const newHours = currentHours + (task.estimatedHours || 0);
      
      const dependencies = dependencyMap.get(taskId) || [];
      if (dependencies.length === 0) {
        paths.push({ path: newPath, hours: newHours });
      } else {
        dependencies.forEach(depId => {
          calculatePath(depId, newPath, newHours);
        });
      }
    }

    // Start from tasks with no dependents
    const tasksWithDependents = new Set();
    dependencyMap.forEach(deps => {
      deps.forEach(dep => tasksWithDependents.add(dep));
    });

    const endTasks = tasks.filter(task => !tasksWithDependents.has(task.id));
    endTasks.forEach(task => calculatePath(task.id));

    if (paths.length > 0) {
      const criticalPath = paths.reduce((longest, current) => 
        current.hours > longest.hours ? current : longest
      );
      
      console.log(`  Longest path: ${criticalPath.hours} hours`);
      console.log(`  Critical tasks: ${criticalPath.path.join(' → ')}`);
    } else {
      console.log(`  No clear critical path found`);
    }
  }

  generateReport() {
    console.log('\n📋 Project Status Report\n');
    console.log(`Project: ${this.data.projectInfo.name}`);
    console.log(`Generated: ${new Date().toLocaleDateString()}`);
    console.log('='.repeat(50));

    this.analyzeProjectHealth();
    this.analyzeTimeline();
    this.analyzeDependencies();

    console.log('\n📝 Next Actions:');
    const nextActions = this.getNextActions();
    if (nextActions.length > 0) {
      nextActions.forEach((action, index) => {
        console.log(`  ${index + 1}. ${action}`);
      });
    } else {
      console.log('  No immediate actions required.');
    }
  }

  getNextActions() {
    const tasks = this.data.tasks;
    const actions = [];

    // Find ready-to-start tasks
    const readyTasks = tasks.filter(task => {
      if (task.status !== 'pending') return false;
      
      if (!task.dependencies || task.dependencies.length === 0) return true;
      
      return task.dependencies.every(depId => {
        const depTask = tasks.find(t => t.id === depId);
        return depTask && depTask.status === 'completed';
      });
    });

    if (readyTasks.length > 0) {
      actions.push(`Start ${readyTasks.length} ready task(s): ${readyTasks.slice(0, 3).map(t => t.id).join(', ')}${readyTasks.length > 3 ? '...' : ''}`);
    }

    // Find blocked tasks that need attention
    const blockedTasks = tasks.filter(task => task.status === 'blocked');
    if (blockedTasks.length > 0) {
      actions.push(`Resolve ${blockedTasks.length} blocked task(s)`);
    }

    // Find tasks in review
    const reviewTasks = tasks.filter(task => task.status === 'review');
    if (reviewTasks.length > 0) {
      actions.push(`Review ${reviewTasks.length} task(s) waiting for approval`);
    }

    // Find overdue tasks (if we had due dates)
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
    if (inProgressTasks.length > 5) {
      actions.push(`Focus on completing ${inProgressTasks.length} in-progress tasks`);
    }

    return actions;
  }

  showHelp() {
    console.log(`
📊 Project Planner - Advanced Analysis Tool

Usage: node project-planner.js <command>

Commands:
  health              Analyze project health and risk factors
  timeline            Analyze time estimates and project timeline
  dependencies        Analyze task dependencies and critical path
  report              Generate comprehensive project status report
  help                Show this help message

Examples:
  node project-planner.js health
  node project-planner.js timeline
  node project-planner.js dependencies
  node project-planner.js report
`);
  }
}

// CLI Interface
function main() {
  const planner = new ProjectPlanner();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    planner.showHelp();
    return;
  }

  const command = args[0];
  
  switch (command) {
    case 'health':
      planner.analyzeProjectHealth();
      break;
      
    case 'timeline':
      planner.analyzeTimeline();
      break;
      
    case 'dependencies':
      planner.analyzeDependencies();
      break;
      
    case 'report':
      planner.generateReport();
      break;
      
    case 'help':
    default:
      planner.showHelp();
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = ProjectPlanner;
