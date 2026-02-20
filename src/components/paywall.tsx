'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFounderStore } from '@/store/founder-store';

interface PaywallProps {
    requiredTier: 'starter' | 'growth' | 'scale';
    children: ReactNode;
    title?: string;
    description?: string;
}

const TIER_LEVELS = {
    free: 0,
    starter: 1,
    growth: 2,
    scale: 3
};

export function Paywall({ requiredTier, children, title = "Fonctionnalité Premium", description }: PaywallProps) {
    const userTier = useFounderStore((state) => state.planTier);

    // Ensure both current and required levels exist in map, fallback to free
    const currentLevel = TIER_LEVELS[userTier] ?? 0;
    const requiredLevel = TIER_LEVELS[requiredTier];

    if (currentLevel >= requiredLevel) {
        return <>{children}</>;
    }

    return (
        <div className="relative isolate flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-card border border-border overflow-hidden">
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-accent opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
            </div>

            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-lg shadow-black/50">
                <Lock className="w-8 h-8 text-primary" />
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">{title}</h3>

            <p className="text-lg leading-relaxed text-muted-foreground max-w-lg mb-8">
                {description || (
                    <>
                        Le plan <span className="capitalize font-semibold text-accent-foreground">{requiredTier}</span> est requis pour accéder à cette fonctionnalité experte.
                        Upgradez votre workspace pour propulser votre croissance.
                    </>
                )}
            </p>

            <Link href="/pricing" passHref>
                <Button className="bg-[#6c5ce7] hover:bg-[#6c5ce7]/90 text-white px-8 h-12 text-base font-semibold shadow-md">
                    Voir les abonnements
                </Button>
            </Link>
        </div>
    );
}

// Higher order component variant to wrap entire pages easily
export function withPaywall(Component: React.ComponentType<any>, requiredTier: 'starter' | 'growth' | 'scale') {
    return function ProtectedComponent(props: any) {
        return (
            <Paywall requiredTier={requiredTier}>
                <Component {...props} />
            </Paywall>
        );
    };
}
