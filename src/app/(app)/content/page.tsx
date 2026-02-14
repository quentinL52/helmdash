
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateContentDialog } from '@/components/content/create-content-dialog';
import { ContentBoard } from '@/components/content/content-board';
import { ContentCalendar } from '@/components/content/content-calendar';
import { Plus } from 'lucide-react';

export default function ContentPage() {
    return (
        <div className="flex flex-col h-full space-y-4 p-8 pt-6 font-sans text-[#e8e9ed]">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Content Pipeline</h2>
                    <p className="text-[#8b8fa3]">
                        Manage your ideas, drafts, and publishing schedule.
                    </p>
                </div>
                <CreateContentDialog
                    trigger={
                        <div className="inline-flex items-center gap-[6px] border-none rounded-[8px] cursor-pointer font-medium transition-all duration-200 text-[13px] px-[16px] py-[8px] bg-[#6c5ce7] text-white hover:opacity-85">
                            <Plus className="h-4 w-4" /> New Idea
                        </div>
                    }
                />
            </div>

            <Tabs defaultValue="board" className="flex-1 flex flex-col h-full overflow-hidden">
                <TabsList className="bg-[#181a24] border border-[#282c3a] w-fit">
                    <TabsTrigger value="board" className="data-[state=active]:bg-[#282c3a] data-[state=active]:text-[#e8e9ed] text-[#8b8fa3]">
                        Board
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="data-[state=active]:bg-[#282c3a] data-[state=active]:text-[#e8e9ed] text-[#8b8fa3]">
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
