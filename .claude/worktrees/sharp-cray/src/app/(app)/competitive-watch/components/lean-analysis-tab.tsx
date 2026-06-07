'use client';

import { useState, useEffect } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Import existing sub-tab components
import { RadarTab } from './radar-tab';
import { FeatureMatrixTab } from './feature-matrix-tab';

import { PricingChart } from './pricing-chart';
import { TimelineChart } from './timeline-chart';
import { ThreatMatrix } from './threat-matrix';
import { CompetitiveScoreTab } from './competitive-score-tab';

interface LeanAnalysisTabProps {
    /** Whether to show advanced sub-tabs (Timeline, Threats, Score) */
    advancedMode: boolean;
}

/**
 * Lean Analysis Tab: consolidates Radar, Pricing, and Feature Matrix.
 * In Advanced mode, also shows Timeline, Threats, and Competitive Score.
 */
export function LeanAnalysisTab({ advancedMode }: LeanAnalysisTabProps) {
    const language = useFounderStore((s) => s.language);
    const t = (translations[language] as any).competitiveWatch;
    const [activeSubTab, setActiveSubTab] = useState('radar');

    const essentialTabs = [
        { key: 'radar', label: t.tabs.radar },
        { key: 'features', label: t.analysisSubTabs.features },

        { key: 'pricing', label: t.analysisSubTabs.pricing },
    ];

    const advancedTabs = [
        { key: 'timeline', label: t.analysisSubTabs.timeline },
        { key: 'threats', label: t.analysisSubTabs.threats },
        { key: 'score', label: t.analysisSubTabs.score },
    ];

    const allTabs = advancedMode ? [...essentialTabs, ...advancedTabs] : essentialTabs;

    // Reset to an essential tab if switching out of advanced while on an advanced-only sub-tab
    useEffect(() => {
        if (!advancedMode && advancedTabs.some((tab) => tab.key === activeSubTab)) {
            setActiveSubTab('radar');
        }
    }, [advancedMode]);

    return (
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-4">
            <TabsList className="flex flex-wrap h-auto gap-1">
                {allTabs.map((tab) => (
                    <TabsTrigger key={tab.key} value={tab.key} className="text-xs">
                        {tab.label}
                        {advancedMode && advancedTabs.some((at) => at.key === tab.key) && (
                            <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">
                                {t.leanMode.advanced}
                            </Badge>
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value="radar">
                <RadarTab />
            </TabsContent>

            <TabsContent value="features">
                <FeatureMatrixTab />
            </TabsContent>



            <TabsContent value="pricing">
                <PricingChart />
            </TabsContent>

            {advancedMode && (
                <>
                    <TabsContent value="timeline">
                        <TimelineChart />
                    </TabsContent>

                    <TabsContent value="threats">
                        <ThreatMatrix />
                    </TabsContent>

                    <TabsContent value="score">
                        <CompetitiveScoreTab />
                    </TabsContent>
                </>
            )}
        </Tabs>
    );
}
