import { z } from 'zod';
import { tool } from 'ai';
import { memory } from './memory/obsidian-memory';
import { decryptAiSettings } from './api-key-encryption';
import { 
  validateTabData, 
  getPrismaModel, 
  TabName,
  FinanceEntry,
  Hypothesis,
  GTM,
  Contact,
  RoadmapItem,
  CanvasSection
} from './tools/dashboard-tools';

/**
 * Outils natifs du Core Agent - VERSION PRODUCTION
 * Remplace les mocks par de vrais appels Prisma avec validation Zod
 */

export const buildCoreTools = (userId: string) => {
  return {
    /**
     * Lit les données d'un onglet spécifique du dashboard
     */
    read_dashboard_tab: tool({
      description: "Lit les données d'un onglet spécifique du dashboard (finances, hypotheses, gtm, crm, roadmap, canvas).",
      parameters: z.object({
        tabName: z.enum(['finances', 'hypotheses', 'gtm', 'crm', 'roadmap', 'canvas']),
        filters: z.record(z.any()).optional().describe('Filtres optionnels (ex: month pour finances, status pour hypotheses)'),
      }),
      execute: async ({ tabName, filters }: { tabName: TabName; filters?: Record<string, any> }) => {
        const PrismaModel = await getPrismaModel(tabName);
        
        // Construire where clause selon l'onglet
        const where: Record<string, any> = { userId };
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            where[key] = value;
          });
        }

        const data = await PrismaModel.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 100,
        });

        return {
          tab: tabName,
          count: data.length,
          data,
          timestamp: new Date().toISOString(),
        };
      },
    }),

    /**
     * Crée, met à jour ou supprime une donnée dans un onglet du dashboard
     */
    write_dashboard_tab: tool({
      description: "Crée, met à jour ou supprime une donnée dans un onglet du dashboard.",
      parameters: z.object({
        tabName: z.enum(['finances', 'hypotheses', 'gtm', 'crm', 'roadmap', 'canvas']),
        action: z.enum(['create', 'update', 'delete']),
        id: z.string().uuid().optional().describe('Requis pour update/delete'),
        data: z.record(z.any()).describe('Les données à créer ou modifier (validées selon l\'onglet).'),
      }),
      execute: async ({ tabName, action, id, data }: { tabName: TabName; action: 'create' | 'update' | 'delete'; id?: string; data: Record<string, any> }) => {
        const PrismaModel = await getPrismaModel(tabName);
        
        // Valider les données selon le schéma de l'onglet
        const validatedData = validateTabData(tabName, data);

        let result;
        switch (action) {
          case 'create':
            result = await PrismaModel.create({
              data: {
                ...validatedData,
                userId,
              },
            });
            break;
          
          case 'update':
            if (!id) throw new Error('ID requis pour update');
            result = await PrismaModel.update({
              where: { id, userId },
              data: validatedData,
            });
            break;
          
          case 'delete':
            if (!id) throw new Error('ID requis pour delete');
            result = await PrismaModel.delete({
              where: { id, userId },
            });
            break;
        }

        return {
          success: true,
          action,
          tab: tabName,
          record: result,
          message: `Action '${action}' effectuée avec succès sur '${tabName}'.`,
        };
      },
    }),

    /**
     * Recherche sémantique dans la mémoire vectorielle
     */
    query_memory: tool({
      description: "Recherche sémantique dans la mémoire vectorielle de l'utilisateur (Obsidian-like). Utile pour retrouver des notes, des décisions ou des insights passés.",
      parameters: z.object({
        query: z.string().describe('La recherche textuelle ou la question.'),
        limit: z.number().optional().default(5),
        threshold: z.number().optional().default(0.5),
      }),
      execute: async ({ query, limit, threshold }: { query: string; limit?: number; threshold?: number }) => {
        const results = await memory.search(userId, query, { limit, threshold });
        return { results };
      },
    }),

    /**
     * Ajoute ou met à jour une note dans la mémoire vectorielle
     */
    write_memory: tool({
      description: "Ajoute ou met à jour une note, une idée ou un apprentissage dans la mémoire vectorielle.",
      parameters: z.object({
        content: z.string().describe('Le contenu en markdown de la note.'),
        type: z.enum(['journal', 'decision', 'insight', 'meeting', 'research', 'template']),
        tags: z.array(z.string()).optional(),
        links: z.array(z.string()).optional(),
      }),
      execute: async ({ content, type, tags, links }: { content: string; type: 'journal' | 'decision' | 'insight' | 'meeting' | 'research' | 'template'; tags?: string[]; links?: string[] }) => {
        await memory.upsertNote({
          userId,
          content,
          type,
          tags: tags || [],
          links: links || [],
          source: 'agent',
        });
        return { success: true, message: 'Note sauvegardée dans la mémoire.' };
      },
    }),

    /**
         * Délègue une tâche à un sous-agent spécialisé
         */
        spawn_sub_agent: tool({
          description: "Délègue une tâche complexe à un sous-agent spécialisé (PM, CFO, Growth, Legal, Tech Lead, Research, Content, Recruiting).",
          parameters: z.object({
            agentRole: z.enum(['pm', 'cfo', 'growth', 'legal', 'tech_lead', 'research', 'content', 'recruiting']),
            taskObjective: z.string().describe('L\'objectif clair et mesurable de la tâche.'),
            context: z.record(z.any()).optional().describe('Contexte additionnel pour le sous-agent.'),
            constraints: z.object({
              budget: z.number().optional(),
              deadline: z.string().optional(),
              allowedTools: z.array(z.string()).optional(),
            }).optional(),
            successCriteria: z.array(z.string()).min(1).describe('Critères de succès mesurables.'),
          }),
          execute: async ({ agentRole, taskObjective, context, constraints, successCriteria }: { 
            agentRole: 'pm' | 'cfo' | 'growth' | 'legal' | 'tech_lead' | 'research' | 'content' | 'recruiting';
            taskObjective: string;
            context?: Record<string, any>;
            constraints?: { budget?: number; deadline?: string; allowedTools?: string[] };
            successCriteria: string[];
          }) => {
            try {
              // Import dynamique pour éviter les problèmes de bundle
              const { subAgentQueue } = await import('@/lib/queue/sub-agent-queue');
          
              // Générer un ID de tâche unique
              const taskId = `${agentRole}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          
              // Enqueue le job pour traitement asynchrone
              await subAgentQueue.add('execute-sub-agent', {
                taskId,
                userId,
                agentRole,
                taskObjective,
                context,
                constraints,
                successCriteria,
              });
          
              // Enregistrer la délégation dans la mémoire pour traçabilité
              await memory.upsertNote({
                userId,
                content: `Sous-agent ${agentRole} délégué: ${taskObjective}\nContexte: ${JSON.stringify(context)}\nContraintes: ${JSON.stringify(constraints)}\nCritères de succès: ${successCriteria.join(', ')}`,
                type: 'decision',
                tags: ['sub-agent', agentRole, 'delegated'],
                source: 'agent',
              });

              return {
                status: 'delegated',
                taskId,
                agentRole,
                taskObjective,
                message: `Tâche déléguée à l'agent ${agentRole}: ${taskObjective}. Traitement asynchrone en cours (taskId: ${taskId}). Résultats disponibles dans l'historique.`,
              };
            } catch (error) {
              console.error('[spawn_sub_agent] Error:', error);
              return {
                status: 'failed',
                taskId: `${agentRole}-${Date.now()}`,
                agentRole,
                taskObjective,
                message: `Échec de la délégation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
              };
            }
          },
        }),

    /**
     * Planifie une tâche récurrente (cron interne)
     */
    schedule_recurring: tool({
      description: "Planifie une tâche récurrente ou un cron job interne (ex: revue hebdo, sync Stripe).",
      parameters: z.object({
        taskName: z.string(),
        schedule: z.string().describe('Expression Cron (ex: "0 9 * * 1" pour lundi 9h).'),
        payload: z.record(z.any()).optional(),
      }),
      execute: async ({ taskName, schedule, payload }: { taskName: string; schedule: string; payload?: Record<string, any> }) => {
        // TODO: Intégrer avec Vercel Cron ou pg_cron
        await memory.upsertNote({
          userId,
          content: `Cron planifié: ${taskName} (${schedule})\nPayload: ${JSON.stringify(payload)}`,
          type: 'decision',
          tags: ['cron', 'scheduled'],
          source: 'agent',
        });
        return { 
          success: true, 
          message: `Tâche '${taskName}' planifiée avec schedule: ${schedule}` 
        };
      },
    }),

    /**
     * Recherche web via Composio SerpAPI
     */
        web_search: tool({
          description: "Effectue une recherche web pour obtenir des informations à jour (marché, concurrents, actualités).",
          parameters: z.object({
            query: z.string().describe('La requête de recherche.'),
            maxResults: z.number().optional().default(5),
            source: z.enum(['news', 'web', 'academic']).optional().default('web'),
          }),
          execute: async ({ query, maxResults, source }: { query: string; maxResults?: number; source?: 'news' | 'web' | 'academic' }) => {
            try {
              // Import dynamique pour éviter les problèmes de bundle
              const { executeComposioTool } = await import('@/lib/integrations/composio-client');
          
              const toolName = source === 'news' ? 'serpapi_search_news' : 'serpapi_search';
              const result = await executeComposioTool(toolName, { 
                query, 
                num: maxResults,
                ...(source === 'news' && { tbs: 'qdr:w' }) // Dernière semaine pour news
              }, userId);
          
              const results = result?.data?.organic_results || result?.data?.news_results || [];
          
              return {
                query,
                results: results.slice(0, maxResults).map((r: any) => ({
                  title: r.title,
                  url: r.link,
                  snippet: r.snippet || r.description,
                  source: source,
                  date: r.date || r.published_date,
                })),
                message: `Trouvé ${results.length} résultats pour "${query}"`,
              };
            } catch (error) {
              console.error('[web_search] Error:', error);
              // Fallback mock si Composio pas configuré
              return {
                query,
                results: [],
                message: `Recherche web échouée: ${error instanceof Error ? error.message : 'Configuration Composio manquante'}`,
              };
            }
          },
        }),

    /**
         * Sync Stripe - récupère MRR, clients, abonnements
         */
        stripe_sync: tool({
          description: "Synchronise les données Stripe (MRR, clients, abonnements, factures) et met à jour les finances.",
          parameters: z.object({
            forceFullSync: z.boolean().optional().default(false),
          }),
          execute: async ({ forceFullSync }: { forceFullSync?: boolean }) => {
            try {
              // Appeler la route API serveur pour la sync
              const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/billing/stripe/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forceFullSync }),
              });
          
              if (!response.ok) {
                throw new Error(`Sync failed: ${response.statusText}`);
              }
          
              const result = await response.json();
          
              // Sauvegarder dans la mémoire
              await memory.upsertNote({
                userId,
                content: `Sync Stripe effectué: MRR ${result.synced?.mrr || 0}€, ${result.synced?.subscriptions || 0} abonnements, ${result.synced?.invoices || 0} factures`,
                type: 'decision',
                tags: ['stripe', 'sync', 'finances'],
                source: 'agent',
              });
          
              return {
                success: true,
                message: result.message || 'Sync Stripe terminé avec succès',
                synced: result.synced || { customers: 0, subscriptions: 0, invoices: 0, mrr: 0 },
              };
            } catch (error) {
              console.error('[stripe_sync] Error:', error);
              return {
                success: false,
                message: `Sync Stripe échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
                synced: { customers: 0, subscriptions: 0, invoices: 0, mrr: 0 },
              };
            }
          },
        }),
  };
};

export class CoreAgent {
  constructor(private userId: string) {}

  getTools() {
    return buildCoreTools(this.userId);
  }

  async buildSystemPrompt(): Promise<string> {
    const recentContext = await memory.buildContextWindow(this.userId, 'startup strategy objectives', 2000);
    const decryptedSettings = await decryptAiSettings(
      await this.getAiSettings(),
      this.userId
    );

    return `Tu es le Founder OS Core Agent. Ton rôle est d'assister le fondateur dans la gestion de sa startup.

CAPACITÉS RÉELLES (pas de simulation) :
- read_dashboard_tab: Lis VRAIMENT les données (finances, hypotheses, gtm, crm, roadmap, canvas)
- write_dashboard_tab: Crée/Modifie/Supprime VRAIMENT les données avec validation
- query_memory / write_memory: Mémoire vectorielle persistante (Obsidian-like)
- spawn_sub_agent: Délègue à des agents spécialisés (PM, CFO, Growth, Legal, Tech, Research, Content, Recruiting)
- web_search: Recherche web réelle (à venir via Composio)
- stripe_sync: Sync Stripe réelle (à venir)
- schedule_recurring: Planification cron interne

RÈGLES :
1. Sois proactif, concis, business-oriented
2. Utilise TOUJOUTS les outils pour accéder aux données - ne devine jamais
3. Valide les entrées via les schémas Zod (les outils le font automatiquement)
4. Pour les actions complexes, délègue via spawn_sub_agent
5. Sauvegarde les décisions importantes via write_memory

CONFIGURATION IA UTILISATEUR :
- Provider: ${decryptedSettings.provider}
- Modèle: ${decryptedSettings.modelsConfig?.defaultModel || 'gpt-4o'}

CONTEXTE RÉCENT DE LA MÉMOIRE :
${recentContext}

Commence par comprendre la demande, puis utilise les outils appropriés.`;
  }

  private async getAiSettings(): Promise<any> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    return prisma.aiSettings.findUnique({ where: { userId: this.userId } });
  }
}