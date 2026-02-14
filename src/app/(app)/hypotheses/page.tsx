'use client';

import { HypothesesBoard } from '@/components/hypotheses/hypotheses-board';
import { HypothesesList } from '@/components/hypotheses/hypotheses-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';

export default function HypothesesPage() {
    const { language } = useFounderStore();
    const t = translations[language].common;

    return (
        <div className="flex flex-col h-full space-y-4 p-8 pt-6 font-sans text-[#e8e9ed]">
            <Tabs defaultValue="board" className="h-full flex flex-col">
                <TabsList className="grid w-[400px] grid-cols-2 bg-[#181a24] text-[#8b8fa3] mb-4">
                    <TabsTrigger value="board" className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white">Kanban Board</TabsTrigger>
                    <TabsTrigger value="list" className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white">List View</TabsTrigger>
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

