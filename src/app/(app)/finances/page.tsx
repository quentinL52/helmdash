'use client';

import { useState } from 'react';
import { RunwayChart, Timeframe } from '@/components/finances/runway-chart';
import { FinanceEntryForm } from '@/components/finances/finance-entry-form';
import { FinanceTable } from '@/components/finances/finance-table';

export default function FinancesPage() {
    const [timeframe, setTimeframe] = useState<Timeframe>('month');

    return (
        <div className="flex flex-col h-full space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Finances & Runway</h2>
                    <p className="text-muted-foreground">
                        Track your cash flow and extend your survival.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <RunwayChart timeframe={timeframe} setTimeframe={setTimeframe} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-7">
                    <FinanceEntryForm />
                </div>
                <div className="col-span-7">
                    <FinanceTable timeframe={timeframe} />
                </div>
            </div>
        </div>
    );
}
