/**
 * @module anthropic-adapter
 * @description Anthropic (Claude) provider adapter.
 * Uses native `fetch` to communicate with the Anthropic Messages API
 * — no external SDK required.
 */

import type {
  AIModel,
  AIProvider,
  ChatMessage,
  ChatOptions,
  ChatResponse,
  ProviderName,
} from '../provider-interface';

/** Base URL for the Anthropic API. */
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1';

/** Required API version header. */
const ANTHROPIC_VERSION = '2023-06-01';

/**
 * Static catalogue of Claude models.
 * Anthropic does not expose a model-listing API, so we maintain a curated list.
 */
const CLAUDE_MODELS: AIModel[] = [
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    capabilities: ['chat', 'vision', 'function-calling', 'streaming'],
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    capabilities: ['chat', 'vision', 'streaming'],
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    contextWindow: 200_000,
    maxOutputTokens: 4_096,
    capabilities: ['chat', 'vision', 'function-calling', 'streaming'],
  },
];

/** Anthropic API error response shape. */
interface AnthropicErrorResponse {
  error?: {
    type: string;
    message: string;
  };
}

/** Anthropic Messages API response shape. */
interface AnthropicMessagesResponse {
  id: string;
  model: string;
  content: { type: string; text: string }[];
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Builds the standard headers required by the Anthropic API.
 * @param apiKey - The API key to authenticate with.
 */
function buildHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': ANTHROPIC_VERSION,
  };
}

/**
 * Anthropic adapter implementing the `AIProvider` interface.
 * Communicates via native `fetch` to avoid adding an external SDK dependency.
 */
export class AnthropicAdapter implements AIProvider {
  readonly name: ProviderName = 'anthropic';
  readonly displayName = 'Anthropic (Claude)';

  /** @inheritdoc */
  async chat(
    messages: ChatMessage[],
    model: string,
    options?: ChatOptions
  ): Promise<ChatResponse> {
    const apiKey = options?.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('[Anthropic] No API key configured (ANTHROPIC_API_KEY).');
    }

    // Separate system message from conversation messages.
    // Anthropic expects `system` as a top-level field, not within `messages`.
    let systemPrompt = options?.systemPrompt;
    const conversationMessages: { role: 'user' | 'assistant'; content: string }[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        // Use the last system message if multiple are present
        systemPrompt = msg.content;
      } else {
        conversationMessages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }
    }

    // Anthropic requires at least one user message
    if (conversationMessages.length === 0) {
      throw new Error('[Anthropic] At least one user message is required.');
    }

    const body: Record<string, unknown> = {
      model,
      messages: conversationMessages,
      max_tokens: options?.maxTokens ?? 4096,
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }
    if (options?.temperature !== undefined) {
      body.temperature = options.temperature;
    }

    const response = await fetch(`${ANTHROPIC_API_URL}/messages`, {
      method: 'POST',
      headers: buildHeaders(apiKey),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as AnthropicErrorResponse;
      const detail = errorData.error?.message ?? response.statusText;
      throw new Error(`[Anthropic] Chat request failed (${response.status}): ${detail}`);
    }

    const data = (await response.json()) as AnthropicMessagesResponse;

    const textContent = data.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    if (!textContent) {
      throw new Error('[Anthropic] No text content returned in response.');
    }

    return {
      content: textContent,
      model: data.model,
      provider: this.name,
      usage: {
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
      },
    };
  }

  /** @inheritdoc */
  async listModels(_apiKey: string): Promise<AIModel[]> {
    // Anthropic does not provide a model-listing API.
    // Return the curated static catalogue.
    return [...CLAUDE_MODELS];
  }

  /** @inheritdoc */
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // Send a minimal request to verify the key is functional
      const response = await fetch(`${ANTHROPIC_API_URL}/messages`, {
        method: 'POST',
        headers: buildHeaders(apiKey),
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1,
        }),
      });

      // A 401 means the key is invalid; anything else (including 200) means it's valid
      return response.status !== 401;
    } catch {
      return false;
    }
  }
}
