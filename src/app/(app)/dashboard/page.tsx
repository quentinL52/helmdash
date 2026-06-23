'use client';

import { Target } from 'lucide-react';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { WidgetGrid } from '@/components/dashboard/widget-grid';

export default function DashboardPage() {
    const language = useFounderStore(s => s.language);

    return (
        <div className="flex flex-col h-full space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <h2 className="text-3xl font-bold tracking-tight font-pixel text-primary flex items-center gap-3">
                    <Target className="w-8 h-8" />
                    {translations[language].nav.dashboard}
                </h2>
            </div>

            <WidgetGrid />
        </div>
    );
}
