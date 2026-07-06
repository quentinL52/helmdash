'use client';

import { Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CommandCenter } from '@/components/dashboard/command-center';
import { AiUsageGauge } from '@/components/dashboard/ai-usage-gauge';
import { PageAgent } from '@/components/agent/PageAgent';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
    const t = useTranslations('nav');
    const [userId, setUserId] = useState<string | null>(null);
    const [onboardingStatus, setOnboardingStatus] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id);
        });

        // Verifie le statut de l'onboarding
        fetch('/api/onboarding')
            .then(res => res.json())
            .then(data => setOnboardingStatus(data.session?.status))
            .catch(console.error);

        // Check if just onboarded
        if (typeof window !== 'undefined' && window.location.search.includes('onboarded=true')) {
            // Remove from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // On pourrait afficher un toast ici (ex: toast.success('Cockpit initialisé avec succès !'))
        }
    }, []);

    return (
        <div className="flex flex-col h-full space-y-4 p-8 pt-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <h2 className="text-3xl font-bold tracking-tight font-pixel text-primary flex items-center gap-3">
                    <Target className="w-8 h-8" />
                    {t('dashboard')}
                </h2>
            </div>

            <AiUsageGauge />

            {onboardingStatus === 'skipped' && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-primary">Terminez la configuration de votre Cockpit</h3>
                        <p className="text-sm text-muted-foreground">Vous avez ignoré l'onboarding initial. Complétez-le pour configurer votre base de données et votre assistant.</p>
                    </div>
                    <Link href="/onboarding">
                        <Button variant="default">Reprendre l'onboarding</Button>
                    </Link>
                </div>
            )}

            <CommandCenter />
            {userId && <PageAgent userId={userId} pageLabel={t('dashboard')} />}
        </div>
    );
}
