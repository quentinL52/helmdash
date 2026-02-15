'use client';

import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain } from 'lucide-react';
import { OverviewTab } from './components/overview-tab';
import { RadarTab } from './components/radar-tab';
import { SwotTab } from './components/swot-tab';
import { MarketSignalsTab } from './components/market-signals-tab';
import { AiInsightsTab } from './components/ai-insights-tab';
import { FeatureMatrixTab } from './components/feature-matrix-tab';
import { PositioningMapTab } from './components/positioning-map-tab';
import { CompetitiveScoreTab } from './components/competitive-score-tab';

export default function CompetitiveWatchPage() {
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    return (
        <div className="h-full flex flex-col p-8 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#e8e9ed]">{t.title}</h1>
                <p className="text-[#8b8fa3]">{t.subtitle}</p>
            </div>

            <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                <TabsList className="grid w-full max-w-[1200px] grid-cols-8 bg-[#181a24] text-[#8b8fa3] mb-6">
                    <TabsTrigger
                        value="overview"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        {t.tabs.overview}
                    </TabsTrigger>
                    <TabsTrigger
                        value="features"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        {language === 'fr' ? 'Fonctionnalités' : 'Features'}
                    </TabsTrigger>
                    <TabsTrigger
                        value="positioning"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        {language === 'fr' ? 'Positionnement' : 'Positioning'}
                    </TabsTrigger>
                    <TabsTrigger
                        value="score"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        {language === 'fr' ? 'Score' : 'Score'}
                    </TabsTrigger>
                    <TabsTrigger
                        value="radar"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        {t.tabs.radar}
                    </TabsTrigger>
                    <TabsTrigger
                        value="swot"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        {t.tabs.swot}
                    </TabsTrigger>
                    <TabsTrigger
                        value="signals"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        {t.tabs.signals}
                    </TabsTrigger>
                    <TabsTrigger
                        value="ai-insights"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        <Brain className="mr-1.5 h-4 w-4" />
                        {t.tabs.aiInsights}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="flex-1 mt-0">
                    <OverviewTab />
                </TabsContent>
                <TabsContent value="features" className="flex-1 mt-0">
                    <FeatureMatrixTab />
                </TabsContent>
                <TabsContent value="positioning" className="flex-1 mt-0">
                    <PositioningMapTab />
                </TabsContent>
                <TabsContent value="score" className="flex-1 mt-0">
                    <CompetitiveScoreTab />
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
                <TabsContent value="ai-insights" className="flex-1 mt-0">
                    <AiInsightsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
