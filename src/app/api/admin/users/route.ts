import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Vérification de l'admin par email
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'quentin@helmdash.com').split(',');
  if (!ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ users });
}
