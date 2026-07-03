'use client';

import { useTranslations } from 'next-intl';
import { BillingPanel } from '@/components/dashboard/billing-panel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BillingSettingsPage() {
  const t = useTranslations('billing');
  const tc = useTranslations('common');

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
            {t('subscriptionTitle')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('subscriptionSubtitle')}
          </p>
        </div>
      </div>

      <BillingPanel />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('billingInfo')}</CardTitle>
          <CardDescription>
            {t('paymentSecure')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>{t('paymentEncrypted')}</p>
          <p>{t('invoiceByEmail')}</p>
          <p>{t('upgradeAnytime')}</p>
          <p>{t('cancelAnytime')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
