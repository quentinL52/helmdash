import { BaseSubAgent, SubAgentContext } from './base-agent';
import { getModelForAgent } from '../provider-registry';
import { memory } from '@/lib/ai/memory/obsidian-memory';

export class RecruitingAgent extends BaseSubAgent {
  async execute(): Promise<any> {
    try {
      const prompt = `Tu es un Recruiting Agent. Génère job descriptions, grilles d'entretien, benchmark salaires, plans d'onboarding.

OBJECTIF: ${this.taskObjective}

CONTEXTE: ${JSON.stringify(this.context, null, 2)}

CRITÈRES DE SUCCÈS:
${this.successCriteria.map(c => `- ${c}`).join('\n')}

PRODUIS: Job description complète, grille entretien (technique/soft/culture), benchmark salaires marché, plan onboarding 30/60/90 jours.`;

      const { generateText } = await import('ai');
      const model = getModelForAgent('recruiting', null);
      
      const response = await generateText({
        model,
        prompt,
        temperature: 0.3,
        maxTokens: 6000,
      });

      await this.saveDeliverable({
        type: 'analysis_report',
        title: `Recrutement: ${this.taskObjective}`,
        content: response.text,
        metadata: { docType: 'recruiting', timestamp: new Date().toISOString() },
      });

      return this.buildResult('success');
    } catch (error) {
      this.logInsight(`Erreur Recruiting: ${error instanceof Error ? error.message : 'Unknown'}`);
      return this.buildResult('failed');
    }
  }
}