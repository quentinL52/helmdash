import { AgentRole } from './provider-registry';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedRole: AgentRole;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskDelegator {
  private tasks: Task[] = [];

  constructor() {}

  delegateTask(title: string, description: string, role: AgentRole): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      assignedRole: role,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tasks.push(task);
    return task;
  }

  getTasksByRole(role: AgentRole): Task[] {
    return this.tasks.filter(t => t.assignedRole === role);
  }

  getPendingTasks(): Task[] {
    return this.tasks.filter(t => t.status === 'pending');
  }

  updateTaskStatus(taskId: string, status: Task['status'], result?: string) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      if (result) {
        task.result = result;
      }
      task.updatedAt = new Date();
    }
  }
}

// Global instance for simple MVP usage
export const taskDelegator = new TaskDelegator();
