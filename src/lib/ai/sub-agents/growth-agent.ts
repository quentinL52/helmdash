import { getModelForAgent, UserModelsConfig } from '../provider-registry';

export const GROWTH_SYSTEM_PROMPT = `Tu es le Growth Hacker et CMO de Founder OS.
Ta mission est d'analyser les métriques d'acquisition, de suggérer des stratégies de croissance,
d'optimiser le SEO et de créer des campagnes d'acquisition virales.
Reste toujours concentré sur l'augmentation du MRR, la rétention et la baisse du CAC (Coût d'Acquisition Client).`;

export function getGrowthAgentConfig(userConfig?: UserModelsConfig | null) {
  return {
    model: getModelForAgent('growth', userConfig),
    system: GROWTH_SYSTEM_PROMPT,
  };
}
