'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useFounderStore } from "@/store/founder-store";
import { useGamificationStore } from "@/store/gamification-store";
import { AgentResultPanel } from "./agent-result-panel";
import type { AgentId } from "@/lib/ai/agent-orchestrator";

import type { FounderStore } from "@/store/founder-store";

interface AgentTriggerButtonProps {
  agentId: AgentId;
  label: string;
  endpoint: string;
  getContext: (store: FounderStore) => any;
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
  icon?: React.ReactNode;
}

export function AgentTriggerButton({ 
  agentId, 
  label, 
  endpoint, 
  getContext, 
  variant = "secondary",
  className,
  icon = <Sparkles className="w-4 h-4 mr-2" />
}: AgentTriggerButtonProps) {
  const store = useFounderStore();
  const { awardXP } = useGamificationStore();
  const { aiSettings } = store;
  
  const isConfigured = !!aiSettings.provider && !!aiSettings.apiKeys[aiSettings.provider];
  
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!isConfigured) {
      setError("IA non configurée. Allez dans Paramètres.");
      setStatus('error');
      return;
    }

    setStatus('running');
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: aiSettings.provider,
          model: aiSettings.model || 'gpt-4o',
          apiKey: aiSettings.apiKeys[aiSettings.provider as keyof typeof aiSettings.apiKeys],
          context: getContext(store),
          locale: 'fr'
        })
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        throw new Error(data.error || 'Erreur inconnue');
      }

      setResult(data.data);
      setStatus('success');
      awardXP('agent_used');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button 
          variant={variant} 
          onClick={handleRun} 
          disabled={status === 'running'}
          className={className}
        >
          {status === 'running' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : icon}
          {status === 'running' ? 'ANALYSE...' : label}
        </Button>
        {status === 'error' && (
          <span className="text-xs text-destructive flex items-center gap-1 font-mono">
            <AlertCircle className="w-3 h-3" /> {error}
          </span>
        )}
      </div>

      {status === 'success' && result && (
        <div className="mt-2">
          <AgentResultPanel 
            agentId={agentId}
            result={result}
            isOpen={true}
            onClose={() => setStatus('idle')}
          />
        </div>
      )}
    </div>
  );
}
