/**
 * @module mistral-adapter
 * @description Mistral AI provider adapter.
 * Uses native `fetch` against the Mistral API (OpenAI-compatible format)
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

/** Base URL for the Mistral API. */
const MISTRAL_API_URL = 'https://api.mistral.ai/v1';

/** Mistral model list API response shape. */
interface MistralModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  capabilities?: {
    completion_chat: boolean;
    function_calling: boolean;
    vision: boolean;
  };
  max_context_length?: number;
}

interface MistralModelListResponse {
  data?: MistralModel[];
}

/** Mistral chat completion response shape (OpenAI-compatible). */
interface MistralChatResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/** Mistral error response shape. */
interface MistralErrorResponse {
  message?: string;
  detail?: string;
}

/**
 * Builds standard Authorization headers for Mistral.
 * @param apiKey - The Bearer token.
 */
function buildHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
}

/**
 * Infer capabilities from Mistral model metadata.
 */
function inferCapabilities(
  model: MistralModel
): AIModel['capabilities'] {
  const caps: AIModel['capabilities'] = ['chat', 'streaming'];

  if (model.capabilities?.function_calling) {
    caps.push('function-calling');
  }
  if (model.capabilities?.vision) {
    caps.push('vision');
  }

  return caps;
}

/**
 * Mistral adapter implementing the `AIProvider` interface.
 * Communicates via native `fetch` using the OpenAI-compatible chat format.
 */
export class MistralAdapter implements AIProvider {
  readonly name: ProviderName = 'mistral';
  readonly displayName = 'Mistral AI';

  /** @inheritdoc */
  async chat(
    messages: ChatMessage[],
    model: string,
    options?: ChatOptions
  ): Promise<ChatResponse> {
    const apiKey = options?.apiKey || process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error('[Mistral] No API key configured (MISTRAL_API_KEY).');
    }

    // Build OpenAI-compatible messages array
    const mistralMessages: { role: string; content: string }[] = [];

    if (options?.systemPrompt) {
      mistralMessages.push({ role: 'system', content: options.systemPrompt });
    }

    for (const msg of messages) {
      mistralMessages.push({ role: msg.role, content: msg.content });
    }

    const body: Record<string, unknown> = {
      model,
      messages: mistralMessages,
    };

    if (options?.temperature !== undefined) {
      body.temperature = options.temperature;
    }
    if (options?.maxTokens !== undefined) {
      body.max_tokens = options.maxTokens;
    }

    const response = await fetch(`${MISTRAL_API_URL}/chat/completions`, {
      method: 'POST',
      headers: buildHeaders(apiKey),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as MistralErrorResponse;
      const detail = errorData.message ?? errorData.detail ?? response.statusText;
      throw new Error(`[Mistral] Chat request failed (${response.status}): ${detail}`);
    }

    const data = (await response.json()) as MistralChatResponse;

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('[Mistral] No content returned in completion response.');
    }

    return {
      content,
      model: data.model,
      provider: this.name,
      usage: data.usage
        ? {
            inputTokens: data.usage.prompt_tokens,
            outputTokens: data.usage.completion_tokens,
          }
        : undefined,
    };
  }

  /** @inheritdoc */
  async listModels(apiKey: string): Promise<AIModel[]> {
    const response = await fetch(`${MISTRAL_API_URL}/models`, {
      method: 'GET',
      headers: buildHeaders(apiKey),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as MistralErrorResponse;
      const detail = errorData.message ?? errorData.detail ?? response.statusText;
      throw new Error(`[Mistral] Failed to list models (${response.status}): ${detail}`);
    }

    const data = (await response.json()) as MistralModelListResponse;

    if (!data.data) {
      return [];
    }

    // Filter to chat-capable models only
    return data.data
      .filter((m) => m.capabilities?.completion_chat !== false)
      .map((m) => ({
        id: m.id,
        name: m.id,
        provider: this.name as ProviderName,
        contextWindow: m.max_context_length,
        capabilities: inferCapabilities(m),
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  /** @inheritdoc */
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${MISTRAL_API_URL}/models`, {
        method: 'GET',
        headers: buildHeaders(apiKey),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
