'use client';

import { Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { WidgetGrid } from '@/components/dashboard/widget-grid';
import { PageAgent } from '@/components/agent/PageAgent';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const t = useTranslations('nav');
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id);
        });
    }, []);

    return (
        <div className="flex flex-col h-full space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <h2 className="text-3xl font-bold tracking-tight font-pixel text-primary flex items-center gap-3">
                    <Target className="w-8 h-8" />
                    {t('dashboard')}
                </h2>
            </div>

            <WidgetGrid />
            {userId && <PageAgent userId={userId} pageLabel={t('dashboard')} />}
        </div>
    );
}
