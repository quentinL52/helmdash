import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security/with-auth';
import { stripe } from '@/lib/billing/stripe-client';
import { sendDeletionScheduledEmail } from '@/lib/email/email-service';

async function handler(req: NextRequest, { userId }: { userId: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, stripeCustomerId: true, stripeSubscriptionId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      } catch (err: any) {
        console.error(`[DELETE_ACCOUNT] Failed to cancel Stripe subscription: ${err.message}`);
      }
    }
    
    // Au lieu de supprimer le client Stripe immédiatement, on peut annuler l'abonnement
    // mais on garde le soft delete sur le compte Helmdash.

    await prisma.user.update({
      where: { id: userId },
      data: {
        deletionRequestedAt: new Date(),
        planStatus: 'readonly'
      }
    });

    try {
      await sendDeletionScheduledEmail(user.email, user.name);
    } catch (err) {
      console.error('[DELETE_ACCOUNT] Failed to send deletion scheduled email', err);
    }

    // Note: on ne supprime pas l'utilisateur de Supabase Auth ici (soft delete).
    // Les sessions existantes peuvent rester ou le front peut forcer un signOut().
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE_ACCOUNT_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const DELETE = withAuth(handler);
