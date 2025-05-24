#!/usr/bin/env node

/**
 * Milestone Tracker - Track project milestones and progress
 * Provides milestone creation, tracking, and reporting functionality
 */

const fs = require('fs');
const path = require('path');

class MilestoneTracker {
  constructor() {
    this.tasksFile = path.join(__dirname, 'tasks.json');
    this.milestonesFile = path.join(__dirname, 'milestones.json');
    this.data = this.loadData();
  }

  loadData() {
    const tasksData = this.loadTasks();
    const milestonesData = this.loadMilestones();
    return { tasks: tasksData, milestones: milestonesData };
  }

  loadTasks() {
    try {
      const content = fs.readFileSync(this.tasksFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error loading tasks:', error.message);
      return { tasks: [] };
    }
  }

  loadMilestones() {
    try {
      const content = fs.readFileSync(this.milestonesFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      // Create default milestones structure if file doesn't exist
      const defaultMilestones = {
        milestones: [],
        metadata: {
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      };
      this.saveMilestones(defaultMilestones);
      return defaultMilestones;
    }
  }

  saveMilestones(data) {
    data.metadata.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.milestonesFile, JSON.stringify(data, null, 2));
  }

  createMilestone(name, description, targetDate, taskIds = []) {
    const milestone = {
      id: `milestone-${Date.now()}`,
      name,
      description,
      targetDate,
      createdDate: new Date().toISOString(),
      status: 'active',
      taskIds,
      progress: 0
    };

    this.data.milestones.milestones.push(milestone);
    this.saveMilestones(this.data.milestones);
    
    console.log(`✅ Milestone created: ${milestone.id}`);
    return milestone;
  }

  updateMilestone(milestoneId, updates) {
    const milestoneIndex = this.data.milestones.milestones.findIndex(m => m.id === milestoneId);
    
    if (milestoneIndex === -1) {
      console.error(`Milestone not found: ${milestoneId}`);
      return null;
    }

    const milestone = this.data.milestones.milestones[milestoneIndex];
    Object.assign(milestone, updates);
    
    // Recalculate progress
    milestone.progress = this.calculateProgress(milestone);
    
    this.saveMilestones(this.data.milestones);
    console.log(`✅ Milestone updated: ${milestoneId}`);
    return milestone;
  }

  calculateProgress(milestone) {
    if (!milestone.taskIds || milestone.taskIds.length === 0) return 0;
    
    const tasks = this.data.tasks.tasks.filter(task => milestone.taskIds.includes(task.id));
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    
    return Math.round((completedTasks / tasks.length) * 100);
  }

  listMilestones(filter = 'all') {
    let milestones = this.data.milestones.milestones;
    
    // Apply filter
    switch (filter) {
      case 'active':
        milestones = milestones.filter(m => m.status === 'active');
        break;
      case 'completed':
        milestones = milestones.filter(m => m.status === 'completed');
        break;
      case 'overdue':
        milestones = milestones.filter(m => {
          return m.status === 'active' && new Date(m.targetDate) < new Date();
        });
        break;
    }

    console.log(`\n🎯 Milestones (${filter})\n`);
    
    if (milestones.length === 0) {
      console.log('No milestones found.');
      return;
    }

    milestones.forEach(milestone => {
      const status = this.getMilestoneStatus(milestone);
      const progress = this.calculateProgress(milestone);
      
      console.log(`${status.icon} ${milestone.name} (${milestone.id})`);
      console.log(`   ${milestone.description}`);
      console.log(`   Target: ${new Date(milestone.targetDate).toLocaleDateString()}`);
      console.log(`   Progress: ${this.renderProgressBar(progress)} ${progress}%`);
      console.log(`   Tasks: ${milestone.taskIds.length} assigned`);
      console.log('');
    });
  }

  getMilestoneStatus(milestone) {
    if (milestone.status === 'completed') {
      return { icon: '✅', text: 'Completed' };
    }
    
    const now = new Date();
    const target = new Date(milestone.targetDate);
    const daysRemaining = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      return { icon: '🔴', text: 'Overdue' };
    } else if (daysRemaining <= 7) {
      return { icon: '🟡', text: 'Due Soon' };
    } else {
      return { icon: '🟢', text: 'On Track' };
    }
  }

  renderProgressBar(progress) {
    const width = 20;
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  showMilestoneDetails(milestoneId) {
    const milestone = this.data.milestones.milestones.find(m => m.id === milestoneId);
    
    if (!milestone) {
      console.error(`Milestone not found: ${milestoneId}`);
      return;
    }

    const status = this.getMilestoneStatus(milestone);
    const progress = this.calculateProgress(milestone);
    
    console.log(`\n🎯 Milestone Details\n`);
    console.log(`Name: ${milestone.name}`);
    console.log(`ID: ${milestone.id}`);
    console.log(`Description: ${milestone.description}`);
    console.log(`Status: ${status.icon} ${status.text}`);
    console.log(`Created: ${new Date(milestone.createdDate).toLocaleDateString()}`);
    console.log(`Target: ${new Date(milestone.targetDate).toLocaleDateString()}`);
    console.log(`Progress: ${this.renderProgressBar(progress)} ${progress}%`);
    
    console.log(`\n📋 Associated Tasks (${milestone.taskIds.length}):`);
    
    if (milestone.taskIds.length > 0) {
      const tasks = this.data.tasks.tasks.filter(task => milestone.taskIds.includes(task.id));
      tasks.forEach(task => {
        const statusIcon = task.status === 'completed' ? '✅' : 
                          task.status === 'in_progress' ? '🔄' : 
                          task.status === 'blocked' ? '🚫' : '⏳';
        console.log(`  ${statusIcon} ${task.id}: ${task.title} (${task.status})`);
      });
    } else {
      console.log('  No tasks assigned to this milestone');
    }
  }

  analyzeMilestones() {
    const milestones = this.data.milestones.milestones;
    
    console.log(`\n📊 Milestone Analysis\n`);
    
    if (milestones.length === 0) {
      console.log('No milestones to analyze.');
      return;
    }

    // Calculate statistics
    const activeMilestones = milestones.filter(m => m.status === 'active');
    const completedMilestones = milestones.filter(m => m.status === 'completed');
    const overdueMilestones = activeMilestones.filter(m => new Date(m.targetDate) < new Date());
    
    console.log(`Total Milestones: ${milestones.length}`);
    console.log(`  ✅ Completed: ${completedMilestones.length}`);
    console.log(`  🔄 Active: ${activeMilestones.length}`);
    console.log(`  🔴 Overdue: ${overdueMilestones.length}`);
    
    // Average progress
    const totalProgress = activeMilestones.reduce((sum, m) => sum + this.calculateProgress(m), 0);
    const avgProgress = activeMilestones.length > 0 ? Math.round(totalProgress / activeMilestones.length) : 0;
    console.log(`\nAverage Progress: ${avgProgress}%`);
    
    // Upcoming milestones
    const upcomingMilestones = activeMilestones
      .filter(m => new Date(m.targetDate) > new Date())
      .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
      .slice(0, 3);
    
    if (upcomingMilestones.length > 0) {
      console.log(`\n📅 Upcoming Milestones:`);
      upcomingMilestones.forEach(milestone => {
        const daysUntil = Math.ceil((new Date(milestone.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        console.log(`  • ${milestone.name} - ${daysUntil} days (${this.calculateProgress(milestone)}% complete)`);
      });
    }
    
    // At-risk milestones
    const atRiskMilestones = activeMilestones.filter(m => {
      const daysRemaining = Math.ceil((new Date(m.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
      const progress = this.calculateProgress(m);
      return daysRemaining < 7 && progress < 80;
    });
    
    if (atRiskMilestones.length > 0) {
      console.log(`\n⚠️ At-Risk Milestones:`);
      atRiskMilestones.forEach(milestone => {
        const daysRemaining = Math.ceil((new Date(milestone.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        console.log(`  • ${milestone.name} - ${daysRemaining} days remaining, ${this.calculateProgress(milestone)}% complete`);
      });
    }
  }

  showHelp() {
    console.log(`
🎯 Milestone Tracker - Project Milestone Management

Usage: node milestone-tracker.js <command> [options]

Commands:
  create <name> <description> <target-date>    Create a new milestone
  update <milestone-id> <field> <value>        Update milestone details
  list [filter]                                List milestones (all/active/completed/overdue)
  details <milestone-id>                       Show detailed milestone information
  analyze                                      Analyze milestone statistics
  assign <milestone-id> <task-id>              Assign a task to a milestone
  unassign <milestone-id> <task-id>            Remove a task from a milestone
  complete <milestone-id>                      Mark milestone as completed
  help                                         Show this help message

Examples:
  node milestone-tracker.js create "MVP Release" "First public release" "2024-03-01"
  node milestone-tracker.js list active
  node milestone-tracker.js details milestone-123456789
  node milestone-tracker.js assign milestone-123456789 task-001
  node milestone-tracker.js analyze
`);
  }

  assignTask(milestoneId, taskId) {
    const milestone = this.data.milestones.milestones.find(m => m.id === milestoneId);
    
    if (!milestone) {
      console.error(`Milestone not found: ${milestoneId}`);
      return;
    }

    const task = this.data.tasks.tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.error(`Task not found: ${taskId}`);
      return;
    }

    if (!milestone.taskIds.includes(taskId)) {
      milestone.taskIds.push(taskId);
      milestone.progress = this.calculateProgress(milestone);
      this.saveMilestones(this.data.milestones);
      console.log(`✅ Task ${taskId} assigned to milestone ${milestoneId}`);
    } else {
      console.log(`Task ${taskId} is already assigned to milestone ${milestoneId}`);
    }
  }

  unassignTask(milestoneId, taskId) {
    const milestone = this.data.milestones.milestones.find(m => m.id === milestoneId);
    
    if (!milestone) {
      console.error(`Milestone not found: ${milestoneId}`);
      return;
    }

    const index = milestone.taskIds.indexOf(taskId);
    if (index > -1) {
      milestone.taskIds.splice(index, 1);
      milestone.progress = this.calculateProgress(milestone);
      this.saveMilestones(this.data.milestones);
      console.log(`✅ Task ${taskId} removed from milestone ${milestoneId}`);
    } else {
      console.log(`Task ${taskId} is not assigned to milestone ${milestoneId}`);
    }
  }

  completeMilestone(milestoneId) {
    const milestone = this.data.milestones.milestones.find(m => m.id === milestoneId);
    
    if (!milestone) {
      console.error(`Milestone not found: ${milestoneId}`);
      return;
    }

    milestone.status = 'completed';
    milestone.completedDate = new Date().toISOString();
    milestone.progress = 100;
    
    this.saveMilestones(this.data.milestones);
    console.log(`✅ Milestone ${milestoneId} marked as completed`);
  }
}

// CLI Interface
function main() {
  const tracker = new MilestoneTracker();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    tracker.showHelp();
    return;
  }

  const command = args[0];
  
  switch (command) {
    case 'create':
      if (args.length < 4) {
        console.error('Usage: create <name> <description> <target-date>');
        return;
      }
      tracker.createMilestone(args[1], args[2], args[3]);
      break;
      
    case 'update':
      if (args.length < 4) {
        console.error('Usage: update <milestone-id> <field> <value>');
        return;
      }
      tracker.updateMilestone(args[1], { [args[2]]: args[3] });
      break;
      
    case 'list':
      tracker.listMilestones(args[1] || 'all');
      break;
      
    case 'details':
      if (args.length < 2) {
        console.error('Usage: details <milestone-id>');
        return;
      }
      tracker.showMilestoneDetails(args[1]);
      break;
      
    case 'analyze':
      tracker.analyzeMilestones();
      break;
      
    case 'assign':
      if (args.length < 3) {
        console.error('Usage: assign <milestone-id> <task-id>');
        return;
      }
      tracker.assignTask(args[1], args[2]);
      break;
      
    case 'unassign':
      if (args.length < 3) {
        console.error('Usage: unassign <milestone-id> <task-id>');
        return;
      }
      tracker.unassignTask(args[1], args[2]);
      break;
      
    case 'complete':
      if (args.length < 2) {
        console.error('Usage: complete <milestone-id>');
        return;
      }
      tracker.completeMilestone(args[1]);
      break;
      
    case 'help':
    default:
      tracker.showHelp();
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = MilestoneTracker;