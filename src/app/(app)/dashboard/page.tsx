'use client';

import { WeeklyCoachWidget } from '@/components/dashboard/weekly-coach-widget';
import { RunwayWidget } from '@/components/dashboard/runway-widget';
import { HypothesesWidget } from '@/components/dashboard/hypotheses-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Target } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="flex flex-col h-full space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <WeeklyCoachWidget />

                <RunwayWidget />

                <div className="col-span-1">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">OKR Score</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0.0</div>
                            <p className="text-xs text-muted-foreground">Typical target: 0.7</p>
                            <div className="mt-4 text-xs text-muted-foreground italic">
                                Set your Objectives in Module 9 (Phase 2)
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-1">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Weekly Routine</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0%</div>
                            <p className="text-xs text-muted-foreground">Completion this week</p>
                            <div className="mt-4 text-xs text-muted-foreground italic">
                                Track your habits in Module 5 (Phase 3)
                            </div>
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
