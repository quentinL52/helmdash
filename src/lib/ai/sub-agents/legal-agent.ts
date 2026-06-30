import { BaseSubAgent, SubAgentContext } from './base-agent';
import { getModelForAgent } from '../provider-registry';
import { memory } from '@/lib/ai/memory/obsidian-memory';

export class LegalAgent extends BaseSubAgent {
  async execute(): Promise<any> {
    try {
      const prompt = `Tu es un Legal/Compliance Agent pour startup française. Génère les documents juridiques demandés.

OBJECTIF: ${this.taskObjective}

CRITÈRES DE SUCCÈS:
${this.successCriteria.map(c => `- ${c}`).join('\n')}

PRODUIS LE DOCUMENT DEMANDÉ (CGV, Privacy Policy, DPA, Contrat freelance, Checklist RGPD, etc.) en Markdown complet et conforme droit français.`;

      const { generateText } = await import('ai');
      const model = getModelForAgent('legal', null);
      
      const response = await generateText({
        model,
        prompt,
        temperature: 0.1,
        maxTokens: 8000,
      });

      await this.saveDeliverable({
        type: 'analysis_report',
        title: `Document Juridique: ${this.taskObjective}`,
        content: response.text,
        metadata: { docType: 'legal', timestamp: new Date().toISOString() },
      });

      return this.buildResult('success');
    } catch (error) {
      this.logInsight(`Erreur Legal: ${error instanceof Error ? error.message : 'Unknown'}`);
      return this.buildResult('failed');
    }
  }
}