#!/usr/bin/env node

/**
 * Shrimp Task Manager - Inspired Project Management CLI
 * Provides comprehensive task management capabilities for the AWS EOL Dashboard project
 */

const fs = require('fs');
const path = require('path');

class TaskManager {
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

  saveTasks() {
    try {
      fs.writeFileSync(this.tasksFile, JSON.stringify(this.data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving tasks:', error.message);
      return false;
    }
  }

  generateTaskId() {
    const existingIds = this.data.tasks.map(task => task.id);
    let counter = 1;
    let newId;
    
    do {
      newId = `TASK-${counter.toString().padStart(3, '0')}`;
      counter++;
    } while (existingIds.includes(newId));
    
    return newId;
  }

  listTasks(filter = {}) {
    let tasks = this.data.tasks;
    
    // Apply filters
    if (filter.status) {
      tasks = tasks.filter(task => task.status === filter.status);
    }
    if (filter.priority) {
      tasks = tasks.filter(task => task.priority === filter.priority);
    }
    if (filter.category) {
      tasks = tasks.filter(task => task.category === filter.category);
    }
    if (filter.assignee) {
      tasks = tasks.filter(task => task.assignee.toLowerCase().includes(filter.assignee.toLowerCase()));
    }

    console.log('\n📋 Task List\n');
    
    if (tasks.length === 0) {
      console.log('No tasks found matching the criteria.');
      return;
    }

    tasks.forEach(task => {
      const statusIcon = this.getStatusIcon(task.status);
      const priorityIcon = this.getPriorityIcon(task.priority);
      
      console.log(`${statusIcon} ${priorityIcon} ${task.id}: ${task.title}`);
      console.log(`   Category: ${task.category} | Assignee: ${task.assignee}`);
      console.log(`   Status: ${task.status} | Priority: ${task.priority}`);
      
      if (task.dependencies && task.dependencies.length > 0) {
        console.log(`   Dependencies: ${task.dependencies.join(', ')}`);
      }
      
      if (task.tags && task.tags.length > 0) {
        console.log(`   Tags: ${task.tags.join(', ')}`);
      }
      
      console.log('');
    });
  }

  getStatusIcon(status) {
    const icons = {
      pending: '⏳',
      in_progress: '🔄',
      blocked: '🚫',
      review: '👀',
      testing: '🧪',
      completed: '✅',
      cancelled: '❌'
    };
    return icons[status] || '❓';
  }

  getPriorityIcon(priority) {
    const icons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    };
    return icons[priority] || '⚪';
  }

  showTaskDetails(taskId) {
    const task = this.data.tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.log(`❌ Task ${taskId} not found.`);
      return;
    }

    console.log(`\n📝 Task Details: ${task.id}\n`);
    console.log(`Title: ${task.title}`);
    console.log(`Description: ${task.description}`);
    console.log(`Category: ${task.category}`);
    console.log(`Priority: ${task.priority}`);
    console.log(`Status: ${task.status}`);
    console.log(`Assignee: ${task.assignee}`);
    console.log(`Created: ${new Date(task.created).toLocaleDateString()}`);
    
    if (task.updated) {
      console.log(`Updated: ${new Date(task.updated).toLocaleDateString()}`);
    }
    
    if (task.completed) {
      console.log(`Completed: ${new Date(task.completed).toLocaleDateString()}`);
    }
    
    console.log(`Estimated Hours: ${task.estimatedHours || 'Not set'}`);
    
    if (task.actualHours) {
      console.log(`Actual Hours: ${task.actualHours}`);
    }
    
    if (task.dependencies && task.dependencies.length > 0) {
      console.log(`Dependencies: ${task.dependencies.join(', ')}`);
    }
    
    if (task.tags && task.tags.length > 0) {
      console.log(`Tags: ${task.tags.join(', ')}`);
    }
    
    if (task.notes) {
      console.log(`Notes: ${task.notes}`);
    }
  }

  createTask(taskData) {
    const newTask = {
      id: this.generateTaskId(),
      title: taskData.title,
      description: taskData.description || '',
      category: taskData.category || 'development',
      priority: taskData.priority || 'medium',
      status: 'pending',
      assignee: taskData.assignee || 'Unassigned',
      created: new Date().toISOString(),
      estimatedHours: taskData.estimatedHours || null,
      dependencies: taskData.dependencies || [],
      tags: taskData.tags || [],
      notes: taskData.notes || ''
    };

    this.data.tasks.push(newTask);
    
    if (this.saveTasks()) {
      console.log(`✅ Task ${newTask.id} created successfully.`);
      this.showTaskDetails(newTask.id);
    } else {
      console.log('❌ Failed to save task.');
    }
  }

