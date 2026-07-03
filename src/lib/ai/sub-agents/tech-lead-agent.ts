import { BaseSubAgent, SubAgentContext } from './base-agent';
import { getModelForAgent } from '../provider-registry';
import { memory } from '@/lib/ai/memory/obsidian-memory';

export class TechLeadAgent extends BaseSubAgent {
  async execute(): Promise<any> {
    try {
      const prompt = `Tu es un Tech Lead Senior. Analyse l'architecture, génère des ADR, fais des code reviews, planifie la dette technique.

OBJECTIF: ${this.taskObjective}

CONTEXTE TECHNIQUE:
${JSON.stringify(this.context, null, 2)}

CRITÈRES DE SUCCÈS:
${this.successCriteria.map(c => `- ${c}`).join('\n')}

PRODUIS: Architecture Decision Records (ADR), specs techniques, plan de migration, ou code review selon l'objectif.`;

      const { generateText } = await import('ai');
      const model = getModelForAgent('tech_lead', null);
      
      const response = await generateText({
        model,
        prompt,
        temperature: 0.2,
        // @ts-ignore
      maxTokens: 5000,
      });

      await this.saveDeliverable({
        type: 'analysis_report',
        title: `Tech Lead: ${this.taskObjective}`,
        content: response.text,
        metadata: { docType: 'tech', timestamp: new Date().toISOString() },
      });

      return this.buildResult('success');
    } catch (error) {
      this.logInsight(`Erreur Tech Lead: ${error instanceof Error ? error.message : 'Unknown'}`);
      return this.buildResult('failed');
    }
  }
}