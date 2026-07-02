'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { BoardSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Megaphone, Plus, PenTool } from 'lucide-react';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { AgentTriggerButton } from '@/components/dashboard/agent-trigger-button';
import { PageAgent } from '@/components/agent/PageAgent';
import { createClient } from '@/utils/supabase/client';

const ContentBoard = dynamic(
    () => import('@/components/content/content-board').then(m => m.ContentBoard),
    { loading: () => <BoardSkeleton /> }
);

export default function ContentPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const language = useFounderStore(s => s.language);
    const t = translations[language].content;

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user) setUserId(data.user.id);
        });
    }, []);

    return (
        <div className="flex flex-col h-full space-y-4 p-8 pt-6 font-sans text-foreground">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-pixel text-pink-500 flex items-center gap-3">
                        <Megaphone className="w-8 h-8" />
                        {t.title}
                    </h1>
                    <p className="text-muted-foreground mt-2">{t.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                    <AgentTriggerButton 
                        agentId="content-creator"
                        label="GÉNÉRER IDÉES"
                        endpoint="/api/ai/agents/content"
                        icon={<PenTool className="w-4 h-4 mr-2" />}
                        getContext={(store) => ({
                            leanCanvas: store.leanCanvas,
                            goToMarket: store.goToMarket,
                            existingContent: [] // Could be mapped from store.columns
                        })}
                        variant="secondary"
                        className="font-pixel text-[10px] bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 border border-pink-500/20 shadow-[2px_2px_0px_0px_rgba(236,72,153,0.3)]"
                    />
                    <Button className="flex items-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                        <Plus className="w-4 h-4" />
                        {t.newContent}
                    </Button>
                </div>
            </div>
            <div className="flex-1 min-h-0 mt-0">
                <ContentBoard />
            </div>

            {userId && (
                <PageAgent userId={userId} pageLabel="Content" pageContext="Génération et suivi de contenu." />
            )}
        </div>
    );
}
