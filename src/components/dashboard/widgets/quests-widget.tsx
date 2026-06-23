'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGamificationStore } from '@/store/gamification-store';
import { Progress } from '@/components/ui/progress';

import { Target, CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function QuestsWidget() {
    const { quests } = useGamificationStore();
    const activeQuests = quests.filter(q => q.status === 'active');

    return (
        <Card className="h-full flex flex-col border-primary/20 bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-pixel flex items-center gap-2 text-primary">
                    <Target className="w-4 h-4" />
                    Quêtes Actives
                    <Badge variant="secondary" className="ml-auto text-xs">{activeQuests.length}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <div className="h-full px-6 pb-6 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    {activeQuests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm text-center">
                            <span className="text-3xl mb-2">🎉</span>
                            Toutes les quêtes sont terminées !
                        </div>
                    ) : (
                        <div className="flex gap-4 min-w-max h-full">
                            {activeQuests.map(quest => {
                                const completedSteps = quest.steps.filter(s => s.completed).length;
                                const totalSteps = quest.steps.length;
                                const progress = (completedSteps / totalSteps) * 100;
                                
                                return (
                                    <div key={quest.id} className="w-[320px] flex-shrink-0 flex flex-col space-y-2 border border-border p-3 rounded-lg bg-card">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 font-medium text-sm">
                                                <span className="text-lg">{quest.emoji}</span>
                                                <span className="truncate">{quest.titleFr}</span>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/20 bg-primary/5">
                                                +{quest.completionBonus} XP
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{quest.descriptionFr}</p>
                                        
                                        <div className="space-y-1 pt-1">
                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                <span>Progression</span>
                                                <span>{completedSteps} / {totalSteps}</span>
                                            </div>
                                            <Progress value={progress} className="h-1.5" />
                                        </div>
                                        
                                        <div className="pt-2 space-y-1.5">
                                            {quest.steps.map(step => (
                                                <div key={step.id} className="flex items-start gap-2 text-xs">
                                                    {step.completed ? (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                                                    ) : (
                                                        <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                                    )}
                                                    <span className={`flex-1 ${step.completed ? 'text-muted-foreground line-through' : ''}`}>
                                                        {step.labelFr}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">+{step.xpReward} XP</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
