import { BaseSubAgent, SubAgentContext, SubAgentResult } from './base-agent';
import { getModelForAgent, UserModelsConfig } from '../provider-registry';
import { tool } from 'ai';
import { z } from 'zod';
import { executeComposioTool } from '@/lib/integrations/composio-client';
import { memory } from '@/lib/ai/memory/obsidian-memory';

export class ResearchAgent extends BaseSubAgent {
  private userConfig: UserModelsConfig | null;

  constructor(context: SubAgentContext, userConfig?: UserModelsConfig | null) {
    super(context);
    this.userConfig = userConfig || null;
  }

  async execute(): Promise<SubAgentResult> {
    try {
      // Phase 1: Recherche web approfondie
      const searchResults = await this.performDeepResearch();
      
      // Phase 2: Synthèse des résultats
      const synthesis = await this.synthesizeFindings(searchResults);
      
      // Phase 3: Sauvegarder le rapport
      await this.saveResearchReport(synthesis);
      
      return this.buildResult('success');
    } catch (error) {
      this.logInsight(`Erreur recherche: ${error instanceof Error ? error.message : 'Unknown'}`);
      return this.buildResult('failed');
    }
  }

  private async performDeepResearch(): Promise<any[]> {
    const queries = this.generateResearchQueries();
    const allResults: any[] = [];

    for (const query of queries) {
      try {
        const result = await executeComposioTool('serpapi_search', {
          query,
          num: 10,
        }, this.userId);
        
        const organicResults = result?.data?.organic_results || [];
        allResults.push(...organicResults.map((r: any) => ({
          query,
          title: r.title,
          url: r.link,
          snippet: r.snippet,
          source: r.source,
        })));
      } catch (error) {
        console.error(`Research query failed: ${query}`, error);
      }
    }

    return allResults;
  }

  private generateResearchQueries(): string[] {
    const base = this.taskObjective;
    return [
      base,
      `${base} market size 2024 2025`,
      `${base} competitors analysis`,
      `${base} trends opportunities`,
      `${base} business model examples`,
    ];
  }

  private async synthesizeFindings(results: any[]): Promise<string> {
    if (results.length === 0) {
      return 'Aucun résultat de recherche trouvé.';
    }

    const context = results
      .slice(0, 20)
      .map(r => `- ${r.title}: ${r.snippet} (${r.url})`)
      .join('\n');

    const prompt = `Tu es un Analyste de Recherche Senior. Synthétise ces résultats de recherche pour un fondateur.

OBJECTIF: ${this.taskObjective}

RÉSULTATS DE RECHERCHE:
${context}

CRITÈRES DE SUCCÈS:
${this.successCriteria.map(c => `- ${c}`).join('\n')}

PRODUIS UN RAPPORT STRUCTURÉ:
1. **Executive Summary** (3-5 lignes)
2. **Taille du Marché & Tendances** (chiffres clés)
3. **Paysage Concurrentiel** (acteurs principaux, parts de marché)
4. **Opportunités & Menaces** (SWOT synthétique)
5. **Recommandations Stratégiques** (3 actions concrètes)
6. **Sources** (liste URLs)

Format: Markdown, ton analytique, chiffres précis.`;

    const { generateText } = await import('ai');
    const model = getModelForAgent('research', this.userConfig);
    
    const response = await generateText({
      model,
      prompt,
      temperature: 0.3,
      maxTokens: 6000,
    });

    return response.text;
  }

  private async saveResearchReport(synthesis: string): Promise<void> {
    await this.saveDeliverable({
      type: 'analysis_report',
      title: `Research Report: ${this.taskObjective}`,
      content: synthesis,
      metadata: { 
        objective: this.taskObjective,
        queriesUsed: this.generateResearchQueries(),
        timestamp: new Date().toISOString(),
      },
    });

    // Aussi en mémoire vectorielle
    await memory.upsertNote({
      userId: this.userId,
      content: synthesis,
      type: 'research',
      tags: ['research', 'report', 'sub-agent'],
      source: 'agent',
    });
  }
}