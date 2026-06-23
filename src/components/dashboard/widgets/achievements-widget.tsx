'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGamificationStore } from '@/store/gamification-store';
import { Trophy, Lock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ACHIEVEMENT_REGISTRY } from '@/lib/gamification/achievement-registry';

export function AchievementsWidget() {
    const { unlockedAchievements } = useGamificationStore();
    
    // Sort achievements: unlocked first, then by XP reward descending
    const allAchievements = Object.values(ACHIEVEMENT_REGISTRY).sort((a, b) => {
        const aUnlocked = unlockedAchievements.some(ua => ua.id === a.id);
        const bUnlocked = unlockedAchievements.some(ua => ua.id === b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return b.xpReward - a.xpReward;
    });

    return (
        <Card className="h-full flex flex-col border-primary/20 bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-pixel flex items-center gap-2 text-primary">
                    <Trophy className="w-4 h-4" />
                    Succès
                    <span className="ml-auto text-xs font-sans text-muted-foreground">
                        {unlockedAchievements.length} / {allAchievements.length}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full px-6 pb-6">
                    <div className="grid grid-cols-2 gap-3">
                        {allAchievements.map(achievement => {
                            const isUnlocked = unlockedAchievements.some(ua => ua.id === achievement.id);
                            
                            return (
                                <div 
                                    key={achievement.id}
                                    className={`relative p-3 rounded-lg border ${
                                        isUnlocked 
                                            ? 'bg-primary/5 border-primary/20' 
                                            : 'bg-muted/30 border-border opacity-60 grayscale'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">{achievement.emoji}</div>
                                    <div className="font-semibold text-xs leading-tight mb-1 truncate">
                                        {achievement.nameFr}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground line-clamp-2">
                                        {achievement.descriptionFr}
                                    </div>
                                    
                                    {!isUnlocked && (
                                        <div className="absolute top-2 right-2">
                                            <Lock className="w-3 h-3 text-muted-foreground opacity-50" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
