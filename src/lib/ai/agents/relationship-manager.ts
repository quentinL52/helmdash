import { registerAgent } from '../agent-orchestrator';
import type { AgentContext, AgentDefinition } from '../agent-orchestrator';

export interface RelationshipAction {
  contactId: string;
  contactName: string;
  action: 'follow-up' | 'reconnect' | 'nurture' | 'ask-referral' | 'schedule-meeting' | 'send-update';
  reason: string;
  suggestedMessage: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string; // "cette semaine", "demain", etc.
}

export interface RelationshipAnalysis {
  /** Actions suggérées pour les contacts existants */
  actions: RelationshipAction[];
  /** Contacts négligés (pas de contact depuis > 2 semaines) */
  neglectedContacts: { id: string; name: string; lastContact: string; daysSinceContact: number }[];
  /** Insight sur le réseau */
  networkInsight: string;
  /** Suggestions de nouveaux types de contacts à chercher */
  gapAnalysis: string[];
}

const relationshipManagerAgent: AgentDefinition = {
  id: 'relationship-manager',
  name: 'Relationship Manager',
  nameFr: 'Gestionnaire de Relations',
  description: 'Analyzes your network and suggests follow-ups',
  descriptionFr: 'Analyse ton réseau et suggère des actions',
  emoji: '🤝',
  primaryModule: 'crm',

  buildSystemPrompt: (context: AgentContext) => {
    return `You are a highly experienced Relationship Manager and Business Developer for a startup founder.
Your goal is to analyze the founder's CRM contacts, identify neglected relationships, suggest high-value actions, and spot networking gaps based on their current project phase.

RULES:
1. Prioritize actions by potential impact (high, medium, low).
2. Provide concrete, personalized suggested messages for outreach.
3. Identify contacts who haven't been touched in a while (neglected contacts).
4. Provide a network insight and a gap analysis (who is missing from their network?).
5. Always return your response as a valid JSON object matching the requested schema. Do not include markdown formatting or text outside the JSON.

${context.locale === 'fr' ? 'IMPORTANT: You must write all insights, reasons, and suggested messages in FRENCH.' : 'Write all content in ENGLISH.'}

Return ONLY valid JSON matching this schema:
{
  "actions": [
    {
      "contactId": string,
      "contactName": string,
      "action": "follow-up" | "reconnect" | "nurture" | "ask-referral" | "schedule-meeting" | "send-update",
      "reason": string,
      "suggestedMessage": string,
      "priority": "high" | "medium" | "low",
      "deadline": string
    }
  ],
  "neglectedContacts": [
    {
      "id": string,
      "name": string,
      "lastContact": string,
      "daysSinceContact": number
    }
  ],
  "networkInsight": string,
  "gapAnalysis": string[]
}`;
  },

  buildUserMessage: (context: AgentContext) => {
    const data = context.storeData || {};
    const contacts = data.contacts as any[] || [];
    const projectPhase = data.projectPhase as string || 'Unknown phase';
    const goToMarket = data.goToMarket as { ompTarget?: string } || {};

    const contactsSummary = contacts.map(c => 
      `- ID: ${c.id} | Name: ${c.name} | Type: ${c.type} | Company: ${c.company || 'N/A'} | Last Interaction: ${c.lastInteraction || 'Never'} | Notes: ${c.notes || 'None'} | Tags: ${c.tags?.join(', ') || 'None'}`
    ).join('\n');

    return `Here is my current network and context:

[Context]
- Project Phase: ${projectPhase}
- Target Audience: ${goToMarket.ompTarget || 'Not defined'}

[Contacts]
${contacts.length > 0 ? contactsSummary : 'No contacts in CRM yet.'}

${context.userInstruction ? `\nSpecific Instruction from founder: ${context.userInstruction}\n` : ''}

Please analyze this CRM data and provide the relationship analysis JSON.`;
  },

  parseResponse: (raw: string): RelationshipAnalysis => {
    try {
      const cleaned = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      return JSON.parse(cleaned) as RelationshipAnalysis;
    } catch (error) {
      console.error('[RelationshipManager] Failed to parse JSON:', raw);
      throw new Error('Failed to parse CRM agent response into JSON.');
    }
  }
};

// Auto-register
registerAgent(relationshipManagerAgent);
