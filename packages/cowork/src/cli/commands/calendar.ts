import * as path from 'path';
import * as fs from 'fs';
import pc from 'picocolors';
import { readTasks } from '../../core/csv-engine';
import { writeCalendar } from '../../core/ical-builder';
import { CoworkConfigSchema } from '../../types';

export function runSyncCalendar(targetDir: string = process.cwd()): void {
  const coworkDir = path.join(targetDir, '.cowork');
  const tasksFile = path.join(coworkDir, 'tasks.csv');
  const configFile = path.join(coworkDir, 'config.json');
  const calendarFile = path.join(coworkDir, 'calendar.ics');

  if (!fs.existsSync(coworkDir)) {
    console.log(pc.red('✗ Aucun dossier .cowork/ trouvé. Exécutez d\'abord `npx @helmdash/cowork init`.'));
    return;
  }

  const tasks = readTasks(tasksFile);
  let config = { projectName: path.basename(targetDir), mvpTargetDate: null as string | null };
  if (fs.existsSync(configFile)) {
    try {
      config = CoworkConfigSchema.parse(JSON.parse(fs.readFileSync(configFile, 'utf8')));
    } catch {
      // Fallback
    }
  }

  writeCalendar(calendarFile, tasks, config as any);

  const timedTasks = tasks.filter(t => t.dueDate || t.reminderDate);
  console.log(pc.green(`✓ Fichier de calendrier .cowork/calendar.ics régénéré avec succès.`));
  console.log(`  📅 Événements planifiés : ${pc.bold(timedTasks.length)} deadlines/rappels de tâches.`);
  if (config.mvpTargetDate) {
    console.log(`  🚀 Jalon MVP programmé : ${pc.yellow(config.mvpTargetDate)}`);
  }
}
