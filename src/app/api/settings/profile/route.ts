import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security/with-auth';

const patchSchema = z.object({
  locale: z.enum(['en', 'fr']).optional(),
  timezone: z.string().optional(),
});

async function handler(req: NextRequest, { userId }: { userId: string }) {
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const data: Record<string, string> = {};
  if (parsed.data.locale) data.locale = parsed.data.locale;
  if (parsed.data.timezone) data.timezone = parsed.data.timezone;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  return NextResponse.json({ ok: true });
}

export const PATCH = withAuth(handler);
