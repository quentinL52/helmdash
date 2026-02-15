'use client';

import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { BoardSkeleton, TableSkeleton } from '@/components/ui/loading-skeleton';

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

    return (
        <div className="flex flex-col h-full space-y-4 p-8 pt-6 font-sans text-[#e8e9ed]">
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
