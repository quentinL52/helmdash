import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  parseCsv,
  formatCsv,
  readTasks,
  writeTasks,
  readDecisions,
  writeDecisions,
  readHypotheses,
  writeHypotheses,
} from '../../../packages/cowork/src/core/csv-engine';
import { Task, Decision, Hypothesis } from '../../../packages/cowork/src/types';

describe('CSV Engine', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cowork-csv-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('correctly parses RFC 4180 CSV with commas and quotes', () => {
    const raw = 'id,title,notes\n1,"Hello, World","Line 1\nLine 2"\n2,"Simple",Normal\n';
    const parsed = parseCsv(raw);
    expect(parsed.length).toBe(3);
    expect(parsed[0]).toEqual(['id', 'title', 'notes']);
    expect(parsed[1]).toEqual(['1', 'Hello, World', 'Line 1\nLine 2']);
    expect(parsed[2]).toEqual(['2', 'Simple', 'Normal']);
  });

  it('correctly formats records to RFC 4180 CSV', () => {
    const headers = ['id', 'title', 'notes'];
    const records = [
      { id: '1', title: 'Hello, World', notes: 'Double "quote"' },
      { id: '2', title: 'Plain', notes: '' },
    ];
    const csv = formatCsv(headers, records);
    expect(csv).toContain('id,title,notes');
    expect(csv).toContain('"Hello, World"');
    expect(csv).toContain('"Double ""quote"""');
  });

  it('writes and reads tasks accurately with schema enforcement', () => {
    const tasksFile = path.join(tempDir, 'tasks.csv');
    const tasks: Task[] = [
      {
        id: 'task-1',
        title: 'Tester le module Cowork',
        category: 'Tech',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-10-01',
        reminderDate: '2026-09-30',
        assignedAgent: 'founder',
        notes: 'Test note with, comma and "quotes"',
      },
    ];

    writeTasks(tasksFile, tasks);
    expect(fs.existsSync(tasksFile)).toBe(true);

    const reloaded = readTasks(tasksFile);
    expect(reloaded.length).toBe(1);
    expect(reloaded[0].id).toBe('task-1');
    expect(reloaded[0].title).toBe('Tester le module Cowork');
    expect(reloaded[0].priority).toBe('high');
    expect(reloaded[0].status).toBe('in_progress');
    expect(reloaded[0].notes).toBe('Test note with, comma and "quotes"');
  });

  it('writes and reads decisions accurately', () => {
    const decFile = path.join(tempDir, 'decisions.csv');
    const decisions: Decision[] = [
      {
        id: 'dec-1',
        date: '2026-09-24',
        title: 'Architecture Local-First',
        status: 'decided',
        context: 'Simplicité maximale pour solopreneur',
        chosenOption: 'CSV + .cowork/',
        tradeOffs: 'Pas de base SQL lourde',
        revisitDate: '',
      },
    ];

    writeDecisions(decFile, decisions);
    const reloaded = readDecisions(decFile);
    expect(reloaded.length).toBe(1);
    expect(reloaded[0].chosenOption).toBe('CSV + .cowork/');
    expect(reloaded[0].status).toBe('decided');
  });

  it('writes and reads hypotheses accurately', () => {
    const hypFile = path.join(tempDir, 'hypotheses.csv');
    const hypotheses: Hypothesis[] = [
      {
        id: 'hyp-1',
        hypothesis: 'Les utilisateurs aiment le format CSV',
        validationMethod: 'Sondage',
        successCriteria: '> 80% satisfaction',
        status: 'in_progress',
        validatedAt: '',
      },
    ];

    writeHypotheses(hypFile, hypotheses);
    const reloaded = readHypotheses(hypFile);
    expect(reloaded.length).toBe(1);
    expect(reloaded[0].hypothesis).toBe('Les utilisateurs aiment le format CSV');
  });
});
