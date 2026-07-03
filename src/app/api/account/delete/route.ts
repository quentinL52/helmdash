import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security/with-auth';
import { stripe } from '@/lib/billing/stripe-client';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Initialise un client Supabase avec les droits admin (Service Role Key)
const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function handler(req: NextRequest, { userId }: { userId: string }) {
  try {
    // 1. Récupérer l'utilisateur pour vérifier son abonnement Stripe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, stripeSubscriptionId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Annuler l'abonnement Stripe si existant et actif
    if (user.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      } catch (err: any) {
        console.error(`[DELETE_ACCOUNT] Failed to cancel Stripe subscription: ${err.message}`);
        // On continue même si l'annulation Stripe échoue (ex: déjà annulé)
      }
    }
    
    // Supprimer le client Stripe pour nettoyer les données côté Stripe
    if (user.stripeCustomerId) {
      try {
        await stripe.customers.del(user.stripeCustomerId);
      } catch (err: any) {
        console.error(`[DELETE_ACCOUNT] Failed to delete Stripe customer: ${err.message}`);
      }
    }

    // 3. Supprimer l'utilisateur de la base de données (Prisma)
    // Grâce au 'onDelete: Cascade' dans schema.prisma, cela supprimera toutes ses données liées
    await prisma.user.delete({
      where: { id: userId }
    });

    // 4. Supprimer l'utilisateur de Supabase Auth
    // Ceci révoquera aussi ses sessions actives
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error(`[DELETE_ACCOUNT] Failed to delete Supabase user: ${authError.message}`);
      // L'utilisateur est déjà supprimé de la DB, on renvoie quand même 200, mais on logue l'erreur
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE_ACCOUNT_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const DELETE = withAuth(handler);
