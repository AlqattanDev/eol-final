#!/usr/bin/env node

/**
 * Project Reporter - Generate comprehensive project reports
 * Provides various report formats for project status and analytics
 */

const fs = require('fs');
const path = require('path');

class ProjectReporter {
  constructor() {
    this.projectDir = __dirname;
    this.tasksFile = path.join(this.projectDir, 'tasks.json');
    this.milestonesFile = path.join(this.projectDir, 'milestones.json');
    this.teamFile = path.join(this.projectDir, 'team.json');
    this.reportsDir = path.join(this.projectDir, 'reports');
    this.data = this.loadAllData();
    this.ensureReportsDirectory();
  }

  loadAllData() {
    return {
      tasks: this.loadJSON(this.tasksFile),
      milestones: this.loadJSON(this.milestonesFile),
      team: this.loadJSON(this.teamFile)
    };
  }

  loadJSON(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  generateExecutiveSummary() {
    const report = [];
    const timestamp = new Date().toISOString();
    
    report.push('# Executive Summary Report');
    report.push(`Generated: ${new Date(timestamp).toLocaleString()}`);
    report.push('');
    
    // Project overview
    if (this.data.tasks?.projectInfo) {
      report.push('## Project Overview');
      report.push(`**Name:** ${this.data.tasks.projectInfo.name}`);
      report.push(`**Description:** ${this.data.tasks.projectInfo.description}`);
      report.push(`**Start Date:** ${new Date(this.data.tasks.projectInfo.startDate).toLocaleDateString()}`);
      report.push('');
    }
    
    // Key metrics
    report.push('## Key Metrics');
    
    if (this.data.tasks?.tasks) {
      const tasks = this.data.tasks.tasks;
      const statusCounts = this.getStatusCounts(tasks);
      const completion = Math.round((statusCounts.completed / tasks.length) * 100);
      
      report.push(`- **Total Tasks:** ${tasks.length}`);
      report.push(`- **Completion Rate:** ${completion}%`);
      report.push(`- **In Progress:** ${statusCounts.in_progress}`);
      report.push(`- **Blocked:** ${statusCounts.blocked}`);
      report.push(`- **Pending:** ${statusCounts.pending}`);
    }
    
    // Milestone status
    if (this.data.milestones?.milestones) {
      const milestones = this.data.milestones.milestones;
      const activeMilestones = milestones.filter(m => m.status === 'active');
      const overdueMilestones = activeMilestones.filter(m => new Date(m.targetDate) < new Date());
      
      report.push('');
      report.push('## Milestone Status');
      report.push(`- **Total Milestones:** ${milestones.length}`);
      report.push(`- **Active:** ${activeMilestones.length}`);
      report.push(`- **Overdue:** ${overdueMilestones.length}`);
      
      if (activeMilestones.length > 0) {
        report.push('');
        report.push('### Upcoming Milestones');
        activeMilestones
          .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
          .slice(0, 3)
          .forEach(m => {
            const daysUntil = Math.ceil((new Date(m.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
            report.push(`- **${m.name}** - ${daysUntil} days (${m.progress || 0}% complete)`);
          });
      }
    }
    
    // Team workload
    if (this.data.team?.members) {
      const activeMembers = this.data.team.members.filter(m => m.status === 'active');
      
      report.push('');
      report.push('## Team Status');
      report.push(`- **Active Members:** ${activeMembers.length}`);
      
      if (activeMembers.length > 0) {
        const avgWorkload = Math.round(
          activeMembers.reduce((sum, m) => sum + this.calculateWorkload(m), 0) / activeMembers.length
        );
        report.push(`- **Average Workload:** ${avgWorkload}%`);
        
        const overloaded = activeMembers.filter(m => this.calculateWorkload(m) > 100);
        if (overloaded.length > 0) {
          report.push(`- **⚠️ Overloaded Members:** ${overloaded.length}`);
        }
      }
    }
    
    // Recommendations
    report.push('');
    report.push('## Recommendations');
    const recommendations = this.generateRecommendations();
    recommendations.forEach(rec => report.push(`- ${rec}`));
    
    return report.join('\n');
  }

  generateDetailedReport() {
    const report = [];
    const timestamp = new Date().toISOString();
    
    report.push('# Detailed Project Report');
    report.push(`Generated: ${new Date(timestamp).toLocaleString()}`);
    report.push('');
    
    // Task analysis
    if (this.data.tasks?.tasks) {
      report.push('## Task Analysis');
      const tasks = this.data.tasks.tasks;
      const statusCounts = this.getStatusCounts(tasks);
      
      report.push('### Status Distribution');
      Object.entries(statusCounts).forEach(([status, count]) => {
        const percentage = Math.round((count / tasks.length) * 100);
        report.push(`- ${this.formatStatus(status)}: ${count} (${percentage}%)`);
      });
      
      // Priority breakdown
      const priorityCounts = this.getPriorityCounts(tasks);
      report.push('');
      report.push('### Priority Distribution');
      Object.entries(priorityCounts).forEach(([priority, count]) => {
        const percentage = Math.round((count / tasks.length) * 100);
        report.push(`- ${this.formatPriority(priority)}: ${count} (${percentage}%)`);
      });
      
      // Category breakdown
      report.push('');
      report.push('### Category Distribution');
      const categoryCounts = {};
      tasks.forEach(task => {
        categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
      });
      Object.entries(categoryCounts).forEach(([category, count]) => {
        const percentage = Math.round((count / tasks.length) * 100);
        report.push(`- ${category}: ${count} (${percentage}%)`);
      });
      
      // Time analysis
      const tasksWithTime = tasks.filter(t => t.estimatedHours);
      if (tasksWithTime.length > 0) {
        report.push('');
        report.push('### Time Analysis');
        const totalEstimated = tasksWithTime.reduce((sum, t) => sum + t.estimatedHours, 0);
        const totalActual = tasksWithTime.reduce((sum, t) => sum + (t.actualHours || 0), 0);
        const completedWithTime = tasksWithTime.filter(t => t.status === 'completed' && t.actualHours);
        
        report.push(`- Total Estimated Hours: ${totalEstimated}`);
        report.push(`- Total Actual Hours: ${totalActual}`);
        
        if (completedWithTime.length > 0) {
          const avgAccuracy = Math.round(
            (completedWithTime.reduce((sum, t) => sum + (t.actualHours / t.estimatedHours), 0) / 
             completedWithTime.length) * 100
          );
          report.push(`- Estimate Accuracy: ${avgAccuracy}%`);
        }
      }
    }
    
    // Team performance
    if (this.data.team?.members && this.data.tasks?.tasks) {
      report.push('');
      report.push('## Team Performance');
      
      const activeMembers = this.data.team.members.filter(m => m.status === 'active');
      activeMembers.forEach(member => {
        const completedTasks = this.data.tasks.tasks.filter(
          t => member.assignedTasks.includes(t.id) && t.status === 'completed'
        ).length;
        const activeTasks = this.data.tasks.tasks.filter(
          t => member.assignedTasks.includes(t.id) && t.status === 'in_progress'
        ).length;
        
        report.push('');
        report.push(`### ${member.name} (${member.role})`);
        report.push(`- Completed Tasks: ${completedTasks}`);
        report.push(`- Active Tasks: ${activeTasks}`);
        report.push(`- Workload: ${this.calculateWorkload(member)}%`);
      });
    }
    
    // Risks and issues
    report.push('');
    report.push('## Risks and Issues');
    const risks = this.identifyRisks();
    risks.forEach((risk, index) => {
      report.push(`${index + 1}. ${risk}`);
    });
    
    return report.join('\n');
  }

  generateCSVReport() {
    const rows = [];
    rows.push(['Task ID', 'Title', 'Status', 'Priority', 'Category', 'Assignee', 'Estimated Hours', 'Actual Hours', 'Created Date']);
    
    if (this.data.tasks?.tasks) {
      this.data.tasks.tasks.forEach(task => {
        const assignee = this.getAssigneeName(task.assignee);
        rows.push([
          task.id,
          `"${task.title.replace(/"/g, '""')}"`,
          task.status,
          task.priority,
          task.category,
          assignee,
          task.estimatedHours || '',
          task.actualHours || '',
          new Date(task.createdDate).toLocaleDateString()
        ]);
      });
    }
    
    return rows.map(row => row.join(',')).join('\n');
  }

  generateHTMLReport() {
    const timestamp = new Date().toISOString();
    const projectName = this.data.tasks?.projectInfo?.name || 'Project';
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName} - Status Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: #2563eb;
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0 0 10px 0;
        }
        .card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .metric {
            display: inline-block;
            margin: 10px 20px 10px 0;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #2563eb;
        }
        .metric-label {
            color: #666;
            font-size: 0.9em;
        }
        .progress-bar {
            background: #e5e7eb;
            height: 20px;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            background: #10b981;
            height: 100%;
            transition: width 0.3s ease;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background: #f9fafb;
            font-weight: 600;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 500;
        }
        .status-completed { background: #d1fae5; color: #065f46; }
        .status-in_progress { background: #dbeafe; color: #1e40af; }
        .status-blocked { background: #fee2e2; color: #991b1b; }
        .status-pending { background: #f3f4f6; color: #374151; }
        .priority-critical { color: #dc2626; font-weight: bold; }
        .priority-high { color: #f59e0b; font-weight: bold; }
        .priority-medium { color: #3b82f6; }
        .priority-low { color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${projectName} - Status Report</h1>
        <p>Generated on ${new Date(timestamp).toLocaleString()}</p>
    </div>
    
    ${this.generateHTMLMetrics()}
    ${this.generateHTMLTaskTable()}
    ${this.generateHTMLMilestones()}
    ${this.generateHTMLTeam()}
</body>
</html>`;
    
    return html;
  }

  generateHTMLMetrics() {
    if (!this.data.tasks?.tasks) return '';
    
    const tasks = this.data.tasks.tasks;
    const statusCounts = this.getStatusCounts(tasks);
    const completion = Math.round((statusCounts.completed / tasks.length) * 100);
    
    return `
    <div class="card">
        <h2>Project Metrics</h2>
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${tasks.length}</div>
                <div class="metric-label">Total Tasks</div>
            </div>
            <div class="metric">
                <div class="metric-value">${completion}%</div>
                <div class="metric-label">Completion</div>
            </div>
            <div class="metric">
                <div class="metric-value">${statusCounts.in_progress}</div>
                <div class="metric-label">In Progress</div>
            </div>
            <div class="metric">
                <div class="metric-value">${statusCounts.blocked}</div>
                <div class="metric-label">Blocked</div>
            </div>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${completion}%"></div>
        </div>
    </div>`;
  }

  generateHTMLTaskTable() {
    if (!this.data.tasks?.tasks) return '';
    
    const tasks = this.data.tasks.tasks;
    const rows = tasks.slice(0, 20).map(task => {
      const assignee = this.getAssigneeName(task.assignee);
      return `
        <tr>
            <td>${task.id}</td>
            <td>${task.title}</td>
            <td><span class="status-badge status-${task.status}">${this.formatStatus(task.status)}</span></td>
            <td><span class="priority-${task.priority}">${this.formatPriority(task.priority)}</span></td>
            <td>${assignee}</td>
        </tr>`;
    }).join('');
    
    return `
    <div class="card">
        <h2>Recent Tasks</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assignee</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </div>`;
  }

  generateHTMLMilestones() {
    if (!this.data.milestones?.milestones) return '';
    
    const milestones = this.data.milestones.milestones
      .filter(m => m.status === 'active')
      .slice(0, 5);
    
    if (milestones.length === 0) return '';
    
    const rows = milestones.map(m => {
      const daysUntil = Math.ceil((new Date(m.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
      const progress = m.progress || 0;
      return `
        <div style="margin-bottom: 20px;">
            <h3>${m.name}</h3>
            <p>${m.description}</p>
            <p><strong>Target:</strong> ${new Date(m.targetDate).toLocaleDateString()} (${daysUntil} days)</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <p style="text-align: right; margin: 5px 0;">${progress}% Complete</p>
        </div>`;
    }).join('');
    
    return `
    <div class="card">
        <h2>Active Milestones</h2>
        ${rows}
    </div>`;
  }

  generateHTMLTeam() {
    if (!this.data.team?.members) return '';
    
    const members = this.data.team.members.filter(m => m.status === 'active');
    if (members.length === 0) return '';
    
    const rows = members.map(member => {
      const workload = this.calculateWorkload(member);
      const workloadColor = workload > 100 ? '#dc2626' : workload > 80 ? '#f59e0b' : '#10b981';
      return `
        <tr>
            <td>${member.name}</td>
            <td>${member.role}</td>
            <td>${member.assignedTasks.length}</td>
            <td style="color: ${workloadColor}; font-weight: bold;">${workload}%</td>
        </tr>`;
    }).join('');
    
    return `
    <div class="card">
        <h2>Team Workload</h2>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Tasks</th>
                    <th>Workload</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </div>`;
  }

  // Helper methods
  getStatusCounts(tasks) {
    const counts = {};
    tasks.forEach(task => {
      counts[task.status] = (counts[task.status] || 0) + 1;
    });
    return counts;
  }

  getPriorityCounts(tasks) {
    const counts = {};
    tasks.forEach(task => {
      counts[task.priority] = (counts[task.priority] || 0) + 1;
    });
    return counts;
  }

  calculateWorkload(member) {
    if (!this.data.tasks?.tasks) return 0;
    
    const assignedTasks = this.data.tasks.tasks.filter(task => 
      member.assignedTasks.includes(task.id) && 
      ['in_progress', 'pending', 'review'].includes(task.status)
    );
    
    const totalHours = assignedTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const availableHours = (member.capacity * member.availability) / 100;
    
    return availableHours > 0 ? Math.round((totalHours / availableHours) * 100) : 0;
  }

  getAssigneeName(assigneeId) {
    if (!assigneeId || !this.data.team?.members) return 'Unassigned';
    
    const member = this.data.team.members.find(m => m.id === assigneeId);
    return member ? member.name : 'Unknown';
  }

  formatStatus(status) {
    const formats = {
      'completed': 'Completed',
      'in_progress': 'In Progress',
      'blocked': 'Blocked',
      'pending': 'Pending',
      'review': 'In Review',
      'cancelled': 'Cancelled'
    };
    return formats[status] || status;
  }

  formatPriority(priority) {
    const formats = {
      'critical': 'Critical',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return formats[priority] || priority;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.data.tasks?.tasks) {
      const tasks = this.data.tasks.tasks;
      const statusCounts = this.getStatusCounts(tasks);
      
      if (statusCounts.blocked > tasks.length * 0.1) {
        recommendations.push('High number of blocked tasks - review and resolve blockers');
      }
      
      if (statusCounts.in_progress > statusCounts.completed) {
        recommendations.push('Focus on completing in-progress tasks before starting new ones');
      }
    }
    
    if (this.data.team?.members) {
      const overloaded = this.data.team.members.filter(m => 
        m.status === 'active' && this.calculateWorkload(m) > 100
      );
      if (overloaded.length > 0) {
        recommendations.push(`Redistribute work from ${overloaded.length} overloaded team member(s)`);
      }
    }
    
    if (this.data.milestones?.milestones) {
      const overdue = this.data.milestones.milestones.filter(m => 
        m.status === 'active' && new Date(m.targetDate) < new Date()
      );
      if (overdue.length > 0) {
        recommendations.push(`Address ${overdue.length} overdue milestone(s)`);
      }
    }
    
    return recommendations.length > 0 ? recommendations : ['Project is on track'];
  }

  identifyRisks() {
    const risks = [];
    
    if (this.data.tasks?.tasks) {
      const tasks = this.data.tasks.tasks;
      const blockedCritical = tasks.filter(t => 
        t.status === 'blocked' && ['critical', 'high'].includes(t.priority)
      );
      
      if (blockedCritical.length > 0) {
        risks.push(`${blockedCritical.length} high-priority task(s) are blocked`);
      }
    }
    
    if (this.data.milestones?.milestones) {
      const atRisk = this.data.milestones.milestones.filter(m => {
        if (m.status !== 'active') return false;
        const daysRemaining = Math.ceil((new Date(m.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        return daysRemaining < 7 && (m.progress || 0) < 80;
      });
      
      if (atRisk.length > 0) {
        risks.push(`${atRisk.length} milestone(s) at risk of missing deadline`);
      }
    }
    
    return risks.length > 0 ? risks : ['No critical risks identified'];
  }

  saveReport(content, filename) {
    const filepath = path.join(this.reportsDir, filename);
    fs.writeFileSync(filepath, content);
    console.log(`✅ Report saved to: ${filepath}`);
  }

  showHelp() {
    console.log(`
📊 Project Reporter - Generate Project Reports

Usage: node project-reporter.js <command> [options]

Commands:
  summary              Generate executive summary (markdown)
  detailed             Generate detailed report (markdown)
  csv                  Generate CSV report of all tasks
  html                 Generate HTML report with charts
  all                  Generate all report formats
  help                 Show this help message

Options:
  --save               Save report to file (default: display only)
  --open               Open HTML report in browser (html only)

Examples:
  node project-reporter.js summary
  node project-reporter.js detailed --save
  node project-reporter.js html --save --open
  node project-reporter.js all --save
`);
  }
}

// CLI Interface
function main() {
  const reporter = new ProjectReporter();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    reporter.showHelp();
    return;
  }

  const command = args[0];
  const shouldSave = args.includes('--save');
  const shouldOpen = args.includes('--open');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  switch (command) {
    case 'summary': {
      const report = reporter.generateExecutiveSummary();
      console.log(report);
      if (shouldSave) {
        reporter.saveReport(report, `executive-summary-${timestamp}.md`);
      }
      break;
    }
    
    case 'detailed': {
      const report = reporter.generateDetailedReport();
      console.log(report);
      if (shouldSave) {
        reporter.saveReport(report, `detailed-report-${timestamp}.md`);
      }
      break;
    }
    
    case 'csv': {
      const report = reporter.generateCSVReport();
      if (shouldSave) {
        reporter.saveReport(report, `tasks-report-${timestamp}.csv`);
      } else {
        console.log(report);
      }
      break;
    }
    
    case 'html': {
      const report = reporter.generateHTMLReport();
      const filename = `status-report-${timestamp}.html`;
      
      if (shouldSave) {
        reporter.saveReport(report, filename);
        
        if (shouldOpen) {
          const filepath = path.join(reporter.reportsDir, filename);
          const { exec } = require('child_process');
          const openCommand = process.platform === 'darwin' ? 'open' : 
                            process.platform === 'win32' ? 'start' : 'xdg-open';
          exec(`${openCommand} "${filepath}"`);
        }
      } else {
        console.log('HTML report generated. Use --save to save to file.');
      }
      break;
    }
    
    case 'all': {
      if (!shouldSave) {
        console.log('All reports must be saved. Use --save flag.');
        return;
      }
      
      console.log('Generating all reports...');
      
      const summary = reporter.generateExecutiveSummary();
      reporter.saveReport(summary, `executive-summary-${timestamp}.md`);
      
      const detailed = reporter.generateDetailedReport();
      reporter.saveReport(detailed, `detailed-report-${timestamp}.md`);
      
      const csv = reporter.generateCSVReport();
      reporter.saveReport(csv, `tasks-report-${timestamp}.csv`);
      
      const html = reporter.generateHTMLReport();
      reporter.saveReport(html, `status-report-${timestamp}.html`);
      
      console.log('\n✅ All reports generated successfully!');
      break;
    }
    
    case 'help':
    default:
      reporter.showHelp();
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = ProjectReporter;