import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { runInit } from '../../../packages/cowork/src/cli/commands/init';
import {
  getProjectHealth,
  getProjectContext,
  getTasks,
  addTask,
  updateTaskStatus,
  addDecision,
} from '../../../packages/cowork/src/mcp/tools';

describe('MCP Tools for Claude', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cowork-mcp-test-'));
    runInit(tempDir, true);
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('getProjectHealth returns complete project diagnosis and Top 3 focus', () => {
    const health = getProjectHealth(tempDir);
    expect(health.projectName).toBeDefined();
    expect(health.tasksOverview.total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(health.top3Focus)).toBe(true);
    expect(health.openDecisionsCount).toBeDefined();
  });

  it('getProjectContext returns markdown content of context.md', () => {
    const context = getProjectContext(tempDir);
    expect(context).toContain('Contexte Projet');
    expect(context).toContain('Lean Canvas');
  });

  it('addTask creates task and updateTaskStatus updates it to done', () => {
    const newTask = addTask(tempDir, {
      title: 'Implémenter le serveur MCP',
      category: 'Tech',
      priority: 'critical',
      dueDate: '2026-10-01',
      notes: 'Test MCP tool',
    });

    expect(newTask.id).toBeDefined();
    expect(newTask.title).toBe('Implémenter le serveur MCP');
    expect(newTask.status).toBe('todo');

    // Update status
    const updated = updateTaskStatus(tempDir, {
      taskId: newTask.id,
      status: 'done',
    });
    expect(updated.status).toBe('done');

    // Verify in tasks list
    const doneTasks = getTasks(tempDir, 'done');
    expect(doneTasks.some(t => t.id === newTask.id)).toBe(true);
  });

  it('addDecision records an architectural decision', () => {
    const decision = addDecision(tempDir, {
      title: 'Adoption du protocole MCP pour Claude Desktop',
      status: 'decided',
      context: 'Intégration native dans le panneau latéral de Claude',
      chosenOption: 'Serveur Stdio via @modelcontextprotocol/sdk',
      tradeOffs: 'Standardisation Anthropic',
    });

    expect(decision.id).toBeDefined();
    expect(decision.title).toBe('Adoption du protocole MCP pour Claude Desktop');
    expect(decision.status).toBe('decided');

    const decisionsFile = path.join(tempDir, '.cowork', 'decisions.csv');
    const raw = fs.readFileSync(decisionsFile, 'utf8');
    expect(raw).toContain('Adoption du protocole MCP');
  });
});
