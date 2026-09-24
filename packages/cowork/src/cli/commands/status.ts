import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import { readTasks, readDecisions, readHypotheses } from '../../core/csv-engine';
import { CoworkConfigSchema } from '../../types';

export function runStatus(targetDir: string = process.cwd()): void {
  const coworkDir = path.join(targetDir, '.cowork');
  if (!fs.existsSync(coworkDir)) {
    console.log(pc.red('✗ Aucun dossier .cowork/ trouvé dans ce projet.'));
    console.log(`  Exécutez ${pc.cyan('npx @helmdash/cowork init')} pour démarrer.`);
    return;
  }

  const configFile = path.join(coworkDir, 'config.json');
  let config = { projectName: path.basename(targetDir), mvpTargetDate: null as string | null };
  if (fs.existsSync(configFile)) {
    try {
      config = CoworkConfigSchema.parse(JSON.parse(fs.readFileSync(configFile, 'utf8')));
    } catch {
      // Use fallback
    }
  }

  const tasks = readTasks(path.join(coworkDir, 'tasks.csv'));
  const decisions = readDecisions(path.join(coworkDir, 'decisions.csv'));
  const hypotheses = readHypotheses(path.join(coworkDir, 'hypotheses.csv'));

  console.log(pc.bold(`\n📊 État du projet : `) + pc.cyan(pc.bold(config.projectName)));

  // MVP Countdown
  if (config.mvpTargetDate) {
    const diffDays = Math.ceil((new Date(config.mvpTargetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      console.log(`⏱️  Jalon MVP : ` + pc.yellow(pc.bold(`J-${diffDays}`)) + pc.dim(` (${config.mvpTargetDate})`));
    } else {
      console.log(`⏱️  Jalon MVP : ` + pc.red(pc.bold(`Échue`)) + pc.dim(` (${config.mvpTargetDate})`));
    }
  } else {
    console.log(`⏱️  Jalon MVP : ` + pc.dim(`Non définie (à définir lors du cadrage)`));
  }

  // Tasks breakdown
  const counts = { backlog: 0, todo: 0, in_progress: 0, blocked: 0, done: 0 };
  for (const t of tasks) {
    if (counts[t.status] !== undefined) counts[t.status]++;
  }

  console.log('\n📋 ' + pc.bold('Kanban des tâches :'));
  console.log(`   Backlog : ${pc.dim(counts.backlog)} | À faire : ${pc.blue(counts.todo)} | En cours : ${pc.yellow(counts.in_progress)} | Bloqué : ${pc.red(counts.blocked)} | Terminé : ${pc.green(counts.done)}`);

  // Top 3 Focus
  const pending = tasks.filter(t => t.status !== 'done');
  const priorityWeight: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  pending.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));

  const top3 = pending.slice(0, 3);
  if (top3.length > 0) {
    console.log('\n🎯 ' + pc.bold('Focus prioritaire (Top 3) :'));
    top3.forEach((t, i) => {
      const pColor = t.priority === 'critical' ? pc.red : t.priority === 'high' ? pc.yellow : pc.dim;
      console.log(`   ${i + 1}. [${pColor(t.priority.toUpperCase())}] ${t.title} ${t.dueDate ? pc.dim(`(📅 ${t.dueDate})`) : ''}`);
    });
  }

  // Open decisions & hypotheses
  const openDecisions = decisions.filter(d => d.status === 'open');
  console.log(`\n⚖️  Décisions : ${pc.bold(decisions.length)} total (${pc.yellow(openDecisions.length)} ouvertes/dilemmes)`);
  console.log(`💡 Hypothèses : ${pc.bold(hypotheses.length)} suivies (${pc.green(hypotheses.filter(h => h.status === 'validated').length)} validées)`);

  console.log(pc.dim(`\nPour ouvrir l'interface visuelle : `) + pc.cyan('npx @helmdash/cowork ui\n'));
}
