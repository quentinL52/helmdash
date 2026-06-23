'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFounderStore } from '@/store/founder-store';
import { Bot, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface WeeklyBriefWidgetProps {
  isEditMode?: boolean;
}

export function WeeklyBriefWidget({ isEditMode }: WeeklyBriefWidgetProps) {
  const { weeklyReport } = useFounderStore();

  return (
    <Card className="h-full bg-card/80 backdrop-blur border-border overflow-hidden group hover:border-primary/50 transition-colors flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="font-pixel text-[10px] text-muted-foreground uppercase flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          BRIEF IA HEBDOMADAIRE
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto custom-scrollbar">
        {weeklyReport ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
            <ReactMarkdown>{weeklyReport.content}</ReactMarkdown>
            <div className="text-xs text-muted-foreground mt-4 font-pixel">
              Généré le: {new Date(weeklyReport.createdAt).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Bot className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">Aucun brief généré pour cette semaine.</p>
            <p className="text-xs text-muted-foreground mt-1">Utilisez l'Agent Coach pour générer votre premier brief.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
