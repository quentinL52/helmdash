/**
 * @module openai-adapter
 * @description OpenAI provider adapter.
 * Wraps the official `openai` SDK for chat completions, model listing,
 * and API key validation.
 */

import OpenAI from 'openai';
import type {
  AIModel,
  AIProvider,
  ChatMessage,
  ChatOptions,
  ChatResponse,
  ProviderName,
} from '../provider-interface';

/** Set of model ID prefixes considered relevant for chat use-cases. */
const RELEVANT_MODEL_PREFIXES = [
  'gpt-4o',
  'gpt-4-turbo',
  'gpt-4',
  'gpt-3.5-turbo',
  'o1',
  'o3',
  'o4',
] as const;

/**
 * Known capabilities per model family.
 * Falls back to `['chat']` for unrecognised models.
 */
function getModelCapabilities(modelId: string): AIModel['capabilities'] {
  if (modelId.startsWith('gpt-4o') || modelId.startsWith('gpt-4-turbo')) {
    return ['chat', 'vision', 'function-calling', 'streaming'];
  }
  if (modelId.startsWith('gpt-4')) {
    return ['chat', 'function-calling', 'streaming'];
  }
  if (modelId.startsWith('o1') || modelId.startsWith('o3') || modelId.startsWith('o4')) {
    return ['chat', 'streaming'];
  }
  return ['chat', 'function-calling', 'streaming'];
}

/** Checks whether a model ID matches one of our relevant prefixes. */
function isRelevantModel(modelId: string): boolean {
  return RELEVANT_MODEL_PREFIXES.some((prefix) => modelId.startsWith(prefix));
}

/**
 * OpenAI adapter implementing the `AIProvider` interface.
 * Uses the official `openai` npm package already installed in the project.
 */
export class OpenAIAdapter implements AIProvider {
  readonly name: ProviderName = 'openai';
  readonly displayName = 'OpenAI';

  /** @inheritdoc */
  async chat(
    messages: ChatMessage[],
    model: string,
    options?: ChatOptions
  ): Promise<ChatResponse> {
    const apiKey = options?.apiKey || process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('[OpenAI] No API key configured (AI_API_KEY or OPENAI_API_KEY).');
    }

    const client = new OpenAI({ apiKey });

    const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [];

    // Prepend system prompt if provided via options
    if (options?.systemPrompt) {
      openaiMessages.push({ role: 'system', content: options.systemPrompt });
    }

    // Map generic messages to OpenAI format
    for (const msg of messages) {
      openaiMessages.push({ role: msg.role, content: msg.content });
    }

    const completion = await client.chat.completions.create({
      model,
      messages: openaiMessages,
      ...(options?.temperature !== undefined && { temperature: options.temperature }),
      ...(options?.maxTokens !== undefined && { max_tokens: options.maxTokens }),
    });

    const choice = completion.choices[0];
    if (!choice?.message?.content) {
      throw new Error('[OpenAI] No content returned in completion response.');
    }

    return {
      content: choice.message.content,
      model: completion.model,
      provider: this.name,
      usage: completion.usage
        ? {
            inputTokens: completion.usage.prompt_tokens,
            outputTokens: completion.usage.completion_tokens,
          }
        : undefined,
    };
  }

  /** @inheritdoc */
  async listModels(apiKey: string): Promise<AIModel[]> {
    const client = new OpenAI({ apiKey });

    try {
      const response = await client.models.list();
      const models: AIModel[] = [];

      for await (const m of response) {
        if (isRelevantModel(m.id)) {
          models.push({
            id: m.id,
            name: m.id,
            provider: this.name,
            capabilities: getModelCapabilities(m.id),
          });
        }
      }

      // Sort alphabetically for consistent ordering
      return models.sort((a, b) => a.id.localeCompare(b.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`[OpenAI] Failed to list models: ${message}`);
    }
  }

  /** @inheritdoc */
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const client = new OpenAI({ apiKey });
      // Minimal call to verify the key works
      const models = client.models.list();
      // Consume at least one item to ensure the request succeeds
      for await (const _ of models) {
        break;
      }
      return true;
    } catch {
      return false;
    }
  }
}
