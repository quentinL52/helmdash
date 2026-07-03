'use client';

import { useState } from 'react';

import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, BarChart3, Zap, Radar } from 'lucide-react';
import { LeanDashboardTab } from './components/lean-dashboard-tab';
import { LeanAnalysisTab } from './components/lean-analysis-tab';
import { LeanActionsTab } from './components/lean-actions-tab';
import { CompetitorInlineForm } from './components/competitor-inline-form';
import { PageAgent } from '@/components/agent/PageAgent';
import { createClient } from '@/utils/supabase/client';
import { useEffect } from 'react';
// Kept for future advanced mode reactivation
// import { MarketSignalsTab } from './components/market-signals-tab';

/**
 * Page principale de la Veille Stratégique.
 *
 * Structure lean : 3 onglets (Dashboard, Analyse, Actions).
 * Le mode Avancé est désactivé pour l'instant (composants conservés).
 */
export default function CompetitiveWatchPage() {
    const language = useFounderStore((s) => s.language);
    const t = (translations[language] as any).competitiveWatch;
    const [activeTab, setActiveTab] = useState('dashboard');
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id);
        });
    }, []);

    const [showMySolutionForm, setShowMySolutionForm] = useState(false);
    const mySolution = useFounderStore((s) => s.mySolution);

    return (
        <div className="h-full flex flex-col p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-pixel text-warning flex items-center gap-3">
                        <Radar className="w-8 h-8" />
                        {t.title}
                    </h1>
                    <p className="text-muted-foreground mt-2">{t.subtitle}</p>
                </div>
                <Button
                    onClick={() => setShowMySolutionForm(!showMySolutionForm)}
                    className="flex items-center gap-2"
                >
                    <LayoutDashboard className="h-4 w-4" />
                    {language === 'fr' ? 'Ma Solution' : 'My Solution'}
                </Button>
            </div>

            {/* My Solution Inline Form */}
            {showMySolutionForm && (
                <div className="mb-6 animate-in slide-in-from-top-4 fade-in duration-300">
                    <CompetitorInlineForm
                        onCancel={() => setShowMySolutionForm(false)}
                        onSuccess={() => setShowMySolutionForm(false)}
                        isMySolution={true}
                        initialData={mySolution}
                    />
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full max-w-[600px] grid-cols-3 bg-primary/10 text-muted-foreground mb-6">
                    <TabsTrigger value="dashboard">
                        <LayoutDashboard className="mr-1.5 h-4 w-4" />
                        {t.tabs.dashboard}
                    </TabsTrigger>
                    <TabsTrigger value="analysis">
                        <BarChart3 className="mr-1.5 h-4 w-4" />
                        {t.tabs.analysis}
                    </TabsTrigger>
                    <TabsTrigger value="actions">
                        <Zap className="mr-1.5 h-4 w-4" />
                        {t.tabs.actions}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="flex-1 mt-0">
                    <LeanDashboardTab onTabChange={setActiveTab} />
                </TabsContent>
                <TabsContent value="analysis" className="flex-1 mt-0">
                    <LeanAnalysisTab advancedMode={false} />
                </TabsContent>
                <TabsContent value="actions" className="flex-1 mt-0">
                    <LeanActionsTab advancedMode={false} />
                </TabsContent>
            </Tabs>
            {userId && <PageAgent userId={userId} pageLabel={(translations[language] as any).competitiveWatch?.nav || 'Veille'} />}
        </div>
    );
}

