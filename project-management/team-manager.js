#!/usr/bin/env node

/**
 * Team Manager - Manage team members and task assignments
 * Provides team creation, member management, and workload analysis
 */

const fs = require('fs');
const path = require('path');

class TeamManager {
  constructor() {
    this.tasksFile = path.join(__dirname, 'tasks.json');
    this.teamFile = path.join(__dirname, 'team.json');
    this.data = this.loadData();
  }

  loadData() {
    const tasksData = this.loadTasks();
    const teamData = this.loadTeam();
    return { tasks: tasksData, team: teamData };
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

  loadTeam() {
    try {
      const content = fs.readFileSync(this.teamFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      // Create default team structure if file doesn't exist
      const defaultTeam = {
        members: [],
        roles: [
          { id: 'developer', name: 'Developer', skills: ['coding', 'debugging', 'testing'] },
          { id: 'designer', name: 'Designer', skills: ['ui', 'ux', 'graphics'] },
          { id: 'pm', name: 'Project Manager', skills: ['planning', 'coordination', 'communication'] },
          { id: 'qa', name: 'QA Engineer', skills: ['testing', 'automation', 'documentation'] },
          { id: 'devops', name: 'DevOps Engineer', skills: ['deployment', 'infrastructure', 'monitoring'] }
        ],
        metadata: {
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      };
      this.saveTeam(defaultTeam);
      return defaultTeam;
    }
  }

  saveTeam(data) {
    data.metadata.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.teamFile, JSON.stringify(data, null, 2));
  }

  addMember(name, email, role, skills = []) {
    const member = {
      id: `member-${Date.now()}`,
      name,
      email,
      role,
      skills,
      joinedDate: new Date().toISOString(),
      status: 'active',
      assignedTasks: [],
      capacity: 40, // Default weekly hours
      availability: 100 // Percentage
    };

    this.data.team.members.push(member);
    this.saveTeam(this.data.team);
    
    console.log(`✅ Team member added: ${member.name} (${member.id})`);
    return member;
  }

  updateMember(memberId, updates) {
    const memberIndex = this.data.team.members.findIndex(m => m.id === memberId);
    
    if (memberIndex === -1) {
      console.error(`Member not found: ${memberId}`);
      return null;
    }

    const member = this.data.team.members[memberIndex];
    Object.assign(member, updates);
    
    this.saveTeam(this.data.team);
    console.log(`✅ Member updated: ${memberId}`);
    return member;
  }

  listMembers(filter = 'all') {
    let members = this.data.team.members;
    
    // Apply filter
    switch (filter) {
      case 'active':
        members = members.filter(m => m.status === 'active');
        break;
      case 'inactive':
        members = members.filter(m => m.status === 'inactive');
        break;
    }

    console.log(`\n👥 Team Members (${filter})\n`);
    
    if (members.length === 0) {
      console.log('No team members found.');
      return;
    }

    members.forEach(member => {
      const workload = this.calculateWorkload(member);
      const statusIcon = member.status === 'active' ? '🟢' : '🔴';
      const workloadIcon = workload > 100 ? '🔴' : workload > 80 ? '🟡' : '🟢';
      
      console.log(`${statusIcon} ${member.name} - ${member.role}`);
      console.log(`   Email: ${member.email}`);
      console.log(`   Skills: ${member.skills.join(', ')}`);
      console.log(`   ${workloadIcon} Workload: ${workload}% (${member.assignedTasks.length} tasks)`);
      console.log(`   Availability: ${member.availability}%`);
      console.log('');
    });
  }

  calculateWorkload(member) {
    const assignedTasks = this.data.tasks.tasks.filter(task => 
      member.assignedTasks.includes(task.id) && 
      ['in_progress', 'pending', 'review'].includes(task.status)
    );
    
    const totalHours = assignedTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const availableHours = (member.capacity * member.availability) / 100;
    
    return availableHours > 0 ? Math.round((totalHours / availableHours) * 100) : 0;
  }

  assignTask(memberId, taskId) {
    const member = this.data.team.members.find(m => m.id === memberId);
    
    if (!member) {
      console.error(`Member not found: ${memberId}`);
      return;
    }

    const task = this.data.tasks.tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.error(`Task not found: ${taskId}`);
      return;
    }

    // Check workload before assigning
    const currentWorkload = this.calculateWorkload(member);
    if (currentWorkload > 100) {
      console.warn(`⚠️ Warning: ${member.name} is already overloaded (${currentWorkload}%)`);
    }

    if (!member.assignedTasks.includes(taskId)) {
      member.assignedTasks.push(taskId);
      
      // Update task assignee
      task.assignee = memberId;
      
      // Save both team and tasks data
      this.saveTeam(this.data.team);
      fs.writeFileSync(this.tasksFile, JSON.stringify(this.data.tasks, null, 2));
      
      console.log(`✅ Task ${taskId} assigned to ${member.name}`);
    } else {
      console.log(`Task ${taskId} is already assigned to ${member.name}`);
    }
  }

  unassignTask(memberId, taskId) {
    const member = this.data.team.members.find(m => m.id === memberId);
    
    if (!member) {
      console.error(`Member not found: ${memberId}`);
      return;
    }

    const index = member.assignedTasks.indexOf(taskId);
    if (index > -1) {
      member.assignedTasks.splice(index, 1);
      
      // Update task assignee
      const task = this.data.tasks.tasks.find(t => t.id === taskId);
      if (task && task.assignee === memberId) {
        delete task.assignee;
      }
      
      // Save both team and tasks data
      this.saveTeam(this.data.team);
      fs.writeFileSync(this.tasksFile, JSON.stringify(this.data.tasks, null, 2));
      
      console.log(`✅ Task ${taskId} unassigned from ${member.name}`);
    } else {
      console.log(`Task ${taskId} is not assigned to ${member.name}`);
    }
  }

  showMemberDetails(memberId) {
    const member = this.data.team.members.find(m => m.id === memberId);
    
    if (!member) {
      console.error(`Member not found: ${memberId}`);
      return;
    }

    const workload = this.calculateWorkload(member);
    const statusIcon = member.status === 'active' ? '🟢' : '🔴';
    
    console.log(`\n👤 Member Details\n`);
    console.log(`Name: ${member.name}`);
    console.log(`ID: ${member.id}`);
    console.log(`Email: ${member.email}`);
    console.log(`Role: ${member.role}`);
    console.log(`Status: ${statusIcon} ${member.status}`);
    console.log(`Skills: ${member.skills.join(', ')}`);
    console.log(`Joined: ${new Date(member.joinedDate).toLocaleDateString()}`);
    console.log(`Capacity: ${member.capacity} hours/week`);
    console.log(`Availability: ${member.availability}%`);
    console.log(`Workload: ${workload}%`);
    
    console.log(`\n📋 Assigned Tasks (${member.assignedTasks.length}):`);
    
    if (member.assignedTasks.length > 0) {
      const tasks = this.data.tasks.tasks.filter(task => member.assignedTasks.includes(task.id));
      tasks.forEach(task => {
        const statusIcon = task.status === 'completed' ? '✅' : 
                          task.status === 'in_progress' ? '🔄' : 
                          task.status === 'blocked' ? '🚫' : '⏳';
        const hours = task.estimatedHours ? ` (${task.estimatedHours}h)` : '';
        console.log(`  ${statusIcon} ${task.id}: ${task.title}${hours} - ${task.status}`);
      });
    } else {
      console.log('  No tasks assigned');
    }
  }

  analyzeWorkload() {
    const activeMembers = this.data.team.members.filter(m => m.status === 'active');
    
    console.log(`\n📊 Workload Analysis\n`);
    
    if (activeMembers.length === 0) {
      console.log('No active team members found.');
      return;
    }

    // Overall team statistics
    const totalCapacity = activeMembers.reduce((sum, m) => sum + (m.capacity * m.availability / 100), 0);
    const totalAssignedHours = activeMembers.reduce((sum, member) => {
      const tasks = this.data.tasks.tasks.filter(task => 
        member.assignedTasks.includes(task.id) && 
        ['in_progress', 'pending', 'review'].includes(task.status)
      );
      return sum + tasks.reduce((taskSum, task) => taskSum + (task.estimatedHours || 0), 0);
    }, 0);
    
    console.log(`Team Capacity: ${totalCapacity} hours/week`);
    console.log(`Assigned Work: ${totalAssignedHours} hours`);
    console.log(`Overall Utilization: ${Math.round((totalAssignedHours / totalCapacity) * 100)}%`);
    
    // Individual workload
    console.log(`\n👥 Individual Workload:`);
    
    const workloadData = activeMembers.map(member => ({
      member,
      workload: this.calculateWorkload(member),
      tasks: member.assignedTasks.length,
      hours: this.data.tasks.tasks
        .filter(task => member.assignedTasks.includes(task.id) && 
                       ['in_progress', 'pending', 'review'].includes(task.status))
        .reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
    }));
    
    // Sort by workload
    workloadData.sort((a, b) => b.workload - a.workload);
    
    workloadData.forEach(({ member, workload, tasks, hours }) => {
      const icon = workload > 100 ? '🔴' : workload > 80 ? '🟡' : '🟢';
      console.log(`  ${icon} ${member.name}: ${workload}% (${tasks} tasks, ${hours}h)`);
    });
    
    // Recommendations
    console.log(`\n💡 Recommendations:`);
    
    const overloaded = workloadData.filter(d => d.workload > 100);
    const underutilized = workloadData.filter(d => d.workload < 50);
    
    if (overloaded.length > 0) {
      console.log(`  • Redistribute tasks from overloaded members:`);
      overloaded.forEach(({ member }) => {
        console.log(`    - ${member.name} (${this.calculateWorkload(member)}%)`);
      });
    }
    
    if (underutilized.length > 0) {
      console.log(`  • Consider assigning more tasks to:`);
      underutilized.forEach(({ member }) => {
        console.log(`    - ${member.name} (${this.calculateWorkload(member)}%)`);
      });
    }
    
    // Unassigned tasks
    const unassignedTasks = this.data.tasks.tasks.filter(task => 
      !task.assignee && ['pending', 'in_progress'].includes(task.status)
    );
    
    if (unassignedTasks.length > 0) {
      console.log(`  • Assign ${unassignedTasks.length} unassigned task(s)`);
    }
  }

  findBestMember(taskId) {
    const task = this.data.tasks.tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.error(`Task not found: ${taskId}`);
      return;
    }

    const activeMembers = this.data.team.members.filter(m => m.status === 'active');
    
    console.log(`\n🔍 Finding best member for task: ${task.title}\n`);
    
    // Score members based on availability and skills
    const scores = activeMembers.map(member => {
      let score = 0;
      
      // Availability score (lower workload = higher score)
      const workload = this.calculateWorkload(member);
      score += (100 - workload);
      
      // Skill match score
      if (task.requiredSkills) {
        const matchingSkills = task.requiredSkills.filter(skill => 
          member.skills.includes(skill)
        );
        score += matchingSkills.length * 20;
      }
      
      // Role match score
      if (task.preferredRole && member.role === task.preferredRole) {
        score += 30;
      }
      
      return { member, score, workload };
    });
    
    // Sort by score
    scores.sort((a, b) => b.score - a.score);
    
    console.log(`Recommendations (sorted by suitability):`);
    scores.slice(0, 5).forEach(({ member, score, workload }, index) => {
      const workloadIcon = workload > 100 ? '🔴' : workload > 80 ? '🟡' : '🟢';
      console.log(`  ${index + 1}. ${member.name} (${member.role})`);
      console.log(`     Score: ${score} | ${workloadIcon} Workload: ${workload}%`);
      console.log(`     Skills: ${member.skills.join(', ')}`);
    });
  }

