'use client';

import { useState } from 'react';

import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, BarChart3, Zap } from 'lucide-react';
import { LeanDashboardTab } from './components/lean-dashboard-tab';
import { LeanAnalysisTab } from './components/lean-analysis-tab';
import { LeanActionsTab } from './components/lean-actions-tab';
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

    return (
        <div className="h-full flex flex-col p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#e8e9ed]">{t.title}</h1>
                <p className="text-[#8b8fa3]">{t.subtitle}</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full max-w-[600px] grid-cols-3 bg-[#181a24] text-[#8b8fa3] mb-6">
                    <TabsTrigger
                        value="dashboard"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        <LayoutDashboard className="mr-1.5 h-4 w-4" />
                        {t.tabs.dashboard}
                    </TabsTrigger>
                    <TabsTrigger
                        value="analysis"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        <BarChart3 className="mr-1.5 h-4 w-4" />
                        {t.tabs.analysis}
                    </TabsTrigger>
                    <TabsTrigger
                        value="actions"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
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
        </div>
    );
}

