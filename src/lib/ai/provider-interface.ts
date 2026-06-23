/**
 * @module provider-interface
 * @description Core TypeScript interfaces for the multi-provider AI architecture.
 * All adapters must implement the `AIProvider` interface to ensure
 * a consistent contract across OpenAI, Anthropic, Gemini, and Mistral.
 */

/** Supported AI provider identifiers. */
export type ProviderName = 'openai' | 'anthropic' | 'gemini' | 'mistral';

/** Configuration required to initialise a provider connection. */
export interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
}

/**
 * Describes a single AI model exposed by a provider.
 * Used for dynamic model discovery and UI selection.
 */
export interface AIModel {
  /** Provider-specific model identifier (e.g. "gpt-4o", "claude-sonnet-4-20250514"). */
  id: string;
  /** Human-readable display name. */
  name: string;
  /** Which provider owns this model. */
  provider: ProviderName;
  /** Maximum input context window in tokens (if known). */
  contextWindow?: number;
  /** Capabilities supported by this model. */
  capabilities: ('chat' | 'vision' | 'function-calling' | 'streaming')[];
  /** Maximum output tokens the model can generate (if known). */
  maxOutputTokens?: number;
}

/** A single message in a chat conversation. */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Optional parameters for a chat completion request. */
export interface ChatOptions {
  /** The API key to authenticate the request (overrides env vars). */
  apiKey?: string;
  /** Sampling temperature (0-2). Lower = more deterministic. */
  temperature?: number;
  /** Maximum tokens to generate in the response. */
  maxTokens?: number;
  /** System-level instruction prepended to the conversation. */
  systemPrompt?: string;
}

/** Standardised response from any AI provider chat call. */
export interface ChatResponse {
  /** The generated text content. */
  content: string;
  /** The model identifier that produced this response. */
  model: string;
  /** Which provider handled the request. */
  provider: ProviderName;
  /** Token usage statistics (when available from the provider). */
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Contract that every AI provider adapter must implement.
 * Ensures consistent behaviour across OpenAI, Anthropic, Gemini, and Mistral.
 */
export interface AIProvider {
  /** Internal provider identifier. */
  name: ProviderName;
  /** Human-readable label for UI display. */
  displayName: string;

  /**
   * Send a chat completion request.
   * @param messages - The conversation history.
   * @param model - The model identifier to use.
   * @param options - Optional generation parameters.
   * @returns A standardised chat response.
   */
  chat(messages: ChatMessage[], model: string, options?: ChatOptions): Promise<ChatResponse>;

  /**
   * List all models available for this provider.
   * @param apiKey - The API key to authenticate the listing request.
   * @returns An array of discovered models.
   */
  listModels(apiKey: string): Promise<AIModel[]>;

  /**
   * Validate that an API key is functional.
   * @param apiKey - The API key to validate.
   * @returns `true` if the key is valid and has access.
   */
  validateApiKey(apiKey: string): Promise<boolean>;
}
