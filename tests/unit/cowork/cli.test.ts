import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { runInit } from '../../../packages/cowork/src/cli/commands/init';
import { runAddTask, runCompleteTask } from '../../../packages/cowork/src/cli/commands/tasks';
import { runAddDecision } from '../../../packages/cowork/src/cli/commands/decisions';
import { runStatus } from '../../../packages/cowork/src/cli/commands/status';
import { readTasks, readDecisions } from '../../../packages/cowork/src/core/csv-engine';

describe('Cowork CLI Commands', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cowork-cli-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('runInit scaffolds full .cowork directory, CLAUDE.md, and onboarding command', () => {
    runInit(tempDir, true);

    const coworkDir = path.join(tempDir, '.cowork');
    expect(fs.existsSync(coworkDir)).toBe(true);
    expect(fs.existsSync(path.join(coworkDir, 'config.json'))).toBe(true);
    expect(fs.existsSync(path.join(coworkDir, 'tasks.csv'))).toBe(true);
    expect(fs.existsSync(path.join(coworkDir, 'decisions.csv'))).toBe(true);
    expect(fs.existsSync(path.join(coworkDir, 'hypotheses.csv'))).toBe(true);
    expect(fs.existsSync(path.join(coworkDir, 'context.md'))).toBe(true);
    expect(fs.existsSync(path.join(coworkDir, 'milestones.md'))).toBe(true);
    expect(fs.existsSync(path.join(coworkDir, 'calendar.ics'))).toBe(true);

    const claudeMd = path.join(tempDir, 'CLAUDE.md');
    expect(fs.existsSync(claudeMd)).toBe(true);
    const claudeContent = fs.readFileSync(claudeMd, 'utf8');
    expect(claudeContent).toContain('HELMDASH COWORK START');
    expect(claudeContent).toContain('/cowork-onboard');

    const onboardCmd = path.join(tempDir, '.claude', 'commands', 'cowork-onboard.md');
    expect(fs.existsSync(onboardCmd)).toBe(true);
  });

  it('runAddTask adds task and runCompleteTask marks it done', () => {
    runInit(tempDir, true);

    runAddTask('Créer le modèle de pricing', {
      category: 'CFO',
      priority: 'high',
      dueDate: '2026-10-05',
      targetDir: tempDir,
    });

    const tasksFile = path.join(tempDir, '.cowork', 'tasks.csv');
    let tasks = readTasks(tasksFile);
    const added = tasks.find(t => t.title === 'Créer le modèle de pricing');
    expect(added).toBeDefined();
    expect(added?.category).toBe('CFO');
    expect(added?.priority).toBe('high');
    expect(added?.status).toBe('todo');

    // Complete task
    runCompleteTask(added!.id, tempDir);
    tasks = readTasks(tasksFile);
    const completed = tasks.find(t => t.id === added!.id);
    expect(completed?.status).toBe('done');
  });

  it('runAddDecision adds decision correctly', () => {
    runInit(tempDir, true);

    runAddDecision('Choix de la stack frontend', {
      status: 'decided',
      context: 'Besoin d un rendu rapide',
      chosenOption: 'Vite + React',
      tradeOffs: 'Pas de SSR complexe',
      targetDir: tempDir,
    });

    const decsFile = path.join(tempDir, '.cowork', 'decisions.csv');
    const decisions = readDecisions(decsFile);
    const added = decisions.find(d => d.title === 'Choix de la stack frontend');
    expect(added).toBeDefined();
    expect(added?.chosenOption).toBe('Vite + React');
  });

  it('runStatus executes without error', () => {
    runInit(tempDir, true);
    expect(() => runStatus(tempDir)).not.toThrow();
  });
});
