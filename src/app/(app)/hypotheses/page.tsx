'use client';

import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFounderStore, HypothesisStatus, HypothesisRisk, HypothesisCategory } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { BoardSkeleton, TableSkeleton } from '@/components/ui/loading-skeleton';
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
    const addHypothesis = useFounderStore(s => s.addHypothesis);

    return (
        <div className="flex flex-col h-full space-y-4 p-8 pt-6 font-sans text-foreground">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
                    <p className="text-muted-foreground text-sm">{t.subtitle}</p>
                </div>
            </div>

            <Tabs defaultValue="board" className="h-full flex flex-col">
                <TabsList className="grid w-[400px] grid-cols-2 bg-[#6c5ce7]/10 text-muted-foreground mb-4">
                    <TabsTrigger value="board">{t.tabs.board}</TabsTrigger>
                    <TabsTrigger value="list">{t.tabs.list}</TabsTrigger>
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
