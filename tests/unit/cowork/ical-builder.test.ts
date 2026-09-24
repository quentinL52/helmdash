import { describe, it, expect } from 'vitest';
import { generateIcs } from '../../../packages/cowork/src/core/ical-builder';
import { Task, CoworkConfig } from '../../../packages/cowork/src/types';

describe('iCal Builder', () => {
  const mockConfig: CoworkConfig = {
    projectName: 'Super SaaS',
    mvpTargetDate: '2026-11-15',
    port: 3333,
    founderName: 'Alice',
    syncEnabled: false,
  };

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Livrer la landing page',
      category: 'Growth',
      status: 'todo',
      priority: 'high',
      dueDate: '2026-10-10',
      reminderDate: '2026-10-09',
      assignedAgent: 'growth',
      notes: 'Avec formulaire waitlist',
    },
    {
      id: 'task-2',
      title: 'Tâche sans date',
      category: 'Tech',
      status: 'backlog',
      priority: 'low',
      dueDate: '',
      reminderDate: '',
      assignedAgent: 'founder',
      notes: '',
    },
  ];

  it('generates standard RFC 5545 iCalendar content', () => {
    const ics = generateIcs(mockTasks, mockConfig);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('X-WR-CALNAME:Super SaaS - Deadlines & Jalons');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('includes MVP milestone event with alarms', () => {
    const ics = generateIcs(mockTasks, mockConfig);
    expect(ics).toContain('SUMMARY:🚀 JALON MVP : Super SaaS');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261115');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('DESCRIPTION:Rappel J-7 MVP');
  });

  it('includes scheduled tasks and omits tasks without dates', () => {
    const ics = generateIcs(mockTasks, mockConfig);
    expect(ics).toContain('SUMMARY:[Growth] Livrer la landing page');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261010');
    expect(ics).toContain('PRIORITY:2');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('DESCRIPTION:Rappel tâche : Livrer la landing page');
    expect(ics).not.toContain('Tâche sans date');
  });
});
