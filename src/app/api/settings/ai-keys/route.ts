import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withAuth, withValidation } from '@/lib/security';

const PROVIDERS = ['openai', 'anthropic', 'google', 'mistral'] as const;

const upsertSchema = z.object({
  provider: z.enum(PROVIDERS),
  apiKey: z.string().min(1, 'API key is required'),
  activeAgents: z.array(z.string()).optional(),
  modelsConfig: z.record(z.unknown()).optional(),
});

/**
 * PUT /api/settings/ai-keys
 *
 * Enregistre ou met à jour une clé API pour un fournisseur IA.
 * La clé est chiffrée via AES-256-GCM avant stockage (api-key-encryption.ts).
 * Ne retourne JAMAIS la clé en clair dans la réponse.
 */
async function handler(
  req: NextRequest,
  { userId, body }: { userId: string; body: z.infer<typeof upsertSchema> },
) {
  try {
    const { encryptApiKey } = await import('@/lib/ai/api-key-encryption');
    const encryptedApiKey = await encryptApiKey(body.apiKey, userId);

    // Store as JSON string (encrypt returns {iv, content, tag})
    const apiKeyStr = JSON.stringify(encryptedApiKey);

    await prisma.aiSettings.upsert({
      where: { userId },
      create: {
        userId,
        provider: body.provider,
        apiKey: apiKeyStr,
        activeAgents: body.activeAgents ?? null,
        modelsConfig: body.modelsConfig ?? null,
      },
      update: {
        provider: body.provider,
        apiKey: apiKeyStr,
        activeAgents: body.activeAgents ?? null,
        modelsConfig: body.modelsConfig ?? null,
      },
    });

    return NextResponse.json({
      ok: true,
      provider: body.provider,
      message: `API key for ${body.provider} configured and encrypted.`,
    });
  } catch (error) {
    console.error('[Settings AI Keys] Error storing key:', error);
    return NextResponse.json(
      { error: 'Failed to store API key' },
      { status: 500 },
    );
  }
}

export const PUT = withAuth(withValidation(upsertSchema)(handler));