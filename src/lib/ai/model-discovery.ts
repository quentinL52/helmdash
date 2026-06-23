/**
 * @module model-discovery
 * @description Aggregates and caches AI models from all configured providers.
 * Provides a unified view across OpenAI, Anthropic, Gemini, and Mistral
 * with a 5-minute TTL cache to avoid redundant API calls.
 */

import type { AIModel, ProviderName } from './provider-interface';
import { getProviderRegistry } from './provider-registry';

/** Cache entry holding discovered models and their expiration timestamp. */
interface CacheEntry {
  models: AIModel[];
  expiresAt: number;
}

/** Cache TTL in milliseconds (5 minutes). */
const CACHE_TTL_MS = 5 * 60 * 1000;

/** In-memory cache keyed by provider name. */
const modelCache = new Map<ProviderName, CacheEntry>();

/**
 * Discover available models for a single provider.
 * Results are cached for 5 minutes to reduce API call overhead.
 *
 * @param provider - The provider to query.
 * @param apiKey - The API key for authentication.
 * @param forceRefresh - If `true`, bypasses the cache.
 * @returns An array of discovered models.
 */
export async function discoverModels(
  provider: ProviderName,
  apiKey: string,
  forceRefresh = false
): Promise<AIModel[]> {
  // Check cache unless forced refresh
  if (!forceRefresh) {
    const cached = modelCache.get(provider);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.models;
    }
  }

  const registry = getProviderRegistry();
  const models = await registry.listModels(provider, apiKey);

  // Store in cache
  modelCache.set(provider, {
    models,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return models;
}

/** Map of provider names to their API keys for batch discovery. */
export type ProviderApiKeys = Partial<Record<ProviderName, string>>;

/** Result of a multi-provider discovery call. */
export interface DiscoveryResult {
  provider: ProviderName;
  models: AIModel[];
  error?: string;
}

/**
 * Discover models from all providers that have an API key configured.
 * Runs all provider queries in parallel and returns results per provider.
 * Failures for individual providers are captured without blocking others.
 *
 * @param apiKeys - Map of provider names to their API keys.
 * @param forceRefresh - If `true`, bypasses the cache for all providers.
 * @returns An array of discovery results, one per queried provider.
 */
export async function discoverAllModels(
  apiKeys: ProviderApiKeys,
  forceRefresh = false
): Promise<DiscoveryResult[]> {
  const entries = Object.entries(apiKeys) as [ProviderName, string][];

  const results = await Promise.allSettled(
    entries.map(async ([provider, apiKey]): Promise<DiscoveryResult> => {
      const models = await discoverModels(provider, apiKey, forceRefresh);
      return { provider, models };
    })
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    const [provider] = entries[index];
    const errorMessage =
      result.reason instanceof Error ? result.reason.message : String(result.reason);
    return { provider, models: [], error: errorMessage };
  });
}

/**
 * Invalidate the cache for a specific provider or all providers.
 * @param provider - If provided, only clears that provider's cache. Otherwise clears all.
 */
export function invalidateModelCache(provider?: ProviderName): void {
  if (provider) {
    modelCache.delete(provider);
  } else {
    modelCache.clear();
  }
}
