'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DailyPlanWidget } from './daily-plan-widget';
import { FollowUpWidget } from './follow-up-widget';
import { BlockedWaitingWidget } from './blocked-waiting-widget';

export function CommandCenter() {
  const t = useTranslations('dashboard');
  const [sweep, setSweep] = useState<any>(null);
  const [inboxText, setInboxText] = useState('');

  useEffect(() => {
    fetch('/api/command-center/sweep')
      .then(res => res.json())
      .then(setSweep)
      .catch(console.error);
  }, []);

  const handleQuickCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inboxText.trim()) return;

    try {
      await fetch('/api/command-center/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inboxText })
      });
      setInboxText('');
      // Trigger sweep refresh or just clear
    } catch (error) {
      console.error(error);
    }
  };

  const handleRunSweep = async () => {
    try {
      const res = await fetch('/api/command-center/sweep?action=run', { method: 'POST' });
      const data = await res.json();
      setSweep(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sweep Alert */}
      {sweep && !sweep.allClear && sweep.issues?.length > 0 && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Attention requise (Sweep Quotidien)</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 mt-2 space-y-1">
              {sweep.issues.map((issue: any, i: number) => (
                <li key={i}>{issue.message}</li>
              ))}
            </ul>
            <Button variant="outline" size="sm" className="mt-4 border-destructive/30 hover:bg-destructive/20 text-destructive" onClick={handleRunSweep}>
              Relancer le Sweep
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {sweep && sweep.allClear && (
        <Alert className="bg-green-500/10 border-green-500/20 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Tout est à jour</AlertTitle>
          <AlertDescription>
            Le sweep de ce matin ne détecte aucune alerte majeure. Vous êtes prêt pour la journée !
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Capture */}
      <form onSubmit={handleQuickCapture} className="flex gap-2">
        <Input 
          value={inboxText}
          onChange={(e) => setInboxText(e.target.value)}
          placeholder="Capture rapide (idée, note, tâche)..." 
          className="bg-card border-border"
        />
        <Button type="submit" variant="default" disabled={!inboxText.trim()}>
          <Plus className="w-4 h-4 mr-2" />
          Capturer
        </Button>
      </form>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <DailyPlanWidget />
          <BlockedWaitingWidget />
        </div>
        <div className="flex flex-col gap-6">
          <FollowUpWidget />
        </div>
      </div>
    </div>
  );
}
