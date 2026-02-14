'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFounderStore } from '@/store/founder-store';
import { ArrowDown, ArrowUp, DollarSign, Wallet } from 'lucide-react';

export function RunwayWidget() {
    const { finance } = useFounderStore();

    const metrics = useMemo(() => {
        // Simple calculation similar to chart
        const sortedEntries = [...finance.monthlyEntries].sort((a, b) =>
            b.month.localeCompare(a.month)
        );

        let monthlyBurn = 0;
        let trend = 'stable';

        if (sortedEntries.length > 0) {
            const lastMonth = sortedEntries[0];
            const revenue = lastMonth.revenue;
            const expenses = (lastMonth.expenses || []).reduce((sum, e) => sum + e.amount, 0);
            monthlyBurn = expenses - revenue;
        }

        let runway = '∞';
        if (monthlyBurn > 0) {
            runway = (finance.cashAvailable / monthlyBurn).toFixed(1);
        }

        return {
            runway,
            burn: monthlyBurn,
            cash: finance.cashAvailable
        };
    }, [finance]);

    const runwayNum = parseFloat(metrics.runway);
    const isCritical = !isNaN(runwayNum) && runwayNum < 3;
    const isWarning = !isNaN(runwayNum) && runwayNum < 6 && runwayNum >= 3;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Runway
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${isCritical ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-green-500'}`}>
                    {metrics.runway === '∞' ? '∞' : `${metrics.runway} months`}
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                    {metrics.burn > 0 ? (
                        <span className="flex items-center text-red-500">
                            <ArrowDown className="h-3 w-3 mr-1" />
                            {metrics.burn.toLocaleString()}€ / month burn
                        </span>
                    ) : (
                        <span className="flex items-center text-green-500">
                            <ArrowUp className="h-3 w-3 mr-1" />
                            Profitable
                        </span>
                    )}
                </p>
                <div className="mt-3 h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className={`h-full ${isCritical ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min((runwayNum || 12) / 12 * 100, 100)}%` }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
