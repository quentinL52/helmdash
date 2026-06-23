/**
 * @module provider-registry
 * @description Singleton registry for AI providers.
 * Manages registration, resolution, and model listing across all adapters.
 * Use `getProviderRegistry()` to access the shared instance.
 */

import type { AIModel, AIProvider, ProviderName } from './provider-interface';

/**
 * Central registry that holds all registered AI provider adapters.
 * Implements the Registry pattern as a singleton to ensure a single source of truth.
 */
class ProviderRegistry {
  private readonly providers = new Map<ProviderName, AIProvider>();

  /**
   * Register a new AI provider adapter.
   * @param provider - The provider instance to register.
   * @throws If a provider with the same name is already registered.
   */
  register(provider: AIProvider): void {
    if (this.providers.has(provider.name)) {
      throw new Error(
        `[ProviderRegistry] Provider "${provider.name}" is already registered.`
      );
    }
    this.providers.set(provider.name, provider);
  }

  /**
   * Retrieve a provider by name.
   * @param name - The provider identifier.
   * @returns The provider instance.
   * @throws If the provider is not registered.
   */
  get(name: ProviderName): AIProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      const available = Array.from(this.providers.keys()).join(', ');
      throw new Error(
        `[ProviderRegistry] Provider "${name}" not found. Available: [${available}]`
      );
    }
    return provider;
  }

  /**
   * Get all registered providers.
   * @returns A read-only array of all provider instances.
   */
  getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * List available models for a specific provider.
   * @param name - The provider identifier.
   * @param apiKey - The API key for authentication.
   * @returns An array of available models.
   */
  async listModels(name: ProviderName, apiKey: string): Promise<AIModel[]> {
    const provider = this.get(name);
    return provider.listModels(apiKey);
  }

  /**
   * Check if a provider is registered.
   * @param name - The provider identifier.
   */
  has(name: ProviderName): boolean {
    return this.providers.has(name);
  }
}

/** Singleton instance — lazily initialised on first access. */
let registryInstance: ProviderRegistry | null = null;

/**
 * Returns the singleton `ProviderRegistry` instance.
 * On first call, creates the registry and auto-registers all built-in adapters.
 */
export function getProviderRegistry(): ProviderRegistry {
  if (!registryInstance) {
    registryInstance = new ProviderRegistry();
    registerBuiltInProviders(registryInstance);
  }
  return registryInstance;
}

/**
 * Auto-registers all built-in provider adapters.
 * Called once during singleton initialisation.
 */
function registerBuiltInProviders(registry: ProviderRegistry): void {
  /* Dynamic imports avoid circular dependencies and keep the registry lean.
     Each adapter is loaded synchronously since they are local modules. */
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { OpenAIAdapter } = require('./adapters/openai-adapter');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { AnthropicAdapter } = require('./adapters/anthropic-adapter');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { GeminiAdapter } = require('./adapters/gemini-adapter');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MistralAdapter } = require('./adapters/mistral-adapter');

  registry.register(new OpenAIAdapter());
  registry.register(new AnthropicAdapter());
  registry.register(new GeminiAdapter());
  registry.register(new MistralAdapter());
}

export { ProviderRegistry };
