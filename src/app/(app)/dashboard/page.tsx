'use client';

import { WeeklyCoachWidget } from '@/components/dashboard/weekly-coach-widget';
import { RunwayWidget } from '@/components/dashboard/runway-widget';
import { HypothesesWidget } from '@/components/dashboard/hypotheses-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Target } from 'lucide-react';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';

export default function DashboardPage() {
    const { language } = useFounderStore();
    const t = translations[language].dashboard;

    return (
        <div className="flex flex-col h-full space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">{translations[language].nav.dashboard}</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <WeeklyCoachWidget />

                <RunwayWidget />

                <div className="col-span-1">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t.okrProgress}</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0.0</div>
                            <p className="text-xs text-muted-foreground">Target: 0.7</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-1">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t.routineConsistency}</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0%</div>
                            <p className="text-xs text-muted-foreground">This week</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-1">
                    <HypothesesWidget />
                </div>
            </div>
        </div>
    );
}
