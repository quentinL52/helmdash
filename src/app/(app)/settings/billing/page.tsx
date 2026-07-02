'use client';

import { BillingPanel } from '@/components/dashboard/billing-panel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BillingSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-mono text-primary flex items-center gap-3">
            <CreditCard className="w-8 h-8" />
            Abonnement
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre forfait, votre méthode de paiement et vos factures.
          </p>
        </div>
      </div>

      <BillingPanel currentPlan="free" />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informations de facturation</CardTitle>
          <CardDescription>
            Tous les paiements sont sécurisés via Stripe. Vos coordonnées bancaires ne sont jamais stockées sur nos serveurs.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>🔒 Paiement chiffré via Stripe (PCI DSS Level 1)</p>
          <p>📧 Factures envoyées par email après chaque paiement</p>
          <p>🔄 Upgrade/downgrade à tout moment, sans frais</p>
          <p>❌ Pas d'engagement — annulation possible depuis votre portail Stripe</p>
        </CardContent>
      </Card>
    </div>
  );
}