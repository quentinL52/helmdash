import type { ChatMessage, ChatOptions, ChatResponse, ProviderName } from './provider-interface';
import { getProviderRegistry } from './provider-registry';

/** Identifiants des agents disponibles */
export type AgentId = 'founder-coach' | 'content-creator' | 'relationship-manager' 
  | 'canvas-optimizer' | 'cfo-agent' | 'research-scientist' | 'launch-strategist' | 'pmf-assessor';

export type AgentStatus = 'idle' | 'running' | 'success' | 'error';

/** Définition d'un agent IA */
export interface AgentDefinition {
  id: AgentId;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  emoji: string;
  /** Le module dashboard principal associé */
  primaryModule: string;
  /** Prompt système de l'agent */
  buildSystemPrompt: (context: AgentContext) => string;
  /** Construit les messages user à partir du contexte */
  buildUserMessage: (context: AgentContext) => string;
  /** Parse la réponse brute en un résultat structuré */
  parseResponse: (raw: string) => unknown;
}

/** Contexte passé à un agent */
export interface AgentContext {
  /** Données du store pertinentes pour cet agent */
  storeData: Record<string, unknown>;
  /** Instructions spécifiques de l'utilisateur */
  userInstruction?: string;
  /** Langue préférée */
  locale: 'fr' | 'en';
}

/** Résultat d'exécution d'un agent */
export interface AgentResult<T = unknown> {
  agentId: AgentId;
  status: AgentStatus;
  data?: T;
  rawResponse?: string;
  error?: string;
  executedAt: string;
  provider: ProviderName;
  model: string;
  usage?: { inputTokens: number; outputTokens: number };
}

/** Registry des agents disponibles */
const agentRegistry = new Map<AgentId, AgentDefinition>();

/**
 * Enregistre un nouvel agent.
 * @param definition La définition de l'agent.
 */
export function registerAgent(definition: AgentDefinition): void {
  if (agentRegistry.has(definition.id)) {
    console.warn(`[AgentOrchestrator] Agent ${definition.id} is already registered.`);
    return;
  }
  agentRegistry.set(definition.id, definition);
}

/**
 * Récupère un agent par son ID.
 * @param id L'ID de l'agent.
 * @returns La définition de l'agent.
 * @throws Si l'agent n'est pas enregistré.
 */
export function getAgent(id: AgentId): AgentDefinition {
  const agent = agentRegistry.get(id);
  if (!agent) {
    throw new Error(`[AgentOrchestrator] Agent ${id} not found.`);
  }
  return agent;
}

/**
 * Récupère tous les agents enregistrés.
 * @returns Un tableau contenant tous les agents.
 */
export function getAllAgents(): AgentDefinition[] {
  return Array.from(agentRegistry.values());
}

/**
 * Retourne un résumé de tous les agents pour l'interface utilisateur.
 * @returns Un tableau de résumés d'agents.
 */
export function getAgentSummaries() {
  return getAllAgents().map(agent => ({
    id: agent.id,
    name: agent.name,
    nameFr: agent.nameFr,
    description: agent.description,
    descriptionFr: agent.descriptionFr,
    emoji: agent.emoji,
    primaryModule: agent.primaryModule,
  }));
}

/**
 * Exécute un agent avec le provider/modèle spécifié.
 * C'est LA fonction centrale — prend un agentId, un contexte, et les settings IA.
 */
export async function executeAgent<T = unknown>(
  agentId: AgentId,
  context: AgentContext,
  settings: { provider: ProviderName; model: string; apiKey: string },
  options?: ChatOptions
): Promise<AgentResult<T>> {
  try {
    const agent = getAgent(agentId);
    const registry = getProviderRegistry();
    const provider = registry.get(settings.provider);
    
    const systemPrompt = agent.buildSystemPrompt(context);
    const userMessage = agent.buildUserMessage(context);
    
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];
    
    // The chat method on the provider adapter expects the messages array, the model, and options
    const response = await provider.chat(messages, settings.model, {
      ...options,
      apiKey: settings.apiKey,
      systemPrompt: undefined, // System prompt is already in messages array
    });
    
    let parsedData: unknown;
    try {
        parsedData = agent.parseResponse(response.content);
    } catch (parseError) {
        console.error(`[AgentOrchestrator] Failed to parse response from ${agentId}:`, parseError);
        return {
          agentId,
          status: 'error',
          error: 'Failed to parse AI response.',
          rawResponse: response.content,
          executedAt: new Date().toISOString(),
          provider: settings.provider,
          model: settings.model,
          usage: response.usage,
        };
    }

    return {
      agentId,
      status: 'success',
      data: parsedData as T,
      rawResponse: response.content,
      executedAt: new Date().toISOString(),
      provider: settings.provider,
      model: settings.model,
      usage: response.usage,
    };
  } catch (error) {
    console.error(`[AgentOrchestrator] Execution failed for ${agentId}:`, error);
    return {
      agentId,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      executedAt: new Date().toISOString(),
      provider: settings.provider,
      model: settings.model,
    };
  }
}
