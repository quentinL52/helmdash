'use client';

import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFounderStore, HypothesisStatus, HypothesisRisk, HypothesisCategory } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { BoardSkeleton, TableSkeleton } from '@/components/ui/loading-skeleton';
import { RecommendationBanner } from '@/components/ui/recommendation-banner';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants';

// Lazy load heavy board and list components
const HypothesesBoard = dynamic(
    () => import('@/components/hypotheses/hypotheses-board').then(m => m.HypothesesBoard),
    { loading: () => <BoardSkeleton /> }
);
const HypothesesList = dynamic(
    () => import('@/components/hypotheses/hypotheses-list').then(m => m.HypothesesList),
    { loading: () => <TableSkeleton /> }
);

export default function HypothesesPage() {
    const language = useFounderStore(s => s.language);
    const t = translations[language].hypotheses;

    const recommendations = useFounderStore(s => s.strategicRecommendations?.hypothesisSuggestions);
    const showRecommendations = useFounderStore(s => s.showStrategicRecommendations);
    const toggleRecommendations = useFounderStore(s => s.toggleStrategicRecommendations);
    const addHypothesis = useFounderStore(s => s.addHypothesis);

    return (
        <div className="flex flex-col h-full space-y-4 p-8 pt-6 font-sans text-[#e8e9ed]">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
                <Button
                    variant="default"
                    size="sm"
                    onClick={toggleRecommendations}
                    style={{ background: showRecommendations ? COLORS.accent + '22' : COLORS.surface, color: showRecommendations ? COLORS.accent : COLORS.textMuted }}
                >
                    <Sparkles className="w-4 h-4" />
                </Button>
            </div>

            {showRecommendations && recommendations && recommendations.length > 0 && (
                <RecommendationBanner
                    recommendations={recommendations}
                    type="hypotheses"
                    onApply={(item) => addHypothesis({
                        statement: item.statement,
                        category: item.category as HypothesisCategory,
                        riskLevel: 'medium' as HypothesisRisk, // Default
                        testMethod: item.testMethod,
                        successCriteria: 'TBD',
                        status: 'draft' as HypothesisStatus
                    })}
                    onDismiss={toggleRecommendations}
                />
            )}

            <Tabs defaultValue="board" className="h-full flex flex-col">
                <TabsList className="grid w-[400px] grid-cols-2 bg-[#181a24] text-[#8b8fa3] mb-4">
                    <TabsTrigger value="board" className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white">{t.tabs.board}</TabsTrigger>
                    <TabsTrigger value="list" className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white">{t.tabs.list}</TabsTrigger>
                </TabsList>
                <TabsContent value="board" className="flex-1 overflow-hidden mt-0">
                    <HypothesesBoard />
                </TabsContent>
                <TabsContent value="list" className="h-full mt-0">
                    <HypothesesList />
                </TabsContent>
            </Tabs>
        </div>
    );
}
