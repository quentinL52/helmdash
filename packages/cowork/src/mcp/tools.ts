import * as fs from 'fs';
import * as path from 'path';
import { readTasks, writeTasks, readDecisions, writeDecisions, readHypotheses } from '../core/csv-engine';
import { writeCalendar } from '../core/ical-builder';
import { Task, TaskCategory, TaskPriority, TaskStatus, Decision, DecisionStatus, CoworkConfigSchema } from '../types';

export function getProjectHealth(projectDir: string = process.cwd()) {
  const coworkDir = path.join(projectDir, '.cowork');
  const configFile = path.join(coworkDir, 'config.json');
  let config = { projectName: path.basename(projectDir), mvpTargetDate: null as string | null };
  if (fs.existsSync(configFile)) {
    try {
      config = CoworkConfigSchema.parse(JSON.parse(fs.readFileSync(configFile, 'utf8')));
    } catch {
      // Fallback
    }
  }

  const tasks = readTasks(path.join(coworkDir, 'tasks.csv'));
  const decisions = readDecisions(path.join(coworkDir, 'decisions.csv'));
  const hypotheses = readHypotheses(path.join(coworkDir, 'hypotheses.csv'));

  const counts: Record<string, number> = { backlog: 0, todo: 0, in_progress: 0, blocked: 0, done: 0 };
  for (const t of tasks) {
    if (counts[t.status] !== undefined) counts[t.status]++;
  }

  let daysToMvp: number | null = null;
  if (config.mvpTargetDate) {
    daysToMvp = Math.ceil((new Date(config.mvpTargetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  const pending = tasks.filter(t => t.status !== 'done');
  const priorityWeight: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  pending.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
  const top3 = pending.slice(0, 3).map(t => ({ id: t.id, title: t.title, priority: t.priority, dueDate: t.dueDate }));

  const openDecisions = decisions.filter(d => d.status === 'open');

  return {
    projectName: config.projectName,
    mvpTargetDate: config.mvpTargetDate,
    daysToMvp,
    tasksOverview: {
      total: tasks.length,
      byStatus: counts,
    },
    top3Focus: top3,
    openDecisionsCount: openDecisions.length,
    hypothesesCount: hypotheses.length,
    validatedHypothesesCount: hypotheses.filter(h => h.status === 'validated').length,
  };
}

export function getProjectContext(projectDir: string = process.cwd()) {
  const contextFile = path.join(projectDir, '.cowork', 'context.md');
  if (fs.existsSync(contextFile)) {
    return fs.readFileSync(contextFile, 'utf8');
  }
  return 'Aucun contexte .cowork/context.md trouvé.';
}

export function getTasks(projectDir: string = process.cwd(), status?: string) {
  const tasks = readTasks(path.join(projectDir, '.cowork', 'tasks.csv'));
  if (status) {
    return tasks.filter(t => t.status === status);
  }
  return tasks;
}

export function addTask(
  projectDir: string = process.cwd(),
  params: {
    title: string;
    category?: string;
    priority?: string;
    dueDate?: string;
    reminderDate?: string;
    assignedAgent?: string;
    notes?: string;
  }
) {
  const coworkDir = path.join(projectDir, '.cowork');
  const tasksFile = path.join(coworkDir, 'tasks.csv');
  const tasks = readTasks(tasksFile);

  const newId = `task-${tasks.length + 1}`;
  const newTask: Task = {
    id: newId,
    title: params.title.trim(),
    category: (params.category as TaskCategory) || 'Tech',
    status: 'todo' as TaskStatus,
    priority: (params.priority as TaskPriority) || 'medium',
    dueDate: params.dueDate || '',
    reminderDate: params.reminderDate || '',
    assignedAgent: params.assignedAgent || 'founder',
    notes: params.notes || '',
  };

  tasks.push(newTask);
  writeTasks(tasksFile, tasks);

  // Auto-sync calendar
  const configFile = path.join(coworkDir, 'config.json');
  let config = { projectName: path.basename(projectDir), mvpTargetDate: null as string | null };
  if (fs.existsSync(configFile)) {
    try {
      config = CoworkConfigSchema.parse(JSON.parse(fs.readFileSync(configFile, 'utf8')));
    } catch {}
  }
  writeCalendar(path.join(coworkDir, 'calendar.ics'), tasks, config as any);

  return newTask;
}

export function updateTaskStatus(
  projectDir: string = process.cwd(),
  params: { taskId: string; status: TaskStatus }
) {
  const coworkDir = path.join(projectDir, '.cowork');
  const tasksFile = path.join(coworkDir, 'tasks.csv');
  const tasks = readTasks(tasksFile);

  const task = tasks.find(t => t.id === params.taskId);
  if (!task) {
    throw new Error(`Tâche avec l'ID ${params.taskId} introuvable.`);
  }

  task.status = params.status;
  writeTasks(tasksFile, tasks);

  // Auto-sync calendar
  const configFile = path.join(coworkDir, 'config.json');
  let config = { projectName: path.basename(projectDir), mvpTargetDate: null as string | null };
  if (fs.existsSync(configFile)) {
    try {
      config = CoworkConfigSchema.parse(JSON.parse(fs.readFileSync(configFile, 'utf8')));
    } catch {}
  }
  writeCalendar(path.join(coworkDir, 'calendar.ics'), tasks, config as any);

  return task;
}

export function addDecision(
  projectDir: string = process.cwd(),
  params: {
    title: string;
    status?: string;
    context?: string;
    chosenOption?: string;
    tradeOffs?: string;
  }
) {
  const coworkDir = path.join(projectDir, '.cowork');
  const decisionsFile = path.join(coworkDir, 'decisions.csv');
  const decisions = readDecisions(decisionsFile);

  const newId = `dec-${decisions.length + 1}`;
  const newDecision: Decision = {
    id: newId,
    date: new Date().toISOString().slice(0, 10),
    title: params.title.trim(),
    status: (params.status as DecisionStatus) || 'decided',
    context: params.context || '',
    chosenOption: params.chosenOption || '',
    tradeOffs: params.tradeOffs || '',
    revisitDate: '',
  };

  decisions.push(newDecision);
  writeDecisions(decisionsFile, decisions);

  return newDecision;
}
