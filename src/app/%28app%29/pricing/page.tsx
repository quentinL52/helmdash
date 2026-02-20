'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const TIERS = [
    {
        name: 'Starter',
        id: 'starter',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || '',
        priceMonthly: '9€',
        description: 'Les fondations essentielles pour structurer votre projet.',
        features: [
            "Validation d'hypothèses illimitées",
            "Suivi de la Runway basique",
            "Routines quotidiennes",
            "Support par e-mail",
        ],
    },
    {
        name: 'Growth',
        id: 'growth',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH || '',
        priceMonthly: '29€',
        description: 'Pour les fondateurs prêts à accélérer leur traction.',
        popular: true,
        features: [
            "Tout de Starter, plus :",
            "Score de compétitivité",
            "Rapport IA hebdomadaire (Standard)",
            "Génération d'idées de contenu",
            "Support prioritaire",
        ],
    },
    {
        name: 'Scale',
        id: 'scale',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCALE || '',
        priceMonthly: '99€',
        description: 'Automatisation complète et intelligence artificielle.',
        features: [
            'Tout de Growth, plus :',
            'Diagnostic approfondi (Intelligence Company)',
            'Rapport IA hebdomadaire (Actionnable & Stratégique)',
            'Veille concurrentielle automatisée',
            'Accès API / Intégrations sur mesure',
        ],
    },
];

export default function PricingPage() {
    const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubscribe = async (priceId: string, planTier: string) => {
        if (!priceId) {
            toast({
                title: "Configuration incomplète",
                description: "L'identifiant de prix (price_id) Stripe n'est pas configuré dans l'environnement.",
                variant: "destructive"
            });
            return;
        }

        setLoadingPriceId(priceId);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ priceId, planTier }),
            });

            if (!response.ok) {
                throw new Error('La création de la session de paiement a échoué');
            }

            const { url } = await response.json();
            if (url) {
                window.location.assign(url);
            }
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoadingPriceId(null);
        }
    };

    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">Tarification</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Choisissez le plan adapté à votre ambition
                    </p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground">
                    Commencez gratuitement, puis évoluez avec les fonctionnalités premium "Market-Ready" alimentées par l'Intelligence Artificielle.
                </p>
                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
                    {TIERS.map((tier, tierIdx) => (
                        <div
                            key={tier.id}
                            className={`rounded-3xl p-8 ring-1 xl:p-10 ${tier.popular
                                ? 'bg-white/5 ring-[#6c5ce7] relative'
                                : 'bg-card ring-[#1f212e]'
                                }`}
                        >
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-foreground px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                                    Le plus populaire
                                </div>
                            )}
                            <h3
                                id={tier.id}
                                className={`text-lg font-semibold leading-8 ${tier.popular ? 'text-accent-foreground' : 'text-foreground'
                                    }`}
                            >
                                {tier.name}
                            </h3>
                            <p className="mt-4 text-sm leading-6 text-muted-foreground">{tier.description}</p>
                            <p className="mt-6 flex items-baseline gap-x-1">
                                <span className="text-4xl font-bold tracking-tight text-foreground">{tier.priceMonthly}</span>
                                <span className="text-sm font-semibold leading-6 text-muted-foreground">/mois</span>
                            </p>
                            <Button
                                onClick={() => handleSubscribe(tier.priceId, tier.id)}
                                disabled={loadingPriceId !== null}
                                className={`mt-6 w-full ${tier.popular
                                    ? 'bg-primary text-foreground hover:bg-primary/90'
                                    : 'bg-white/10 text-foreground hover:bg-white/20'
                                    }`}
                            >
                                {loadingPriceId === tier.priceId ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                {loadingPriceId === tier.priceId ? "Redirection..." : "S'abonner"}
                            </Button>
                            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground xl:mt-10">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex gap-x-3 text-foreground">
                                        <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
