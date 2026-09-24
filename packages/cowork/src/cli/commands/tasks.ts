import * as path from 'path';
import * as fs from 'fs';
import pc from 'picocolors';
import { readTasks, writeTasks } from '../../core/csv-engine';
import { writeCalendar } from '../../core/ical-builder';
import { Task, TaskCategory, TaskPriority, TaskStatus, CoworkConfigSchema } from '../../types';

export function runListTasks(targetDir: string = process.cwd(), statusFilter?: string): void {
  const coworkDir = path.join(targetDir, '.cowork');
  const tasksFile = path.join(coworkDir, 'tasks.csv');
  let tasks = readTasks(tasksFile);

  if (tasks.length === 0) {
    console.log(pc.dim('Aucune tâche enregistrée dans .cowork/tasks.csv.'));
    return;
  }

  if (statusFilter) {
    tasks = tasks.filter(t => t.status === statusFilter);
  }

  console.log(pc.bold(`\n📋 Tâches (${tasks.length}) :\n`));
  tasks.forEach(t => {
    const sColor = t.status === 'done' ? pc.green : t.status === 'in_progress' ? pc.yellow : t.status === 'blocked' ? pc.red : pc.blue;
    const pColor = t.priority === 'critical' ? pc.red : t.priority === 'high' ? pc.yellow : pc.dim;
    console.log(`  ${pc.dim(t.id)} [${sColor(t.status.padEnd(11))}] [${pColor(t.priority.padEnd(8))}] ${t.title} ${t.dueDate ? pc.dim(`(📅 ${t.dueDate})`) : ''}`);
  });
  console.log();
}

export function runAddTask(
  title: string,
  options: {
    category?: string;
    priority?: string;
    dueDate?: string;
    reminderDate?: string;
    assignedAgent?: string;
    notes?: string;
    targetDir?: string;
  }
): void {
  const targetDir = options.targetDir || process.cwd();
  const coworkDir = path.join(targetDir, '.cowork');
  const tasksFile = path.join(coworkDir, 'tasks.csv');
  const tasks = readTasks(tasksFile);

  const newId = `task-${tasks.length + 1}`;
  const newTask: Task = {
    id: newId,
    title: title.trim(),
    category: (options.category as TaskCategory) || 'Tech',
    status: 'todo' as TaskStatus,
    priority: (options.priority as TaskPriority) || 'medium',
    dueDate: options.dueDate || '',
    reminderDate: options.reminderDate || '',
    assignedAgent: options.assignedAgent || 'founder',
    notes: options.notes || '',
  };

  tasks.push(newTask);
  writeTasks(tasksFile, tasks);

  // Auto-regenerate calendar
  const configFile = path.join(coworkDir, 'config.json');
  let config = { projectName: path.basename(targetDir), mvpTargetDate: null as string | null };
  if (fs.existsSync(configFile)) {
    try {
      config = CoworkConfigSchema.parse(JSON.parse(fs.readFileSync(configFile, 'utf8')));
    } catch {
      // Fallback
    }
  }
  writeCalendar(path.join(coworkDir, 'calendar.ics'), tasks, config as any);

  console.log(pc.green(`✓ Tâche [${newId}] ajoutée avec succès : "${title}"`));
}

export function runCompleteTask(taskId: string, targetDir: string = process.cwd()): void {
  const coworkDir = path.join(targetDir, '.cowork');
  const tasksFile = path.join(coworkDir, 'tasks.csv');
  const tasks = readTasks(tasksFile);

  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    console.log(pc.red(`✗ Tâche avec l'ID "${taskId}" introuvable.`));
    return;
  }

  task.status = 'done';
  writeTasks(tasksFile, tasks);

  // Auto-regenerate calendar
  const configFile = path.join(coworkDir, 'config.json');
  let config = { projectName: path.basename(targetDir), mvpTargetDate: null as string | null };
  if (fs.existsSync(configFile)) {
    try {
      config = CoworkConfigSchema.parse(JSON.parse(fs.readFileSync(configFile, 'utf8')));
    } catch {
      // Fallback
    }
  }
  writeCalendar(path.join(coworkDir, 'calendar.ics'), tasks, config as any);

  console.log(pc.green(`✓ Tâche [${taskId}] "${task.title}" marquée comme terminée !`));
}
