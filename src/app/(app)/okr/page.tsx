'use client';

import { useState } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { OkrCard } from '@/components/okr/okr-card';
import { Plus, Target, TrendingUp, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function OkrPage() {
    const objectives = useFounderStore(s => s.objectives);
    const addObjective = useFounderStore(s => s.addObjective);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newQuarter, setNewQuarter] = useState('Q1 2026');
    const [newEndDate, setNewEndDate] = useState('');

    const handleAddObjective = () => {
        if (!newTitle.trim()) return;
        addObjective({
            title: newTitle,
            status: 'on-track',
            quarter: newQuarter,
            ...(newEndDate ? { endDate: newEndDate } : {}),
        });
        setNewTitle('');
        setNewEndDate('');
        setShowForm(false);
    };

    // Calculate overall stats
    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter(o => o.progress >= 100).length;
    const avgProgress = totalObjectives > 0
        ? Math.round(objectives.reduce((acc, o) => acc + o.progress, 0) / totalObjectives)
        : 0;

    return (
        <div className="h-full flex flex-col p-6 lg:p-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-pixel text-rose-500 flex items-center gap-3">
                        <Target className="w-8 h-8" />
                        OKRs & Goals
                    </h1>
                    <p className="text-muted-foreground mt-1">Align your daily execution with your long-term North Star.</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="w-4 h-4 mr-2" /> New Objective
                </Button>
            </div>

            {/* Inline Add Form */}
            {showForm && (
                <Card className="mb-6 shrink-0 border-primary/30 animate-in slide-in-from-top-4 duration-200">
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-4 items-end">
                        <Input
                            value={newTitle}
                            onChange={(e: any) => setNewTitle(e.target.value)}
                            placeholder="Objective Statement (e.g. Achieve Product-Market Fit)"
                            autoFocus
                        />
                        <select
                            value={newQuarter}
                            onChange={(e: any) => setNewQuarter(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="Q4 2025">Q4 2025</option>
                            <option value="Q1 2026">Q1 2026</option>
                            <option value="Q2 2026">Q2 2026</option>
                            <option value="Q3 2026">Q3 2026</option>
                        </select>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Date d'échéance</label>
                            <Input
                                type="date"
                                value={newEndDate}
                                onChange={(e: any) => setNewEndDate(e.target.value)}
                                className="min-w-[140px] dark:[color-scheme:dark]"
                            />
                        </div>
                        <div className="flex gap-2 h-10">
                            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button onClick={handleAddObjective}>Create</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-card to-muted">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Active Objectives</p>
                            <h3 className="text-2xl font-bold mt-1">{totalObjectives}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <Target className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-card to-muted">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Overall Progress</p>
                            <h3 className="text-2xl font-bold mt-1">{avgProgress}%</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-warning/10 text-warning flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-card to-muted">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Completed</p>
                            <h3 className="text-2xl font-bold mt-1">{completedObjectives}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Objectives List */}
            {objectives.length === 0 ? (
                <div className="text-center py-20 rounded-xl border border-dashed border-border bg-card/50">
                    <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No Objectives Set</h3>
                    <p className="text-muted-foreground mt-2 mb-6">Start by defining what success looks like for this quarter.</p>
                    <Button variant="outline" onClick={() => setShowForm(true)}>Set First Objective</Button>
                </div>
            ) : (
                <div className="grid gap-6 flex-1 overflow-y-auto pr-1">
                    {objectives.map((obj) => (
                        <OkrCard key={obj.id} objective={obj} />
                    ))}
                </div>
            )}
        </div>
    );
}
