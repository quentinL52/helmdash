import * as fs from 'fs';
import * as path from 'path';
import { Task, CoworkConfig } from '../types';

/**
 * Format a Date to UTC iCalendar format: YYYYMMDDTHHMMSSZ or Date only YYYYMMDD
 */
function formatIcalDate(dateStr: string, isAllDay: boolean = true): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // Fallback: parse YYYY-MM-DD
    const clean = dateStr.replace(/[^0-9]/g, '');
    return clean.slice(0, 8);
  }
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  
  if (isAllDay) {
    return `${year}${month}${day}`;
  }
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const seconds = String(d.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Generate RFC 5545 standard iCalendar content
 */
export function generateIcs(tasks: Task[], config: CoworkConfig): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Helmdash//Cowork Calendar 1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${config.projectName} - Deadlines & Jalons`,
    'X-WR-TIMEZONE:UTC',
  ];

  // 1. Add MVP Milestone if target date is set
  if (config.mvpTargetDate) {
    const mDate = formatIcalDate(config.mvpTargetDate, true);
    lines.push(
      'BEGIN:VEVENT',
      `UID:milestone-mvp-${config.projectName.replace(/\s+/g, '-').toLowerCase()}@helmdash.app`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${mDate}`,
      `SUMMARY:🚀 JALON MVP : ${config.projectName}`,
      `DESCRIPTION:Date cible de livraison du MVP pour ${config.projectName}.`,
      'PRIORITY:1',
      'CATEGORIES:Milestone,MVP',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Rappel J-7 MVP',
      'TRIGGER:-P7D',
      'END:VALARM',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Rappel J-1 MVP',
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT'
    );
  }

  // 2. Add Task Deadlines
  for (const task of tasks) {
    if (!task.dueDate && !task.reminderDate) continue;

    const eventDate = task.dueDate || task.reminderDate;
    const icalDate = formatIcalDate(eventDate, true);
    const uid = `task-${task.id}@helmdash.app`;

    let priorityCode = '5'; // normal
    if (task.priority === 'critical') priorityCode = '1';
    else if (task.priority === 'high') priorityCode = '2';
    else if (task.priority === 'low') priorityCode = '9';

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${icalDate}`,
      `SUMMARY:[${task.category}] ${task.title}`,
      `DESCRIPTION:Statut: ${task.status}\\nPriorité: ${task.priority}\\nAssigné: ${task.assignedAgent}${task.notes ? '\\nNotes: ' + task.notes.replace(/\n/g, '\\n') : ''}`,
      `PRIORITY:${priorityCode}`,
      `CATEGORIES:${task.category},Task`,
      `STATUS:${task.status === 'done' ? 'COMPLETED' : 'CONFIRMED'}`
    );

    // If reminderDate is provided, add alarm
    if (task.reminderDate) {
      lines.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:Rappel tâche : ${task.title}`,
        'TRIGGER:-PT9H', // 9:00 AM morning reminder
        'END:VALARM'
      );
    }

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR', '');
  return lines.join('\r\n');
}

/**
 * Write calendar to target .ics file
 */
export function writeCalendar(filePath: string, tasks: Task[], config: CoworkConfig): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const ics = generateIcs(tasks, config);
  fs.writeFileSync(filePath, ics, 'utf8');
}
