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
  COHORT_CONFIG,
  getAvailablePeriods,
  type Cohort,
  type Period,
} from '@/lib/billing/cohort-config';

interface CohortStatus {
  current: Cohort;
  seatsLeft: number | null;
  cohorts: {
    founders: { taken: number; max: number };
    early: { taken: number; max: number };
  };
}

const COHORT_BADGES: Record<Cohort, { icon: typeof Crown; className: string }> = {
  founders: { icon: Crown, className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  early: { icon: Sparkles, className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  full: { icon: CreditCard, className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

export function BillingPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [cohortStatus, setCohortStatus] = useState<CohortStatus | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('semi_annual');
  const { toast } = useToast();
  const t = useTranslations('billing');
  const tc = useTranslations('cohort');
  const te = useTranslations('errors');

  const planStatus = useFounderStore((s) => s.planStatus);
  const cohort = useFounderStore((s) => s.cohort);
  const cohortRank = useFounderStore((s) => s.cohortRank);

  useEffect(() => {
    fetch('/api/billing/cohort-status')
      .then((r) => r.json())
      .then(setCohortStatus)
      .catch(() => {});
  }, []);

  const isSubscribed = planStatus === 'active' && cohort;

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: selectedPeriod }),
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

  const currentCohort = cohortStatus?.current ?? 'full';
  const availablePeriods = getAvailablePeriods(currentCohort);

  useEffect(() => {
    if (!availablePeriods.includes(selectedPeriod)) {
      setSelectedPeriod(availablePeriods[0]);
    }
  }, [currentCohort, availablePeriods, selectedPeriod]);

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
        {isSubscribed && cohort ? (
          <SubscribedView
            cohort={cohort}
            cohortRank={cohortRank}
            onPortal={handlePortal}
            isLoading={isLoading}
          />
        ) : (
          <CheckoutView
            planStatus={planStatus}
            currentCohort={currentCohort}
            cohortStatus={cohortStatus}
            availablePeriods={availablePeriods}
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
  cohort,
  cohortRank,
  onPortal,
  isLoading,
}: {
  cohort: Cohort;
  cohortRank: number | null;
  onPortal: () => void;
  isLoading: boolean;
}) {
  const t = useTranslations('billing');
  const tc = useTranslations('cohort');
  const BadgeIcon = COHORT_BADGES[cohort].icon;
  const config = COHORT_CONFIG[cohort];
  const lockLabel =
    config.lockMonths === null
      ? t('priceLockedForLife')
      : t('priceLockedFor', { months: config.lockMonths });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={`text-sm px-3 py-1 ${COHORT_BADGES[cohort].className}`}
        >
          <BadgeIcon className="w-4 h-4 mr-1.5" />
          {tc(cohort)}
          {cohortRank ? ` #${cohortRank}` : ''}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{lockLabel}</p>

      <Button onClick={onPortal} disabled={isLoading} variant="outline">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('manageSubscription')}
      </Button>
    </div>
  );
}

function CheckoutView({
  planStatus,
  currentCohort,
  cohortStatus,
  availablePeriods,
  selectedPeriod,
  onSelectPeriod,
  onCheckout,
  isLoading,
}: {
  planStatus: string;
  currentCohort: Cohort;
  cohortStatus: CohortStatus | null;
  availablePeriods: Period[];
  selectedPeriod: Period;
  onSelectPeriod: (p: Period) => void;
  onCheckout: () => void;
  isLoading: boolean;
}) {
  const t = useTranslations('billing');
  const tc = useTranslations('cohort');
  const config = COHORT_CONFIG[currentCohort];
  const priceEntry = config.prices[selectedPeriod];

  const periodSuffixKey = selectedPeriod === 'monthly' ? 'perMonth' : selectedPeriod === 'semi_annual' ? 'perSemiAnnual' : 'perYear';

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

      {cohortStatus && currentCohort !== 'full' && (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={COHORT_BADGES[currentCohort].className}
          >
            {currentCohort === 'founders'
              ? tc('foundingSeatsLeft', { count: cohortStatus.seatsLeft ?? 0 })
              : tc('earlySeatsLeft', { count: cohortStatus.seatsLeft ?? 0 })}
          </Badge>
        </div>
      )}

      <div className="flex gap-2">
        {availablePeriods.map((p) => (
          <Button
            key={p}
            variant={selectedPeriod === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelectPeriod(p)}
          >
            {t(p === 'semi_annual' ? 'semiAnnual' : p)}
          </Button>
        ))}
      </div>

      {priceEntry && (
        <div className="text-3xl font-bold">
          {(priceEntry.amount / 100).toFixed(2)}€
          <span className="text-base font-normal text-muted-foreground ml-1">
            {t(periodSuffixKey)}
          </span>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {t('allFeaturesIncluded')}
      </p>

      <Button onClick={onCheckout} disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('subscribeNow')}
      </Button>
    </div>
  );
}
