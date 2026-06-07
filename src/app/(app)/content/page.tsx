'use client';

import dynamic from 'next/dynamic';
import { BoardSkeleton } from '@/components/ui/loading-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ContentBoard = dynamic(
    () => import('@/components/content/content-board').then(m => m.ContentBoard),
    { loading: () => <BoardSkeleton /> }
);

const ContentCalendar = dynamic(
    () => import('@/components/content/content-calendar').then(m => m.ContentCalendar),
    { loading: () => <BoardSkeleton /> }
);

export default function ContentPage() {
    return (
        <div className="flex flex-col h-full space-y-4 p-8 pt-6 font-sans text-foreground">
            <Tabs defaultValue="board" className="flex-1 flex flex-col h-full">
                <TabsList className="w-fit mb-4">
                    <TabsTrigger value="board">Kanban Board</TabsTrigger>
                    <TabsTrigger value="calendar">Calendrier de publication</TabsTrigger>
                </TabsList>
                <TabsContent value="board" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
                    <ContentBoard />
                </TabsContent>
                <TabsContent value="calendar" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
                    <ContentCalendar />
                </TabsContent>
            </Tabs>
        </div>
    );
}
