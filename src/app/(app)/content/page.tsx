'use client';

import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BoardSkeleton, CardSkeleton } from '@/components/ui/loading-skeleton';

// Lazy load heavy board and calendar components
const ContentBoard = dynamic(
    () => import('@/components/content/content-board').then(m => m.ContentBoard),
    { loading: () => <BoardSkeleton /> }
);
const ContentCalendar = dynamic(
    () => import('@/components/content/content-calendar').then(m => m.ContentCalendar),
    { loading: () => <CardSkeleton /> }
);

export default function ContentPage() {
    return (
        <div className="flex flex-col h-full space-y-4 p-8 pt-6 font-sans text-foreground">
            <Tabs defaultValue="board" className="flex-1 flex flex-col h-full overflow-hidden">
                <TabsList className="bg-card border border-border w-fit">
                    <TabsTrigger value="board" className="text-muted-foreground">
                        Board
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="text-muted-foreground">
                        Calendar
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="board" className="flex-1 mt-4 overflow-hidden">
                    <ContentBoard />
                </TabsContent>

                <TabsContent value="calendar" className="flex-1 mt-4 overflow-hidden">
                    <ContentCalendar />
                </TabsContent>
            </Tabs>
        </div>
    );
}
