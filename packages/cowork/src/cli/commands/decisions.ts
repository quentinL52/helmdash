import * as path from 'path';
import pc from 'picocolors';
import { readDecisions, writeDecisions } from '../../core/csv-engine';
import { Decision, DecisionStatus } from '../../types';

export function runListDecisions(targetDir: string = process.cwd()): void {
  const coworkDir = path.join(targetDir, '.cowork');
  const decisionsFile = path.join(coworkDir, 'decisions.csv');
  const decisions = readDecisions(decisionsFile);

  if (decisions.length === 0) {
    console.log(pc.dim('Aucune décision enregistrée dans .cowork/decisions.csv.'));
    return;
  }

  console.log(pc.bold(`\n⚖️  Journal des Décisions (${decisions.length}) :\n`));
  decisions.forEach(d => {
    const sColor = d.status === 'decided' ? pc.green : d.status === 'open' ? pc.yellow : pc.dim;
    console.log(`  ${pc.dim(d.id)} [${sColor(d.status.toUpperCase())}] ${pc.bold(d.title)} ${pc.dim(`(${d.date})`)}`);
    if (d.chosenOption) {
      console.log(`     ${pc.dim('Option choisie :')} ${d.chosenOption}`);
    }
    if (d.tradeOffs) {
      console.log(`     ${pc.dim('Compromis :')} ${pc.dim(d.tradeOffs)}`);
    }
  });
  console.log();
}

export function runAddDecision(
  title: string,
  options: {
    status?: string;
    context?: string;
    chosenOption?: string;
    tradeOffs?: string;
    targetDir?: string;
  }
): void {
  const targetDir = options.targetDir || process.cwd();
  const coworkDir = path.join(targetDir, '.cowork');
  const decisionsFile = path.join(coworkDir, 'decisions.csv');
  const decisions = readDecisions(decisionsFile);

  const newId = `dec-${decisions.length + 1}`;
  const newDecision: Decision = {
    id: newId,
    date: new Date().toISOString().slice(0, 10),
    title: title.trim(),
    status: (options.status as DecisionStatus) || 'decided',
    context: options.context || '',
    chosenOption: options.chosenOption || '',
    tradeOffs: options.tradeOffs || '',
    revisitDate: '',
  };

  decisions.push(newDecision);
  writeDecisions(decisionsFile, decisions);

  console.log(pc.green(`✓ Décision [${newId}] enregistrée : "${title}"`));
}
