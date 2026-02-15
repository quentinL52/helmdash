'use client';

import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, BarChart3, Radar, Grid2x2, Radio, Brain } from 'lucide-react';
import { IntelligenceDashboardTab } from './components/intelligence-dashboard-tab';
import { AnalysisTab } from './components/analysis-tab';
import { RadarTab } from './components/radar-tab';
import { SwotTab } from './components/swot-tab';
import { MarketSignalsTab } from './components/market-signals-tab';
import { AiInsightsTab } from './components/ai-insights-tab';

export default function CompetitiveWatchPage() {
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    return (
        <div className="h-full flex flex-col p-8 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#e8e9ed]">{t.title}</h1>
                <p className="text-[#8b8fa3]">{t.subtitle}</p>
            </div>

            <Tabs defaultValue="dashboard" className="flex-1 flex flex-col">
                <TabsList className="grid w-full max-w-[900px] grid-cols-6 bg-[#181a24] text-[#8b8fa3] mb-6">
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
                        value="radar"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        <Radar className="mr-1.5 h-4 w-4" />
                        {t.tabs.radar}
                    </TabsTrigger>
                    <TabsTrigger
                        value="swot"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        <Grid2x2 className="mr-1.5 h-4 w-4" />
                        {t.tabs.swot}
                    </TabsTrigger>
                    <TabsTrigger
                        value="signals"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        <Radio className="mr-1.5 h-4 w-4" />
                        {t.tabs.signals}
                    </TabsTrigger>
                    <TabsTrigger
                        value="ai-strategy"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        <Brain className="mr-1.5 h-4 w-4" />
                        {t.tabs.aiStrategy}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="flex-1 mt-0">
                    <IntelligenceDashboardTab />
                </TabsContent>
                <TabsContent value="analysis" className="flex-1 mt-0">
                    <AnalysisTab />
                </TabsContent>
                <TabsContent value="radar" className="flex-1 mt-0">
                    <RadarTab />
                </TabsContent>
                <TabsContent value="swot" className="flex-1 mt-0">
                    <SwotTab />
                </TabsContent>
                <TabsContent value="signals" className="flex-1 mt-0">
                    <MarketSignalsTab />
                </TabsContent>
                <TabsContent value="ai-strategy" className="flex-1 mt-0">
                    <AiInsightsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
