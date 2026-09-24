import * as fs from 'fs';
import * as path from 'path';
import {
  Task,
  TaskSchema,
  Decision,
  DecisionSchema,
  Hypothesis,
  HypothesisSchema,
} from '../types';

/**
 * Robust RFC 4180 compliant CSV parser
 */
export function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') i++;
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows.filter(row => row.length > 0 && row.some(cell => cell.trim().length > 0));
}

/**
 * Format records to RFC 4180 compliant CSV
 */
export function formatCsv(headers: string[], records: Record<string, string>[]): string {
  const escapeCell = (cell: string | undefined | null): string => {
    if (cell === undefined || cell === null) return '';
    let str = String(cell);
    // Neutralize formula injection (=, +, @) when opened in Excel/Google Sheets
    if (/^[=+@]/.test(str)) {
      str = `'${str}`;
    }
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const lines = records.map(record => {
    return headers.map(h => escapeCell(record[h] || '')).join(',');
  });

  return [headerLine, ...lines].join('\n') + '\n';
}

/**
 * Atomic file lock with stale-lock detection and retry
 */
export function withFileLock<T>(filePath: string, action: () => T, timeoutMs: number = 3000): T {
  const lockFile = `${filePath}.lock`;
  const startTime = Date.now();

  const sleepMs = (ms: number) => {
    try {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
    } catch {
      const target = Date.now() + ms;
      while (Date.now() < target) {}
    }
  };

  let acquired = false;
  while (!acquired) {
    try {
      const fd = fs.openSync(lockFile, 'wx');
      fs.closeSync(fd);
      acquired = true;
    } catch (err: any) {
      if (err.code === 'EEXIST') {
        try {
          const stats = fs.statSync(lockFile);
          if (Date.now() - stats.mtimeMs > 5000) {
            // Stale lock (> 5 seconds old, likely crashed process), break it
            fs.unlinkSync(lockFile);
            continue;
          }
        } catch {
          // Lock might have been removed concurrently
          continue;
        }

        if (Date.now() - startTime >= timeoutMs) {
          throw new Error(`[Cowork Lock] Timeout waiting for lock on ${path.basename(filePath)} (${timeoutMs}ms)`);
        }
        sleepMs(25);
      } else {
        throw err;
      }
    }
  }

  try {
    return action();
  } finally {
    try {
      if (fs.existsSync(lockFile)) {
        fs.unlinkSync(lockFile);
      }
    } catch {
      // Ignore cleanup error
    }
  }
}

/**
 * Automatically migrate CSV headers by appending missing columns without data loss
 */
export function migrateCsvHeaders(filePath: string, expectedHeaders: string[]): boolean {
  if (!fs.existsSync(filePath)) return false;

  return withFileLock(filePath, () => {
    const raw = fs.readFileSync(filePath, 'utf8');
    const rows = parseCsv(raw);
    if (rows.length === 0) return false;

    const currentHeaders = rows[0].map(h => h.trim());
    const missingHeaders = expectedHeaders.filter(h => !currentHeaders.includes(h));

    if (missingHeaders.length === 0) {
      return false; // Already up to date
    }

    const newHeaders = [...currentHeaders, ...missingHeaders];
    const records: Record<string, string>[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const record: Record<string, string> = {};
      currentHeaders.forEach((h, idx) => {
        record[h] = row[idx] ?? '';
      });
      missingHeaders.forEach(h => {
        record[h] = '';
      });
      records.push(record);
    }

    const updatedCsv = formatCsv(newHeaders, records);
    fs.writeFileSync(filePath, updatedCsv, 'utf8');
    return true;
  });
}

// -------------------------------------------------------------
// Tasks CSV Operations
// -------------------------------------------------------------

export const TASK_HEADERS = [
  'id',
  'title',
  'category',
  'status',
  'priority',
  'dueDate',
  'reminderDate',
  'assignedAgent',
  'notes',
];

export function readTasks(filePath: string): Task[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  // Auto-migrate headers if needed
  migrateCsvHeaders(filePath, TASK_HEADERS);

  const raw = fs.readFileSync(filePath, 'utf8');
  const rows = parseCsv(raw);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  const tasks: Task[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = row[idx] ?? '';
    });

    const parsed = TaskSchema.safeParse(record);
    if (parsed.success) {
      tasks.push(parsed.data);
    }
  }

  return tasks;
}

export function writeTasks(filePath: string, tasks: Task[]): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  withFileLock(filePath, () => {
    const records = tasks.map(t => ({
      id: t.id,
      title: t.title,
      category: t.category,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      reminderDate: t.reminderDate,
      assignedAgent: t.assignedAgent,
      notes: t.notes,
    }));

    const csv = formatCsv(TASK_HEADERS, records);
    fs.writeFileSync(filePath, csv, 'utf8');
  });
}

// -------------------------------------------------------------
// Decisions CSV Operations
// -------------------------------------------------------------

export const DECISION_HEADERS = [
  'id',
  'date',
  'title',
  'status',
  'context',
  'chosenOption',
  'tradeOffs',
  'revisitDate',
];

export function readDecisions(filePath: string): Decision[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  // Auto-migrate headers if needed
  migrateCsvHeaders(filePath, DECISION_HEADERS);

  const raw = fs.readFileSync(filePath, 'utf8');
  const rows = parseCsv(raw);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  const decisions: Decision[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = row[idx] ?? '';
    });

    const parsed = DecisionSchema.safeParse(record);
    if (parsed.success) {
      decisions.push(parsed.data);
    }
  }

  return decisions;
}

export function writeDecisions(filePath: string, decisions: Decision[]): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  withFileLock(filePath, () => {
    const records = decisions.map(d => ({
      id: d.id,
      date: d.date,
      title: d.title,
      status: d.status,
      context: d.context,
      chosenOption: d.chosenOption,
      tradeOffs: d.tradeOffs,
      revisitDate: d.revisitDate,
    }));

    const csv = formatCsv(DECISION_HEADERS, records);
    fs.writeFileSync(filePath, csv, 'utf8');
  });
}

// -------------------------------------------------------------
// Hypotheses CSV Operations
// -------------------------------------------------------------

export const HYPOTHESIS_HEADERS = [
  'id',
  'hypothesis',
  'validationMethod',
  'successCriteria',
  'status',
  'validatedAt',
];

export function readHypotheses(filePath: string): Hypothesis[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  // Auto-migrate headers if needed
  migrateCsvHeaders(filePath, HYPOTHESIS_HEADERS);

  const raw = fs.readFileSync(filePath, 'utf8');
  const rows = parseCsv(raw);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  const hypotheses: Hypothesis[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = row[idx] ?? '';
    });

    const parsed = HypothesisSchema.safeParse(record);
    if (parsed.success) {
      hypotheses.push(parsed.data);
    }
  }

  return hypotheses;
}

export function writeHypotheses(filePath: string, hypotheses: Hypothesis[]): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  withFileLock(filePath, () => {
    const records = hypotheses.map(h => ({
      id: h.id,
      hypothesis: h.hypothesis,
      validationMethod: h.validationMethod,
      successCriteria: h.successCriteria,
      status: h.status,
      validatedAt: h.validatedAt,
    }));

    const csv = formatCsv(HYPOTHESIS_HEADERS, records);
    fs.writeFileSync(filePath, csv, 'utf8');
  });
}
