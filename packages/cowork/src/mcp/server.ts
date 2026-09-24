import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import {
  getProjectHealth,
  getProjectContext,
  getTasks,
  addTask,
  updateTaskStatus,
  addDecision,
} from './tools';

export function createMcpServer(projectDir: string = process.cwd()): Server {
  const server = new Server(
    {
      name: 'helmdash-cowork',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'cowork_get_project_health',
          description: 'Affiche un bilan complet du projet (nom, jalon MVP et compte à rebours, répartition Kanban, focus Top 3, décisions ouvertes).',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'cowork_get_project_context',
          description: 'Retourne le document de contexte complet du projet (Lean Canvas, proposition de valeur, ICP et profil fondateur).',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'cowork_get_tasks',
          description: 'Liste les tâches du Kanban de projet avec possibilité de filtrer par statut.',
          inputSchema: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['backlog', 'todo', 'in_progress', 'blocked', 'done'],
                description: 'Filtre optionnel sur le statut de la tâche',
              },
            },
          },
        },
        {
          name: 'cowork_add_task',
          description: 'Ajoute une tâche au Kanban du projet et synchronise le calendrier iCal (.cowork/calendar.ics).',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Titre de la tâche' },
              category: {
                type: 'string',
                enum: ['Tech', 'Growth', 'Product', 'CFO', 'Admin'],
                description: 'Catégorie de la tâche',
              },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical'],
                description: 'Niveau de priorité',
              },
              dueDate: { type: 'string', description: 'Date d\'échéance au format YYYY-MM-DD' },
              reminderDate: { type: 'string', description: 'Date de rappel au format YYYY-MM-DD' },
              notes: { type: 'string', description: 'Notes complémentaires' },
            },
            required: ['title'],
          },
        },
        {
          name: 'cowork_update_task_status',
          description: 'Met à jour le statut d\'une tâche (ex: passer à done quand une implémentation est terminée).',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: { type: 'string', description: 'ID de la tâche (ex: task-1)' },
              status: {
                type: 'string',
                enum: ['backlog', 'todo', 'in_progress', 'blocked', 'done'],
                description: 'Nouveau statut',
              },
            },
            required: ['taskId', 'status'],
          },
        },
        {
          name: 'cowork_add_decision',
          description: 'Consigne un choix stratégique ou un arbitrage technique dans le Decision Log (.cowork/decisions.csv).',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Intitulé de la décision' },
              context: { type: 'string', description: 'Contexte ou problème ayant nécessité cet arbitrage' },
              chosenOption: { type: 'string', description: 'Solution ou choix retenu' },
              tradeOffs: { type: 'string', description: 'Compromis ou contreparties acceptées' },
              status: {
                type: 'string',
                enum: ['open', 'decided', 'superseded'],
                description: 'Statut de la décision',
              },
            },
            required: ['title'],
          },
        },
      ],
    };
  });

  // Call tool handlers
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      switch (name) {
        case 'cowork_get_project_health': {
          const health = getProjectHealth(projectDir);
          return {
            content: [{ type: 'text', text: JSON.stringify(health, null, 2) }],
          };
        }

        case 'cowork_get_project_context': {
          const context = getProjectContext(projectDir);
          return {
            content: [{ type: 'text', text: context }],
          };
        }

        case 'cowork_get_tasks': {
          const status = typeof args.status === 'string' ? args.status : undefined;
          const tasks = getTasks(projectDir, status);
          return {
            content: [{ type: 'text', text: JSON.stringify(tasks, null, 2) }],
          };
        }

        case 'cowork_add_task': {
          const title = String(args.title || '');
          const task = addTask(projectDir, {
            title,
            category: args.category as any,
            priority: args.priority as any,
            dueDate: args.dueDate as any,
            reminderDate: args.reminderDate as any,
            notes: args.notes as any,
          });
          return {
            content: [
              {
                type: 'text',
                text: `Tâche [${task.id}] "${task.title}" ajoutée avec succès et calendrier actualisé.`,
              },
            ],
          };
        }

        case 'cowork_update_task_status': {
          const taskId = String(args.taskId || '');
          const status = args.status as any;
          const task = updateTaskStatus(projectDir, { taskId, status });
          return {
            content: [
              {
                type: 'text',
                text: `Tâche [${task.id}] mise à jour avec le statut "${task.status}".`,
              },
            ],
          };
        }

        case 'cowork_add_decision': {
          const title = String(args.title || '');
          const decision = addDecision(projectDir, {
            title,
            context: args.context as any,
            chosenOption: args.chosenOption as any,
            tradeOffs: args.tradeOffs as any,
            status: args.status as any,
          });
          return {
            content: [
              {
                type: 'text',
                text: `Décision [${decision.id}] "${decision.title}" consignée avec succès dans decisions.csv.`,
              },
            ],
          };
        }

        default:
          return {
            isError: true,
            content: [{ type: 'text', text: `Outil inconnu : ${name}` }],
          };
      }
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Erreur d'exécution de l'outil ${name} : ${err.message}` }],
      };
    }
  });

  return server;
}

export async function runMcpServer(projectDir: string = process.cwd()): Promise<void> {
  const server = createMcpServer(projectDir);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
