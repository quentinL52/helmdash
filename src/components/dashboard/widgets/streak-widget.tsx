'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGamificationStore } from '@/store/gamification-store';
import { Flame, Snowflake } from 'lucide-react';

interface StreakWidgetProps {
  isEditMode?: boolean;
}

export function StreakWidget({ isEditMode }: StreakWidgetProps) {
  const { streak } = useGamificationStore();
  
  const isAtRisk = streak.lastActivityDate !== new Date().toISOString().split('T')[0];
  const hasStreak = streak.currentStreak > 0;

  return (
    <Card className="h-full bg-card/80 backdrop-blur border-border overflow-hidden group hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="font-pixel text-[10px] text-muted-foreground uppercase flex items-center justify-between">
          <span>STREAK DISCIPLINE</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: streak.freezesRemaining }).map((_, i) => (
              <Snowflake key={i} className="w-3 h-3 text-info" />
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`relative flex items-center justify-center w-16 h-16 rounded-full border-2 ${hasStreak ? (isAtRisk ? 'border-primary/50 bg-primary/10' : 'border-danger/50 bg-danger/10') : 'border-muted bg-muted/20'}`}>
              <Flame className={`w-8 h-8 ${hasStreak ? (isAtRisk ? 'text-primary animate-pulse' : 'text-danger') : 'text-muted-foreground grayscale opacity-50'}`} />
            </div>
            <div>
              <div className="text-4xl font-pixel flex items-end gap-1">
                {streak.currentStreak} <span className="text-sm text-muted-foreground mb-1">Jours</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {isAtRisk ? 'En danger aujourd\'hui' : 'Actif'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-pixel text-muted-foreground">Record</div>
            <div className="text-lg font-pixel">{streak.bestStreak}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
