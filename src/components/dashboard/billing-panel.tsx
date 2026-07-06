'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Crown, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFounderStore } from '@/store/founder-store';
import {
  PRICING_CONFIG,
  getAvailablePeriods,
  type PlanType,
  type Period,
} from '@/lib/billing/pricing-config';

interface PricingStatus {
  founderDeal: {
    isAvailable: boolean;
    seatsLeft: number;
    taken: number;
    max: number;
  };
  plans: typeof PRICING_CONFIG.plans;
}

const PLAN_BADGES: Record<PlanType, { icon: typeof Crown; className: string }> = {
  core: { icon: CreditCard, className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  complete: { icon: Sparkles, className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
};

export function BillingPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [pricingStatus, setPricingStatus] = useState<PricingStatus | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('monthly');
  const { toast } = useToast();
  const t = useTranslations('billing');
  const tc = useTranslations('cohort');
  const te = useTranslations('errors');

  const planStatus = useFounderStore((s) => s.planStatus);
  const plan = useFounderStore((s) => s.plan);
  const founderDeal = useFounderStore((s) => s.founderDeal);

  useEffect(() => {
    fetch('/api/billing/pricing-status')
      .then((r) => r.json())
      .then(setPricingStatus)
      .catch(() => {});
  }, []);

  const isSubscribed = planStatus === 'active' && plan;

  const handleCheckout = async (planKey: PlanType | 'founder') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: selectedPeriod, plan: planKey }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || te('checkoutFailed'));
      if (data.url) window.location.href = data.url;
    } catch (error: any) {
      toast({
        title: te('checkoutFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePortal = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || te('generic'));
    } catch (error: any) {
      toast({
        title: te('generic'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>
          {isSubscribed
            ? t('subscribedDescription')
            : t('unsubscribedDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isSubscribed && plan ? (
          <SubscribedView
            plan={plan}
            founderDeal={founderDeal}
            onPortal={handlePortal}
            isLoading={isLoading}
          />
        ) : (
          <CheckoutView
            planStatus={planStatus}
            pricingStatus={pricingStatus}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
            onCheckout={handleCheckout}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}

function SubscribedView({
  plan,
  founderDeal,
  onPortal,
  isLoading,
}: {
  plan: PlanType;
  founderDeal: boolean;
  onPortal: () => void;
  isLoading: boolean;
}) {
  const t = useTranslations('billing');
  const BadgeIcon = PLAN_BADGES[plan].icon;
  const planName = PRICING_CONFIG.plans[plan].name;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={`text-sm px-3 py-1 ${PLAN_BADGES[plan].className}`}
        >
          <BadgeIcon className="w-4 h-4 mr-1.5" />
          {planName}
          {founderDeal && <span className="ml-2 bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded text-xs">Founder Deal</span>}
        </Badge>
      </div>

      <Button onClick={onPortal} disabled={isLoading} variant="outline">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('manageSubscription')}
      </Button>
    </div>
  );
}

function CheckoutView({
  planStatus,
  pricingStatus,
  selectedPeriod,
  onSelectPeriod,
  onCheckout,
  isLoading,
}: {
  planStatus: string;
  pricingStatus: PricingStatus | null;
  selectedPeriod: Period;
  onSelectPeriod: (p: Period) => void;
  onCheckout: (plan: PlanType | 'founder') => void;
  isLoading: boolean;
}) {
  const t = useTranslations('billing');
  const periodSuffixKey = selectedPeriod === 'monthly' ? 'perMonth' : 'perYear';

  return (
    <div className="space-y-6">
      {planStatus === 'readonly' && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          {t('readonlyNotice')}
        </div>
      )}

      {planStatus === 'trialing' && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm">
          {t('trialNotice')}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {['monthly', 'yearly'].map((p) => (
          <Button
            key={p}
            variant={selectedPeriod === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelectPeriod(p as Period)}
          >
            {t(p)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Plan */}
        <div className="border border-border rounded-xl p-5 flex flex-col">
          <h3 className="font-bold text-lg mb-2">{PRICING_CONFIG.plans.core.name}</h3>
          <div className="text-3xl font-bold mb-4">
            {(PRICING_CONFIG.plans.core.prices[selectedPeriod].amount / 100).toFixed(0)}€
            <span className="text-sm font-normal text-muted-foreground ml-1">{t(periodSuffixKey)}</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2 mb-6 flex-1">
            {PRICING_CONFIG.plans.core.features.map((f, i) => <li key={i}>• {f}</li>)}
          </ul>
          <Button onClick={() => onCheckout('core')} disabled={isLoading} variant="outline" className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('subscribeNow')}
          </Button>
        </div>

        {/* Complete Plan */}
        <div className="border border-primary rounded-xl p-5 flex flex-col bg-primary/5">
          <h3 className="font-bold text-lg text-primary mb-2">{PRICING_CONFIG.plans.complete.name}</h3>
          <div className="text-3xl font-bold text-primary mb-4">
            {(PRICING_CONFIG.plans.complete.prices[selectedPeriod].amount / 100).toFixed(0)}€
            <span className="text-sm font-normal text-primary/70 ml-1">{t(periodSuffixKey)}</span>
          </div>
          <ul className="text-sm text-foreground space-y-2 mb-6 flex-1">
            {PRICING_CONFIG.plans.complete.features.map((f, i) => <li key={i}>• {f}</li>)}
          </ul>
          <Button onClick={() => onCheckout('complete')} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('subscribeNow')}
          </Button>
        </div>
      </div>

      {pricingStatus?.founderDeal.isAvailable && (
        <div className="mt-8 border border-amber-500 rounded-xl p-5 bg-amber-500/10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-amber-500 flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Founder Deal (Lifetime)
            </h3>
            <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/30">
              {pricingStatus.founderDeal.seatsLeft} seats left
            </Badge>
          </div>
          <p className="text-sm mb-4">
            Get all <strong>Complete</strong> plan features for a locked-in price of {(PRICING_CONFIG.founderDeal.price.amount / 100).toFixed(0)}€ / month for life.
          </p>
          <Button onClick={() => onCheckout('founder')} disabled={isLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Claim Founder Deal
          </Button>
        </div>
      )}
    </div>
  );
}
