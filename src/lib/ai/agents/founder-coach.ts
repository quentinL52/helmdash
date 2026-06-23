import { registerAgent } from '../agent-orchestrator';
import type { AgentContext, AgentDefinition } from '../agent-orchestrator';

/** Résultat structuré du coach */
export interface CoachAnalysis {
  /** Note globale de la semaine (1-10) */
  weeklyScore: number;
  /** Résumé de la semaine en 2-3 phrases */
  summary: string;
  /** Points forts identifiés */
  strengths: string[];
  /** Points d'amélioration */
  improvements: string[];
  /** 3 actions prioritaires pour la semaine prochaine */
  nextActions: { action: string; priority: 'high' | 'medium' | 'low'; module: string }[];
  /** Insight stratégique (une observation non-évidente) */
  strategicInsight: string;
  /** Message motivationnel personnalisé */
  motivation: string;
}

const coachAgent: AgentDefinition = {
  id: 'founder-coach',
  name: 'Founder Coach',
  nameFr: 'Coach Startup',
  description: 'Analyzes your week and sets priorities',
  descriptionFr: 'Analyse ta semaine et tes priorités',
  emoji: '🎯',
  primaryModule: 'journal',
  
  buildSystemPrompt: (context: AgentContext) => {
    return `You are an elite, no-nonsense startup coach and mentor (in the style of Paul Graham or Y Combinator partners).
Your goal is to review the founder's recent activity, provide direct, actionable feedback, and suggest the highest leverage actions for the upcoming week.

Analyze the provided metrics across all startup dimensions:
- Hypotheses: Are they testing fast enough? Are they validating?
- Finance: Is the runway safe? What is the burn rate?
- Routine/Discipline: Are they consistent (streak)?
- OKRs: Are they making progress on major goals?
- Journal: What is their psychological state?
- Lean Canvas: Is the business model clear and complete?
- CRM: Are they talking to customers?

RULES:
1. Be direct, objective, and actionable. No fluff.
2. If metrics are bad (e.g., 0 hypotheses tested, low runway, no customer contacts), call it out.
3. Your 'nextActions' must explicitly refer to specific dashboard modules (e.g., 'hypotheses', 'finances', 'crm', 'lean-canvas', 'okr').
4. Always return your response as a valid JSON object matching the requested schema. Do not include markdown formatting or text outside the JSON.

${context.locale === 'fr' ? 'IMPORTANT: You must write all textual content (summary, strengths, improvements, actions, motivation) in FRENCH.' : 'Write all textual content in ENGLISH.'}

Return ONLY valid JSON matching this schema:
{
  "weeklyScore": number (1-10),
  "summary": string,
  "strengths": string[],
  "improvements": string[],
  "nextActions": [
    { "action": string, "priority": "high" | "medium" | "low", "module": string }
  ],
  "strategicInsight": string,
  "motivation": string
}`;
  },

  buildUserMessage: (context: AgentContext) => {
    // Extract data safely from storeData
    const data = context.storeData || {};
    const hypotheses = data.hypotheses as { total: number; tested: number; validated: number } || { total: 0, tested: 0, validated: 0 };
    const finance = data.finance as { cash: number; runway: number; burnRate: number } || { cash: 0, runway: 0, burnRate: 0 };
    const streak = data.streak as number || 0;
    const okrProgress = data.okrProgress as number || 0;
    const journalMoods = data.journalMoods as string[] || [];
    const canvasCompleteness = data.canvasCompleteness as number || 0;
    const contactsCount = data.contactsCount as number || 0;

    return `Here are my current metrics:

- Hypotheses: ${hypotheses.total} total, ${hypotheses.tested} tested, ${hypotheses.validated} validated.
- Finances: $${finance.cash} cash, ${finance.runway} months runway, $${finance.burnRate}/mo burn rate.
- Discipline Streak: ${streak} days.
- OKR Progress: ${okrProgress}%.
- Recent Journal Moods: ${journalMoods.length > 0 ? journalMoods.join(', ') : 'None'}.
- Lean Canvas Completeness: ${canvasCompleteness}%.
- CRM Contacts: ${contactsCount}.

${context.userInstruction ? `\nAdditional instruction from founder: ${context.userInstruction}\n` : ''}

Please analyze this and provide my weekly coaching JSON.`;
  },

  parseResponse: (raw: string): CoachAnalysis => {
    try {
      // Handle potential markdown code blocks
      const cleaned = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      return JSON.parse(cleaned) as CoachAnalysis;
    } catch (error) {
      console.error('[FounderCoach] Failed to parse JSON:', raw);
      throw new Error('Failed to parse coach response into JSON.');
    }
  }
};

// Auto-register when imported
registerAgent(coachAgent);
