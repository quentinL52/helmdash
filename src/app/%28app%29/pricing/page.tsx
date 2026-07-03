'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-foreground">
          Pricing
        </h2>
        <p className="mt-6 text-lg text-muted-foreground">
          Manage your subscription from the billing settings.
        </p>
        <Button
          className="mt-8"
          onClick={() => router.push('/settings')}
        >
          Go to Settings
        </Button>
      </div>
    </div>
  );
}
