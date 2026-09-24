import pc from 'picocolors';
import { runInit } from './commands/init';
import { runStatus } from './commands/status';
import { runListTasks, runAddTask, runCompleteTask } from './commands/tasks';
import { runListDecisions, runAddDecision } from './commands/decisions';
import { runSyncCalendar } from './commands/calendar';
import { runUi } from './commands/ui';

export function runCli(args: string[] = process.argv.slice(2)): void {
  const command = args[0] || 'help';

  const getOption = (name: string, alias?: string): string | undefined => {
    for (let i = 0; i < args.length; i++) {
      if (args[i] === `--${name}` || (alias && args[i] === `-${alias}`)) {
        return args[i + 1];
      }
    }
    return undefined;
  };

  const hasFlag = (name: string, alias?: string): boolean => {
    return args.some(a => a === `--${name}` || (alias && a === `-${alias}`));
  };

  switch (command) {
    case 'init': {
      const force = hasFlag('force', 'f');
      runInit(process.cwd(), force);
      break;
    }

    case 'status': {
      runStatus(process.cwd());
      break;
    }

    case 'tasks': {
      const sub = args[1] || 'list';
      if (sub === 'list') {
        const statusFilter = getOption('status', 's');
        runListTasks(process.cwd(), statusFilter);
      } else if (sub === 'add') {
        const title = args[2];
        if (!title) {
          console.log(pc.red('✗ Erreur : Titre de la tâche requis. Exemple: cowork tasks add "Ma tâche"'));
          return;
        }
        runAddTask(title, {
          category: getOption('category', 'c'),
          priority: getOption('priority', 'p'),
          dueDate: getOption('due', 'd'),
          reminderDate: getOption('reminder', 'r'),
          assignedAgent: getOption('agent', 'a'),
          notes: getOption('notes', 'n'),
        });
      } else if (sub === 'done') {
        const taskId = args[2];
        if (!taskId) {
          console.log(pc.red('✗ Erreur : ID de la tâche requis. Exemple: cowork tasks done task-1'));
          return;
        }
        runCompleteTask(taskId, process.cwd());
      } else {
        console.log(pc.red(`✗ Sous-commande inconnue pour tasks : "${sub}". Utilisez list, add, ou done.`));
      }
      break;
    }

    case 'decisions': {
      const sub = args[1] || 'list';
      if (sub === 'list') {
        runListDecisions(process.cwd());
      } else if (sub === 'add') {
        const title = args[2];
        if (!title) {
          console.log(pc.red('✗ Erreur : Titre de la décision requis. Exemple: cowork decisions add "Mon choix"'));
          return;
        }
        runAddDecision(title, {
          status: getOption('status', 's'),
          context: getOption('context', 'c'),
          chosenOption: getOption('option', 'o'),
          tradeOffs: getOption('trade-offs', 't'),
        });
      } else {
        console.log(pc.red(`✗ Sous-commande inconnue pour decisions : "${sub}". Utilisez list ou add.`));
      }
      break;
    }

    case 'calendar': {
      runSyncCalendar(process.cwd());
      break;
    }

    case 'mcp': {
      const { runMcpServer } = require('../mcp/server');
      runMcpServer(process.cwd()).catch((err: any) => {
        console.error('Erreur lancement serveur MCP:', err);
        process.exit(1);
      });
      break;
    }

    case 'ui':
    case 'dashboard': {
      const portStr = getOption('port', 'p');
      const port = portStr ? parseInt(portStr, 10) : undefined;
      runUi({ port });
      break;
    }

    case 'help':
    case '--help':
    case '-h':
    default: {
      console.log(pc.bold(pc.cyan('\nHelmdash Cowork CLI')) + pc.dim(' (v0.1.0)'));
      console.log(pc.dim('Module compagnon local pour Solopreneurs & Claude Cowork\n'));
      console.log(pc.bold('Commandes :'));
      console.log(`  ${pc.green('init')} [-f, --force]              Initialise .cowork/ et configure CLAUDE.md`);
      console.log(`  ${pc.green('status')}                        Affiche l'avancement, le Kanban et le jalon MVP`);
      console.log(`  ${pc.green('ui')} [--port <number>]          Lance le dashboard web local sur :3333`);
      console.log(`  ${pc.green('mcp')}                           Démarre le serveur MCP Stdio pour Claude Desktop & IDE`);
      console.log(`  ${pc.green('calendar')}                      Régénère le fichier standardisé .cowork/calendar.ics`);
      console.log(`  ${pc.green('tasks list')} [-s <status>]      Liste les tâches du Kanban`);
      console.log(`  ${pc.green('tasks add')} <title> [options]   Ajoute une nouvelle tâche (-p, -c, -d)`);
      console.log(`  ${pc.green('tasks done')} <taskId>           Marque une tâche comme terminée`);
      console.log(`  ${pc.green('decisions list')}                Liste les décisions du Decision Log`);
      console.log(`  ${pc.green('decisions add')} <title> [opts]  Enregistre un choix stratégique ou technique`);
      console.log(`  ${pc.green('help')}                          Affiche cette aide\n`);
      break;
    }
  }
}
