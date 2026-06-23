import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ChevronRight, Target, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AgentId } from '@/lib/ai/agent-orchestrator';
import { cn } from '@/lib/utils';

// Types expected from the agents
import type { CoachAnalysis } from '@/lib/ai/agents/founder-coach';
import type { ContentCreatorResult } from '@/lib/ai/agents/content-creator';
import type { RelationshipAnalysis } from '@/lib/ai/agents/relationship-manager';

interface AgentResultPanelProps {
  agentId: AgentId;
  result: unknown;
  isOpen: boolean;
  onClose: () => void;
}

export function AgentResultPanel({ agentId, result, isOpen, onClose }: AgentResultPanelProps) {
  if (!isOpen || !result) return null;

  const renderCoachAnalysis = (data: CoachAnalysis) => (
    <div className="space-y-4 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="font-pixel text-xs text-accent-foreground">WEEKLY SCORE: {data.weeklyScore}/10</div>
        <Badge variant={data.weeklyScore >= 7 ? "default" : "destructive"} className="font-pixel text-[10px]">
          {data.weeklyScore >= 7 ? "ON TRACK" : "NEEDS ATTENTION"}
        </Badge>
      </div>

      <p className="text-muted-foreground italic leading-relaxed">"{data.summary}"</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-xs font-bold text-success flex items-center gap-1 font-pixel">
            <TrendingUp className="w-3 h-3" /> STRENGTHS
          </div>
          <ul className="space-y-1">
            {data.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-success mt-0.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-bold text-warning flex items-center gap-1 font-pixel">
            <AlertTriangle className="w-3 h-3" /> IMPROVE
          </div>
          <ul className="space-y-1">
            {data.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <Target className="w-3 h-3 text-warning mt-0.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-2 bg-background/50 p-3 rounded-md border border-border/50">
        <div className="text-xs font-bold font-pixel tracking-wider">NEXT ACTIONS</div>
        <div className="space-y-2">
          {data.nextActions.map((action, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-xs bg-card p-2 rounded border border-border/50">
              <span className="truncate flex-1">{action.action}</span>
              <Badge variant="outline" className={cn(
                "text-[10px] font-pixel",
                action.priority === 'high' ? 'border-destructive text-destructive' : 
                action.priority === 'medium' ? 'border-warning text-warning' : 'border-muted-foreground text-muted-foreground'
              )}>
                {action.priority.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/20 p-3 rounded-md relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('/pixel-overlay.png')] opacity-[0.05] pointer-events-none mix-blend-overlay" />
        <div className="text-xs font-pixel text-primary mb-1">STRATEGIC INSIGHT</div>
        <p className="text-xs text-primary/90">{data.strategicInsight}</p>
      </div>
      
      <div className="text-center italic text-xs text-muted-foreground pt-2">
        "{data.motivation}"
      </div>
    </div>
  );

  const renderContentCreator = (data: ContentCreatorResult) => (
    <div className="space-y-4 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="text-xs font-pixel text-accent-foreground border-b border-border/50 pb-2">CONTENT SUGGESTIONS</div>
      <div className="space-y-3">
        {data.suggestions.map((s, i) => (
          <div key={i} className="bg-background/50 p-3 rounded-md border border-border/50 hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="font-bold text-sm text-foreground">{s.title}</div>
              <Badge variant="secondary" className="font-pixel text-[9px]">{s.type}</Badge>
            </div>
            <div className="text-xs text-muted-foreground mb-2"><span className="text-foreground font-semibold">Hook:</span> {s.hook}</div>
            <div className="text-xs bg-muted/50 p-2 rounded text-muted-foreground line-clamp-3 mb-2 font-mono text-[10px] leading-relaxed">
              {s.draft}
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <div className="flex gap-1 flex-wrap">
                {s.hashtags.map(tag => <span key={tag} className="text-primary">{tag}</span>)}
              </div>
              <div className="font-pixel text-success">SCORE: {s.engagementScore}/10</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <div className="text-xs font-pixel">CALENDAR</div>
          <div className="text-xs space-y-1">
            {data.contentCalendar.slice(0, 3).map((c, i) => (
              <div key={i} className="flex justify-between items-center bg-card p-1.5 rounded border border-border/50">
                <span className="font-semibold">{c.day}</span>
                <span className="truncate max-w-[100px] text-muted-foreground" title={c.topic}>{c.topic}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-pixel">TRENDING</div>
          <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
            {data.trendingTopics.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderRelationshipManager = (data: RelationshipAnalysis) => (
    <div className="space-y-4 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="text-xs font-pixel text-accent-foreground border-b border-border/50 pb-2">SUGGESTED ACTIONS</div>
      
      {data.neglectedContacts.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 p-2 rounded flex items-start gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-destructive">Neglected Contacts ({data.neglectedContacts.length})</div>
            <div className="text-destructive/80">You haven't contacted {data.neglectedContacts[0].name} in {data.neglectedContacts[0].daysSinceContact} days.</div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {data.actions.map((action, i) => (
          <div key={i} className="bg-background/50 p-3 rounded-md border border-border/50">
            <div className="flex justify-between items-start mb-2">
              <div className="font-bold text-sm text-foreground flex items-center gap-2">
                {action.contactName}
                <Badge variant="outline" className="text-[9px] font-pixel">{action.action}</Badge>
              </div>
              <Badge variant="secondary" className={cn(
                "font-pixel text-[9px]",
                action.priority === 'high' && "bg-destructive/20 text-destructive border-destructive/50"
              )}>
                {action.deadline}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mb-2 italic">"{action.reason}"</div>
            <div className="text-[11px] bg-muted/50 p-2 rounded font-mono text-muted-foreground border-l-2 border-primary">
              {action.suggestedMessage}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary/10 border border-primary/20 p-3 rounded-md">
        <div className="text-xs font-pixel text-primary mb-1">NETWORK INSIGHT</div>
        <p className="text-xs text-primary/90">{data.networkInsight}</p>
      </div>
    </div>
  );

  return (
    <Card className="mt-2 bg-card/80 backdrop-blur border-accent/20 relative overflow-hidden group shadow-lg">
      <div className="absolute inset-0 bg-[url('/pixel-overlay.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
      <CardContent className="p-4 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xs font-pixel text-muted-foreground">AGENT RESULT</div>
          <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-destructive/20 hover:text-destructive transition-colors" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {agentId === 'founder-coach' && renderCoachAnalysis(result as CoachAnalysis)}
        {agentId === 'content-creator' && renderContentCreator(result as ContentCreatorResult)}
        {agentId === 'relationship-manager' && renderRelationshipManager(result as RelationshipAnalysis)}
        
      </CardContent>
    </Card>
  );
}