  showHelp() {
    console.log(`
👥 Team Manager - Team and Assignment Management

Usage: node team-manager.js <command> [options]

Commands:
  add <name> <email> <role>           Add a new team member
  update <member-id> <field> <value>  Update member details
  list [filter]                       List team members (all/active/inactive)
  details <member-id>                 Show detailed member information
  assign <member-id> <task-id>        Assign a task to a member
  unassign <member-id> <task-id>      Remove task assignment
  workload                            Analyze team workload
  find-member <task-id>               Find best member for a task
  set-capacity <member-id> <hours>    Set member's weekly capacity
  set-availability <member-id> <%>    Set member's availability percentage
  deactivate <member-id>              Mark member as inactive
  activate <member-id>                Mark member as active
  help                                Show this help message

Examples:
  node team-manager.js add "John Doe" "john@example.com" "developer"
  node team-manager.js list active
  node team-manager.js assign member-123456789 task-001
  node team-manager.js workload
  node team-manager.js find-member task-002
`);
  }
}

// CLI Interface
function main() {
  const manager = new TeamManager();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    manager.showHelp();
    return;
  }

  const command = args[0];
  
  switch (command) {
    case 'add':
      if (args.length < 4) {
        console.error('Usage: add <name> <email> <role>');
        return;
      }
      manager.addMember(args[1], args[2], args[3]);
      break;
      
    case 'update':
      if (args.length < 4) {
        console.error('Usage: update <member-id> <field> <value>');
        return;
      }
      manager.updateMember(args[1], { [args[2]]: args[3] });
      break;
      
    case 'list':
      manager.listMembers(args[1] || 'all');
      break;
      
    case 'details':
      if (args.length < 2) {
        console.error('Usage: details <member-id>');
        return;
      }
      manager.showMemberDetails(args[1]);
      break;
      
    case 'assign':
      if (args.length < 3) {
        console.error('Usage: assign <member-id> <task-id>');
        return;
      }
      manager.assignTask(args[1], args[2]);
      break;
      
    case 'unassign':
      if (args.length < 3) {
        console.error('Usage: unassign <member-id> <task-id>');
        return;
      }
      manager.unassignTask(args[1], args[2]);
      break;
      
    case 'workload':
      manager.analyzeWorkload();
      break;
      
    case 'find-member':
      if (args.length < 2) {
        console.error('Usage: find-member <task-id>');
        return;
      }
      manager.findBestMember(args[1]);
      break;
      
    case 'set-capacity':
      if (args.length < 3) {
        console.error('Usage: set-capacity <member-id> <hours>');
        return;
      }
      manager.updateMember(args[1], { capacity: parseInt(args[2]) });
      break;
      
    case 'set-availability':
      if (args.length < 3) {
        console.error('Usage: set-availability <member-id> <%>');
        return;
      }
      manager.updateMember(args[1], { availability: parseInt(args[2]) });
      break;
      
    case 'deactivate':
      if (args.length < 2) {
        console.error('Usage: deactivate <member-id>');
        return;
      }
      manager.updateMember(args[1], { status: 'inactive' });
      break;
      
    case 'activate':
      if (args.length < 2) {
        console.error('Usage: activate <member-id>');
        return;
      }
      manager.updateMember(args[1], { status: 'active' });
      break;
      
    case 'help':
    default:
      manager.showHelp();
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = TeamManager;