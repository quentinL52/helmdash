import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import { scanRepository } from '../../core/context-scanner';
import {
  getInitialConfig,
  getInitialTasksCsv,
  getInitialDecisionsCsv,
  getInitialHypothesesCsv,
  getInitialContextMd,
  getInitialMilestonesMd,
  getClaudeMdInstructions,
  getOnboardingPromptMarkdown,
} from '../../core/templates';
import { readTasks } from '../../core/csv-engine';
import { writeCalendar } from '../../core/ical-builder';
import { CoworkConfigSchema } from '../../types';

export function runInit(targetDir: string = process.cwd(), force: boolean = false): void {
  const coworkDir = path.join(targetDir, '.cowork');
  const alreadyExists = fs.existsSync(coworkDir);

  if (alreadyExists && !force) {
    console.log(pc.yellow(`⚠️  Le dossier .cowork/ existe déjà dans ${targetDir}.`));
    console.log(pc.dim('   Utilisez --force pour réécraser la configuration.'));
    return;
  }

  console.log(pc.bold(pc.cyan('\n🚀 Initialisation de @helmdash/cowork...')));

  // 1. Scan repo context
  const context = scanRepository(targetDir);
  console.log(pc.dim(`   Nom détecté : `) + pc.bold(context.projectName));
  if (context.stack.length > 0) {
    console.log(pc.dim(`   Stack détectée : `) + pc.green(context.stack.join(', ')));
  }

  // 2. Create .cowork structure
  fs.mkdirSync(coworkDir, { recursive: true });

  const configFile = path.join(coworkDir, 'config.json');
  fs.writeFileSync(configFile, getInitialConfig(context), 'utf8');

  const tasksFile = path.join(coworkDir, 'tasks.csv');
  if (!fs.existsSync(tasksFile) || force) {
    fs.writeFileSync(tasksFile, getInitialTasksCsv(), 'utf8');
  }

  const decisionsFile = path.join(coworkDir, 'decisions.csv');
  if (!fs.existsSync(decisionsFile) || force) {
    fs.writeFileSync(decisionsFile, getInitialDecisionsCsv(), 'utf8');
  }

  const hypothesesFile = path.join(coworkDir, 'hypotheses.csv');
  if (!fs.existsSync(hypothesesFile) || force) {
    fs.writeFileSync(hypothesesFile, getInitialHypothesesCsv(), 'utf8');
  }

  const contextFile = path.join(coworkDir, 'context.md');
  if (!fs.existsSync(contextFile) || force) {
    fs.writeFileSync(contextFile, getInitialContextMd(context), 'utf8');
  }

  const milestonesFile = path.join(coworkDir, 'milestones.md');
  if (!fs.existsSync(milestonesFile) || force) {
    fs.writeFileSync(milestonesFile, getInitialMilestonesMd(context), 'utf8');
  }

  // 3. Generate initial calendar.ics
  const tasks = readTasks(tasksFile);
  const rawConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  const config = CoworkConfigSchema.parse(rawConfig);
  const calendarFile = path.join(coworkDir, 'calendar.ics');
  writeCalendar(calendarFile, tasks, config);

  // 4. Update or Create CLAUDE.md
  const claudeMdPath = path.join(targetDir, 'CLAUDE.md');
  const coworkSection = getClaudeMdInstructions(context);

  if (fs.existsSync(claudeMdPath)) {
    const existing = fs.readFileSync(claudeMdPath, 'utf8');
    if (!existing.includes('HELMDASH COWORK START')) {
      fs.writeFileSync(claudeMdPath, existing + '\n\n' + coworkSection, 'utf8');
      console.log(pc.green('   ✓ CLAUDE.md enrichi avec les protocoles Cowork.'));
    } else {
      console.log(pc.dim('   · CLAUDE.md contient déjà les protocoles Cowork.'));
    }
  } else {
    fs.writeFileSync(claudeMdPath, coworkSection, 'utf8');
    console.log(pc.green('   ✓ CLAUDE.md créé avec les protocoles Cowork.'));
  }

  // 5. Create .claude/commands/cowork-onboard.md if supported
  const claudeCommandsDir = path.join(targetDir, '.claude', 'commands');
  fs.mkdirSync(claudeCommandsDir, { recursive: true });
  fs.writeFileSync(
    path.join(claudeCommandsDir, 'cowork-onboard.md'),
    getOnboardingPromptMarkdown(),
    'utf8'
  );

  // 6. Create .mcp.json for Claude Code / Cursor / Windsurf
  const mcpConfigPath = path.join(targetDir, '.mcp.json');
  if (!fs.existsSync(mcpConfigPath) || force) {
    const mcpConfig = {
      mcpServers: {
        'helmdash-cowork': {
          command: 'npx',
          args: ['@helmdash/cowork', 'mcp'],
        },
      },
    };
    fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2) + '\n', 'utf8');
    console.log(pc.green('   ✓ Configuration MCP (.mcp.json) générée pour Claude.'));
  }

  console.log(pc.bold(pc.green('\n✅ Helmdash Cowork configuré avec succès !')));
  console.log(pc.bold('\nProchaines étapes :'));
  console.log(` 1. Lancez Claude Code et tapez ${pc.cyan('/cowork-onboard')} pour débuter l'interview de cadrage.`);
  console.log(` 2. Ouvrez le dashboard Kanban local avec : ${pc.cyan('npx @helmdash/cowork ui')}`);
  console.log(` 3. Connectez Claude Desktop avec le serveur MCP : ${pc.cyan('npx @helmdash/cowork mcp')}`);
  console.log(` 4. Consultez le résumé rapide avec : ${pc.cyan('npx @helmdash/cowork status')}\n`);
}
