import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
// Import other providers as needed (groq, mistral, etc.)
// For this MVP, we will abstract the creation.

export type AgentRole = 'core' | 'pm' | 'cfo' | 'growth' | 'legal' | 'tech' | 'research';

export interface UserModelsConfig {
  core?: string;
  pm?: string;
  cfo?: string;
  growth?: string;
  legal?: string;
  tech?: string;
  research?: string;
}

export const DEFAULT_MODELS_CONFIG: UserModelsConfig = {
  core: 'gpt-4o',
  pm: 'claude-3-5-sonnet-20241022',
  cfo: 'gpt-4o',
  growth: 'claude-3-5-sonnet-20241022',
  legal: 'gpt-4o',
  tech: 'claude-3-5-sonnet-20241022',
  research: 'gpt-4o-mini',
};

/**
 * Registry pour initialiser le modèle LLM adéquat en fonction
 * du rôle du sous-agent et de la configuration de l'utilisateur.
 */
export function getModelForAgent(role: AgentRole, userConfig?: UserModelsConfig | null) {
  const modelId = userConfig?.[role] || DEFAULT_MODELS_CONFIG[role];
  
  // Mapping rudimentaire pour l'MVP :
  if (modelId?.startsWith('gpt') || modelId?.startsWith('o1')) {
    return openai(modelId as string);
  } else if (modelId?.startsWith('claude')) {
    return anthropic(modelId as string);
  } else {
    // Fallback par défaut si non reconnu
    return openai('gpt-4o-mini');
  }
}
