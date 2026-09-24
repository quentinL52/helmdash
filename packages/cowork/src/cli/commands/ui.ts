import * as path from 'path';
import * as fs from 'fs';
import pc from 'picocolors';
import { startLocalServer } from '../../server/local-server';
import { CoworkConfigSchema } from '../../types';

export function runUi(options: { port?: number; targetDir?: string }): void {
  const targetDir = options.targetDir || process.cwd();
  const coworkDir = path.join(targetDir, '.cowork');

  if (!fs.existsSync(coworkDir)) {
    console.log(pc.red('✗ Aucun dossier .cowork/ trouvé dans ce projet.'));
    console.log(`  Exécutez ${pc.cyan('npx @helmdash/cowork init')} d'abord pour configurer le projet.`);
    return;
  }

  let port = options.port || 3333;
  let idleTimeoutMinutes = 15;
  const configFile = path.join(coworkDir, 'config.json');
  if (fs.existsSync(configFile)) {
    try {
      const cfg = CoworkConfigSchema.parse(JSON.parse(fs.readFileSync(configFile, 'utf8')));
      if (!options.port) port = cfg.port;
      if (cfg.idleTimeoutMinutes !== undefined) idleTimeoutMinutes = cfg.idleTimeoutMinutes;
    } catch {
      // Fallback
    }
  }

  const server = startLocalServer(targetDir, port, idleTimeoutMinutes);

  console.log(pc.bold(pc.green('\n🚀 Helmdash Cowork Dashboard en ligne !')));
  console.log(`\n  👉 Ouvrez votre navigateur sur : ${pc.bold(pc.cyan(`http://localhost:${port}`))}\n`);
  console.log(pc.dim('  - Kanban interactif drag-and-drop'));
  console.log(pc.dim('  - Compte à rebours du Jalon MVP'));
  console.log(pc.dim('  - Journal des décisions et hypothèses'));
  console.log(pc.dim('  - Flux iCal synchronisé en temps réel (.cowork/calendar.ics)'));
  if (idleTimeoutMinutes > 0) {
    console.log(pc.dim(`  - Arrêt automatique éphémère après ${idleTimeoutMinutes} min d'inactivité (RAM préservée)\n`));
  } else {
    console.log('');
  }
  console.log(pc.dim('Appuyez sur Ctrl+C pour arrêter le serveur.'));

  // Keep alive
  process.on('SIGINT', () => {
    console.log(pc.dim('\nArrêt du serveur Helmdash Cowork...'));
    server.close();
    process.exit(0);
  });
}
