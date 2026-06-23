/**
 * @module gemini-adapter
 * @description Google Gemini provider adapter.
 * Uses native `fetch` against the Gemini REST API (v1beta)
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

/** Base URL for the Gemini REST API. */
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

/** Gemini model list API response shape. */
interface GeminiModelListResponse {
  models?: {
    name: string;
    displayName: string;
    supportedGenerationMethods: string[];
    inputTokenLimit?: number;
    outputTokenLimit?: number;
  }[];
}

/** Gemini generateContent response shape. */
interface GeminiGenerateResponse {
  candidates?: {
    content: {
      parts: { text: string }[];
      role: string;
    };
  }[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  modelVersion?: string;
}

/** Gemini error response shape. */
interface GeminiErrorResponse {
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

/**
 * Infer capabilities from a Gemini model's supported methods and name.
 */
function inferCapabilities(
  supportedMethods: string[],
  modelName: string
): AIModel['capabilities'] {
  const caps: AIModel['capabilities'] = ['chat'];

  if (supportedMethods.includes('generateContent')) {
    caps.push('streaming');
  }
  // Vision is supported by gemini-pro-vision, gemini-1.5, gemini-2.x models
  if (
    modelName.includes('vision') ||
    modelName.includes('1.5') ||
    modelName.includes('2.0') ||
    modelName.includes('2.5')
  ) {
    caps.push('vision');
  }
  // Function calling is supported by gemini-1.5+, gemini-2.x
  if (
    modelName.includes('1.5') ||
    modelName.includes('2.0') ||
    modelName.includes('2.5')
  ) {
    caps.push('function-calling');
  }

  return caps;
}

/**
 * Google Gemini adapter implementing the `AIProvider` interface.
 * Communicates via native `fetch` to the REST API.
 */
export class GeminiAdapter implements AIProvider {
  readonly name: ProviderName = 'gemini';
  readonly displayName = 'Google Gemini';

  /** @inheritdoc */
  async chat(
    messages: ChatMessage[],
    model: string,
    options?: ChatOptions
  ): Promise<ChatResponse> {
    const apiKey = options?.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('[Gemini] No API key configured (GEMINI_API_KEY or GOOGLE_AI_API_KEY).');
    }

    // Build Gemini content parts.
    // Gemini uses "model" role instead of "assistant" and handles
    // system instructions via a dedicated field.
    const contents: { role: string; parts: { text: string }[] }[] = [];
    let systemInstruction: string | undefined = options?.systemPrompt;

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = msg.content;
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    if (contents.length === 0) {
      throw new Error('[Gemini] At least one user message is required.');
    }

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
        ...(options?.maxTokens !== undefined && { maxOutputTokens: options.maxTokens }),
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    // Strip "models/" prefix if present — the URL already includes it
    const modelId = model.startsWith('models/') ? model.slice(7) : model;

    const response = await fetch(
      `${GEMINI_API_URL}/models/${modelId}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as GeminiErrorResponse;
      const detail = errorData.error?.message ?? response.statusText;
      throw new Error(`[Gemini] Chat request failed (${response.status}): ${detail}`);
    }

    const data = (await response.json()) as GeminiGenerateResponse;

    const textParts = data.candidates?.[0]?.content?.parts ?? [];
    const textContent = textParts.map((p) => p.text).join('');

    if (!textContent) {
      throw new Error('[Gemini] No text content returned in response.');
    }

    return {
      content: textContent,
      model: modelId,
      provider: this.name,
      usage: data.usageMetadata
        ? {
            inputTokens: data.usageMetadata.promptTokenCount,
            outputTokens: data.usageMetadata.candidatesTokenCount,
          }
        : undefined,
    };
  }

  /** @inheritdoc */
  async listModels(apiKey: string): Promise<AIModel[]> {
    const response = await fetch(`${GEMINI_API_URL}/models?key=${apiKey}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as GeminiErrorResponse;
      const detail = errorData.error?.message ?? response.statusText;
      throw new Error(`[Gemini] Failed to list models (${response.status}): ${detail}`);
    }

    const data = (await response.json()) as GeminiModelListResponse;

    if (!data.models) {
      return [];
    }

    // Only keep models that support generateContent (i.e., chat-capable)
    return data.models
      .filter((m) => m.supportedGenerationMethods.includes('generateContent'))
      .map((m) => {
        const id = m.name.replace('models/', '');
        return {
          id,
          name: m.displayName || id,
          provider: this.name as ProviderName,
          contextWindow: m.inputTokenLimit,
          maxOutputTokens: m.outputTokenLimit,
          capabilities: inferCapabilities(m.supportedGenerationMethods, id),
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  /** @inheritdoc */
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${GEMINI_API_URL}/models?key=${apiKey}`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
