'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, TrendingUp, Target, Plus, Search } from 'lucide-react';
import { AgentTriggerButton } from '../agent-trigger-button';

interface QuickActionsWidgetProps {
  isEditMode?: boolean;
}

export function QuickActionsWidget({ isEditMode }: QuickActionsWidgetProps) {
  return (
    <Card className="h-full bg-card/80 backdrop-blur border-border overflow-hidden group hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="font-pixel text-[10px] text-muted-foreground uppercase flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          ACTIONS RAPIDES
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <AgentTriggerButton 
            agentId="founder-coach"
            label="Brief IA"
            icon={<Bot className="w-4 h-4 mr-2" />}
            variant="outline"
            className="w-full justify-start font-pixel text-[10px] h-9"
            endpoint="/api/ai/agents/coach"
            getContext={(s) => ({ hypotheses: s.hypotheses })}
          />
          <AgentTriggerButton 
            agentId="founder-coach"
            label="GÉNÉRER UN RAPPEL"
            icon={<Search className="w-4 h-4 mr-2" />}
            variant="outline"
            className="w-full justify-start font-pixel text-[10px] h-9"
            endpoint="/api/ai/agents/coach"
            getContext={(s) => ({})}
          />
          <Button variant="outline" className="w-full justify-start font-pixel text-[10px] h-9" onClick={() => window.location.href = '/hypotheses'}>
            <Target className="w-4 h-4 mr-2 text-blue-500" /> Hypothèse
          </Button>
          <Button variant="outline" className="w-full justify-start font-pixel text-[10px] h-9" onClick={() => window.location.href = '/finances'}>
            <TrendingUp className="w-4 h-4 mr-2 text-green-500" /> Finance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
