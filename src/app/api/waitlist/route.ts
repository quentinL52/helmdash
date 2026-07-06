import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const waitlistSchema = z.object({
  email: z.string().email('Email invalide'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = waitlistSchema.parse(body);

    // Try to create, ignore if already exists
    const entry = await prisma.waitlist.upsert({
      where: { email },
      update: {},
      create: { email, source: 'landing' },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Waitlist error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
