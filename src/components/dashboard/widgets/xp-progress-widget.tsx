'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGamificationStore } from '@/store/gamification-store';
import { getLevelForXP, getXPForNextLevel } from '@/lib/gamification/level-system';
import { Progress } from '@/components/ui/progress';

interface XPProgressWidgetProps {
  isEditMode?: boolean;
}

export function XPProgressWidget({ isEditMode }: XPProgressWidgetProps) {
  const { totalXP } = useGamificationStore();
  
  const currentLevel = getLevelForXP(totalXP);
  const nextLevelProgress = getXPForNextLevel(totalXP);
  
  const progressPercentage = Math.min(100, Math.max(0, (nextLevelProgress.current / nextLevelProgress.required) * 100));

  return (
    <Card className="h-full bg-card/80 backdrop-blur border-border overflow-hidden group hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="font-pixel text-[10px] text-muted-foreground uppercase flex items-center justify-between">
          <span>PROGRESSION XP</span>
          <span className="text-primary text-xs">{currentLevel.emoji}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-3xl font-pixel text-primary mb-1">Niv. {currentLevel.level}</div>
              <div className="text-xs text-muted-foreground font-medium">{currentLevel.titleFr}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-pixel">{totalXP} XP</div>
              <div className="text-[10px] text-muted-foreground">/ {totalXP + nextLevelProgress.required - nextLevelProgress.current} XP</div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Progress value={progressPercentage} className="h-3 rounded-none bg-muted border border-border" />
            <div className="text-[10px] text-right text-muted-foreground font-pixel">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
