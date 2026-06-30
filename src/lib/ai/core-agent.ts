// @ts-nocheck
import { z } from 'zod';
import { tool } from 'ai';
import { memory } from './memory/obsidian-memory';

/**
 * Définit les outils natifs de l'Agent Central (Founder OS Core).
 * Ces outils sont utilisés via Function Calling par le LLM.
 */
export const buildCoreTools = (userId: string) => {
  return {
    read_dashboard_tab: tool({
      description: "Lit les données d'un onglet spécifique du dashboard (ex: finances, hypotheses, gtm).",
      parameters: z.object({
        tabName: z.enum(['finances', 'hypotheses', 'gtm', 'crm', 'roadmap', 'canvas']),
      }),
      // @ts-ignore
      execute: async (args: any) => {
        const { tabName } = args;
        // Logique simulée pour lire la DB en fonction de l'onglet
        // TODO: Implémenter les requêtes Prisma vers la base de données réelle
        return {
          tab: tabName,
          data: `Données mockées pour ${tabName}. L'intégration Prisma viendra ici.`,
          timestamp: new Date().toISOString(),
        };
      },
    }),

    write_dashboard_tab: tool({
      description: "Crée ou met à jour une donnée dans un onglet du dashboard.",
      parameters: z.object({
        tabName: z.enum(['finances', 'hypotheses', 'gtm', 'crm', 'roadmap', 'canvas']),
        action: z.enum(['create', 'update', 'delete']),
        data: z.record(z.any()).describe('Les données à modifier ou créer (JSON).'),
      }),
      execute: async (args: any) => {
        const { tabName, action, data } = args;
        // TODO: Implémenter les requêtes Prisma pour écrire dans la base de données
        return {
          success: true,
          message: `Action '${action}' effectuée avec succès sur '${tabName}'.`,
        };
      },
    }),

    query_memory: tool({
      description: "Recherche sémantique dans la mémoire vectorielle de l'utilisateur (Obsidian-like). Utile pour retrouver des notes, des décisions ou des insights passés.",
      parameters: z.object({
        query: z.string().describe('La recherche textuelle ou la question.'),
        limit: z.number().optional().default(5),
      }),
      execute: async (args: any) => {
        const { query, limit } = args;
        const results = await memory.search(userId, query, { limit });
        return { results };
      },
    }),

    write_memory: tool({
      description: "Ajoute ou met à jour une note, une idée ou un apprentissage dans la mémoire vectorielle.",
      parameters: z.object({
        content: z.string().describe('Le contenu en markdown de la note.'),
        type: z.enum(['journal', 'decision', 'insight', 'meeting', 'research', 'template']),
        tags: z.array(z.string()).optional(),
      }),
      execute: async (args: any) => {
        const { content, type, tags } = args;
        await memory.upsertNote({
          userId,
          content,
          type,
          tags: tags || [],
          source: 'agent',
        });
        return { success: true, message: 'Note sauvegardée dans la mémoire.' };
      },
    }),

    spawn_sub_agent: tool({
      description: "Délègue une tâche complexe à un sous-agent spécialisé (PM, CFO, Growth, etc.).",
      parameters: z.object({
        agentRole: z.enum(['pm', 'cfo', 'growth', 'legal', 'tech_lead', 'research', 'content', 'recruiting']),
        taskObjective: z.string().describe('L\'objectif clair et mesurable de la tâche.'),
      }),
      execute: async (args: any) => {
        const { agentRole, taskObjective } = args;
        // Logique de spawn de sous-agent (Hermes ou custom)
        // TODO: Implémenter la délégation asynchrone
        return {
          status: 'delegated',
          subAgentId: `${agentRole}-${Date.now()}`,
          message: `Tâche déléguée à l'agent ${agentRole}: ${taskObjective}`,
        };
      },
    }),
    
    // Autres outils (stub)
    schedule_recurring: tool({
      description: "Planifie une tâche récurrente ou un cron job interne.",
      parameters: z.object({
        taskName: z.string(),
        schedule: z.string().describe('Expression Cron.'),
      }),
      // @ts-ignore
      execute: async (args: any) => { const { taskName, schedule } = args; return { success: true }; },
    }),
  };
};

export class CoreAgent {
  constructor(private userId: string) {}

  getTools() {
    return buildCoreTools(this.userId);
  }

  async buildSystemPrompt(): Promise<string> {
    // Extraire le contexte via la mémoire si besoin
    const recentContext = await memory.buildContextWindow(this.userId, 'startup strategy objectives', 1000);
    
    return `Tu es le Founder OS Core Agent. Ton rôle est d'assister le fondateur dans la gestion de sa startup.
Tu as accès à une mémoire vectorielle et à des onglets de dashboard via tes outils.
Sois proactif, concis, et business-oriented.

Contexte récent de la mémoire :
${recentContext}
`;
  }
}
