'use client';

import { useState } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { FeatureMatrixTab } from './feature-matrix-tab';
import { PositioningMapTab } from './positioning-map-tab';
import { CompetitiveScoreTab } from './competitive-score-tab';
import { TimelineChart } from './timeline-chart';
import { PricingChart } from './pricing-chart';
import { ThreatMatrix } from './threat-matrix';

type SubTab = 'features' | 'positioning' | 'score' | 'timeline' | 'pricing' | 'threats';

export function AnalysisTab() {
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('features');

    const subTabs: { id: SubTab; label: string }[] = [
        { id: 'features', label: t.analysisSubTabs?.features || 'Feature Matrix' },
        { id: 'positioning', label: t.analysisSubTabs?.positioning || 'Positioning Map' },
        { id: 'score', label: t.analysisSubTabs?.score || 'Competitive Score' },
        { id: 'timeline', label: t.analysisSubTabs?.timeline || 'Timeline' },
        { id: 'pricing', label: t.analysisSubTabs?.pricing || 'Pricing' },
        { id: 'threats', label: t.analysisSubTabs?.threats || 'Threats' },
    ];

    return (
        <div className="space-y-4">
            {/* Sub-navigation */}
            <div className="flex gap-1 p-1 bg-[#181a24] rounded-lg w-fit overflow-x-auto">
                {subTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                            activeSubTab === tab.id
                                ? 'bg-[#6c5ce7]/20 text-[#a29bfe]'
                                : 'text-[#8b8fa3] hover:text-[#e8e9ed] hover:bg-[#1e2029]'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeSubTab === 'features' && <FeatureMatrixTab />}
            {activeSubTab === 'positioning' && <PositioningMapTab />}
            {activeSubTab === 'score' && <CompetitiveScoreTab />}
            {activeSubTab === 'timeline' && <TimelineChart />}
            {activeSubTab === 'pricing' && <PricingChart />}
            {activeSubTab === 'threats' && <ThreatMatrix />}
        </div>
    );
}
