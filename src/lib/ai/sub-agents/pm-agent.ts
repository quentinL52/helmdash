import { BaseSubAgent, SubAgentContext } from './base-agent';
import { getModelForAgent, UserModelsConfig } from '../provider-registry';
import { executeComposioTool } from '@/lib/integrations/composio-client';
import { memory } from '@/lib/ai/memory/obsidian-memory';

export class PMAgent extends BaseSubAgent {
  async execute(): Promise<any> {
    try {
      // Phase 1: Analyser le contexte produit (roadmap, hypothèses, feedback)
      const productContext = await this.gatherProductContext();
      
      // Phase 2: Générer des spécifications / tickets
      const deliverables = await this.generateDeliverables(productContext);
      
      // Phase 3: Créer tickets Linear/GitHub
      await this.createExternalTickets(deliverables);
      
      return this.buildResult('success');
    } catch (error) {
      this.logInsight(`Erreur PM: ${error instanceof Error ? error.message : 'Unknown'}`);
      return this.buildResult('failed');
    }
  }

  private async gatherProductContext(): Promise<any> {
    // Lire roadmap, hypotheses, feedback clients
    const [roadmap, hypotheses] = await Promise.all([
      this.readDashboardTab('roadmap', { status: ['todo', 'doing'] }),
      this.readDashboardTab('hypotheses', { status: ['testing', 'validated'] }),
    ]);

    return { roadmap: roadmap.data, hypotheses: hypotheses.data };
  }

  private async generateDeliverables(context: any): Promise<any[]> {
    const prompt = `Tu es un Senior Product Manager. Analyse ce contexte et génère 3-5 tickets actionnables.

CONTEXTE PRODUIT:
Roadmap actuelle: ${JSON.stringify(context.roadmap)}
Hypothèses validées: ${JSON.stringify(context.hypotheses)}

OBJECTIF: ${this.taskObjective}

CRITÈRES DE SUCCÈS:
${this.successCriteria.map(c => `- ${c}`).join('\n')}

GÉNÈRE UN JSON AVEC:
[
  {
    "title": "Titre clair",
    "description": "Description détaillée avec critères d'acceptation",
    "type": "feature|bug|tech-debt|research",
    "priority": "high|medium|low",
    "labels": ["label1", "label2"],
    "estimate": "S|M|L|XL"
  }
]`;

    const { generateText } = await import('ai');
    const model = getModelForAgent('pm', null);
    
    const response = await generateText({
      model,
      prompt,
      temperature: 0.2,
      maxTokens: 4000,
    });

    try {
      return JSON.parse(response.text);
    } catch {
      return [];
    }
  }

  private async createExternalTickets(deliverables: any[]): Promise<void> {
    for (const d of deliverables) {
      try {
        // Créer ticket Linear via Composio
        await executeComposioTool('linear_create_issue', {
          title: d.title,
          description: d.description,
          labelIds: [], // À mapper depuis labels
          priority: d.priority === 'high' ? 1 : d.priority === 'medium' ? 2 : 3,
        }, this.userId);

        this.logInsight(`Ticket Linear créé: ${d.title}`);
      } catch (error) {
        console.error('Linear ticket creation failed:', error);
        // Fallback: créer en local
        await this.createLinearTicket(d.title, d.description, d.labels);
      }
    }
  }

  private async readDashboardTab(tabName: string, filters: any) {
    // Appel à l'outil core-agent (simplifié ici)
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const model = (prisma as any)[tabName === 'roadmap' ? 'roadmapItem' : 'hypothesis'];
    return model.findMany({ where: { userId: this.userId, ...filters }, take: 50 });
  }
}