  updateTask(taskId, updates) {
    const taskIndex = this.data.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      console.log(`❌ Task ${taskId} not found.`);
      return;
    }

    const task = this.data.tasks[taskIndex];
    
    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        task[key] = updates[key];
      }
    });
    
    task.updated = new Date().toISOString();
    
    // Set completion date if status is completed
    if (updates.status === 'completed' && !task.completed) {
      task.completed = new Date().toISOString();
    }

    if (this.saveTasks()) {
      console.log(`✅ Task ${taskId} updated successfully.`);
      this.showTaskDetails(taskId);
    } else {
      console.log('❌ Failed to save task updates.');
    }
  }

  deleteTask(taskId) {
    const taskIndex = this.data.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      console.log(`❌ Task ${taskId} not found.`);
      return;
    }

    const task = this.data.tasks[taskIndex];
    this.data.tasks.splice(taskIndex, 1);

    if (this.saveTasks()) {
      console.log(`✅ Task ${taskId} "${task.title}" deleted successfully.`);
    } else {
      console.log('❌ Failed to delete task.');
    }
  }

  showProjectSummary() {
    const tasks = this.data.tasks;
    const statusCounts = {};
    const priorityCounts = {};
    const categoryCounts = {};

    // Count tasks by status, priority, and category
    tasks.forEach(task => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
      priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
      categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
    });

    console.log('\n📊 Project Summary\n');
    console.log(`Project: ${this.data.projectInfo.name}`);
    console.log(`Description: ${this.data.projectInfo.description}`);
    console.log(`Total Tasks: ${tasks.length}`);
    
    console.log('\n📈 Status Breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      const icon = this.getStatusIcon(status);
      console.log(`  ${icon} ${status}: ${count}`);
    });
    
    console.log('\n🎯 Priority Breakdown:');
    Object.entries(priorityCounts).forEach(([priority, count]) => {
      const icon = this.getPriorityIcon(priority);
      console.log(`  ${icon} ${priority}: ${count}`);
    });
    
    console.log('\n📂 Category Breakdown:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  📁 ${category}: ${count}`);
    });

    // Calculate progress
    const completedTasks = statusCounts.completed || 0;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    console.log(`\n🎯 Overall Progress: ${progress}% (${completedTasks}/${tasks.length} completed)`);
  }

  showDependencyGraph() {
    console.log('\n🔗 Task Dependencies\n');
    
    this.data.tasks.forEach(task => {
      if (task.dependencies && task.dependencies.length > 0) {
        console.log(`${task.id}: ${task.title}`);
        task.dependencies.forEach(dep => {
          const depTask = this.data.tasks.find(t => t.id === dep);
          const status = depTask ? depTask.status : 'not found';
          const icon = this.getStatusIcon(status);
          console.log(`  ↳ ${icon} ${dep} (${status})`);
        });
        console.log('');
      }
    });
  }

  showHelp() {
    console.log(`
🦐 Shrimp Task Manager - AWS EOL Dashboard Project

Usage: node task-manager.js <command> [options]

Commands:
  list [filter]           List all tasks (optional filters: status, priority, category, assignee)
  show <task-id>          Show detailed information about a task
  create                  Create a new task (interactive)
  update <task-id>        Update a task (interactive)
  delete <task-id>        Delete a task
  summary                 Show project summary and statistics
  dependencies            Show task dependency graph
  help                    Show this help message

Examples:
  node task-manager.js list
  node task-manager.js list status=pending
  node task-manager.js list priority=high
  node task-manager.js show TASK-001
  node task-manager.js summary
  node task-manager.js dependencies

Filter options for list command:
  status=<status>         Filter by status (pending, in_progress, blocked, review, testing, completed, cancelled)
  priority=<priority>     Filter by priority (critical, high, medium, low)
  category=<category>     Filter by category (development, testing, documentation, deployment, maintenance, feature, bugfix, research)
  assignee=<name>         Filter by assignee name (partial match)
`);
  }
}

// CLI Interface
function main() {
  const taskManager = new TaskManager();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    taskManager.showHelp();
    return;
  }

  const command = args[0];
  
  switch (command) {
    case 'list':
      const filter = {};
      args.slice(1).forEach(arg => {
        const [key, value] = arg.split('=');
        if (key && value) {
          filter[key] = value;
        }
      });
      taskManager.listTasks(filter);
      break;
      
    case 'show':
      if (args[1]) {
        taskManager.showTaskDetails(args[1]);
      } else {
        console.log('❌ Please provide a task ID.');
      }
      break;
      
    case 'summary':
      taskManager.showProjectSummary();
      break;
      
    case 'dependencies':
      taskManager.showDependencyGraph();
      break;
      
    case 'help':
    default:
      taskManager.showHelp();
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = TaskManager;
