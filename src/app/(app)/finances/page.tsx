'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { ChartSkeleton, TableSkeleton, CardSkeleton } from '@/components/ui/loading-skeleton';
import type { Timeframe } from '@/components/finances/runway-chart';
import { FinanceKPIs } from '@/components/finances/finance-kpis';
import { FinanceCharts } from '@/components/finances/finance-charts';
import { RecurringExpensesList } from '@/components/finances/recurring-expenses-list';

// Lazy load heavy components (recharts, complex tables)
const RunwayChart = dynamic(
    () => import('@/components/finances/runway-chart').then(m => m.RunwayChart),
    { loading: () => <ChartSkeleton /> }
);
const FinanceEntryForm = dynamic(
    () => import('@/components/finances/finance-entry-form').then(m => m.FinanceEntryForm),
    { loading: () => <CardSkeleton /> }
);
const FinanceTable = dynamic(
    () => import('@/components/finances/finance-table').then(m => m.FinanceTable),
    { loading: () => <TableSkeleton /> }
);

export default function FinancesPage() {
    const [timeframe, setTimeframe] = useState<Timeframe>('month');
    const language = useFounderStore(s => s.language);
    const t = translations[language].finance;

    return (
        <div className="flex flex-col h-full space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t.title}</h2>
                    <p className="text-muted-foreground">
                        {t.subtitle}
                    </p>
                </div>
            </div>

            <FinanceKPIs />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <RunwayChart timeframe={timeframe} setTimeframe={setTimeframe} />
            </div>

            <FinanceCharts />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-7 lg:col-span-3">
                    <FinanceEntryForm />
                </div>
                <div className="col-span-7 lg:col-span-4 space-y-4">
                    <RecurringExpensesList />
                    <FinanceTable timeframe={timeframe} />
                </div>
            </div>
        </div>
    );
}
