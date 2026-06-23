'use client';

import { useGamificationStore } from '@/store/gamification-store';
import { getLevelForXP, getXPForNextLevel } from '@/lib/gamification/level-system';
import { Flame, Trophy, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function SidebarGamificationWidget() {
    const { totalXP, streak } = useGamificationStore();
    const currentLevel = getLevelForXP(totalXP);
    const { current, required, progress } = getXPForNextLevel(totalXP);

    return (
        <div className="p-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-2xl shadow-inner border border-primary/20">
                    {currentLevel.emoji}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold font-pixel text-primary truncate max-w-[100px]">
                            NIV {currentLevel.level}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-orange-500">
                            <Flame className="w-3 h-3" />
                            {streak.currentStreak}
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                        {currentLevel.titleFr}
                    </div>
                </div>
            </div>
            
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase">
                    <span>XP</span>
                    <span>{current} / {required}</span>
                </div>
                <Progress value={progress * 100} className="h-1.5 bg-muted/50" />
            </div>
        </div>
    );
}
