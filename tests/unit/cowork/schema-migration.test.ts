import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { migrateCsvHeaders, parseCsv, readTasks, TASK_HEADERS } from '../../../packages/cowork/src/core/csv-engine';

describe('CSV Schema Migration & Header Reconciliation', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cowork-migration-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('migrates older CSV with missing columns by appending missing headers without data loss', () => {
    const legacyTasksFile = path.join(tempDir, 'tasks.csv');
    // Legacy CSV lacking category, priority, dueDate, reminderDate, assignedAgent, notes
    const legacyContent = 'id,title,status\ntask-legacy-1,"Refactorer le core",todo\n';
    fs.writeFileSync(legacyTasksFile, legacyContent, 'utf8');

    const migrated = migrateCsvHeaders(legacyTasksFile, TASK_HEADERS);
    expect(migrated).toBe(true);

    const updatedRaw = fs.readFileSync(legacyTasksFile, 'utf8');
    const rows = parseCsv(updatedRaw);

    expect(rows.length).toBe(2);
    // Headers must include all expected TASK_HEADERS
    TASK_HEADERS.forEach(h => {
      expect(rows[0]).toContain(h);
    });

    // Row 1 values must preserve id, title, and status
    expect(rows[1][0]).toBe('task-legacy-1');
    expect(rows[1][1]).toBe('Refactorer le core');
    expect(rows[1][2]).toBe('todo');

    // Second run should report false (already up-to-date)
    const secondRun = migrateCsvHeaders(legacyTasksFile, TASK_HEADERS);
    expect(secondRun).toBe(false);
  });

  it('readTasks automatically triggers migration on older CSV files', () => {
    const legacyTasksFile = path.join(tempDir, 'tasks.csv');
    const legacyContent = 'id,title,status\ntask-99,"Auto Migrated Task",done\n';
    fs.writeFileSync(legacyTasksFile, legacyContent, 'utf8');

    const tasks = readTasks(legacyTasksFile);
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe('task-99');
    expect(tasks[0].title).toBe('Auto Migrated Task');
    expect(tasks[0].status).toBe('done');
    // Default fallback values filled by Zod schema
    expect(tasks[0].category).toBe('Tech');
    expect(tasks[0].priority).toBe('medium');
  });
});
