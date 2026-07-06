'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UsageData {
  tracked: boolean;
  count?: number;
  limit?: number;
  percentage?: number;
  remaining?: number;
}

export function AiUsageGauge() {
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    fetch('/api/ai/usage')
      .then(res => res.json())
      .then(setUsage)
      .catch(console.error);
  }, []);

  if (!usage || !usage.tracked) return null;

  const { percentage = 0, remaining = 0 } = usage;
  const isWarning = percentage >= 80 && percentage < 100;
  const isExhausted = percentage >= 100;

  if (!isWarning && !isExhausted) return null;

  return (
    <Alert variant={isExhausted ? "destructive" : "default"} className={`mb-6 ${isWarning ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' : ''}`}>
      <Zap className="h-4 w-4" />
      <AlertTitle className="font-semibold flex items-center gap-2">
        {isExhausted ? 'Quota IA épuisé' : 'Attention : quota IA bientôt atteint'}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="flex flex-col gap-3">
          <p className="text-sm opacity-90">
            {isExhausted 
              ? 'Vous avez atteint votre limite mensuelle d\'actions IA. Les fonctionnalités IA sont suspendues jusqu\'au mois prochain.'
              : `Vous avez consommé ${percentage}% de votre quota IA mensuel. Il vous reste ${remaining} action(s).`}
          </p>
          <Progress 
            value={percentage} 
            className={`h-2 ${isWarning ? '[&>div]:bg-amber-500' : ''}`}
          />
          {isWarning && (
             <div className="flex justify-end mt-1">
               <Link href="/settings?tab=billing">
                 <Button variant="outline" size="sm" className="border-amber-500/30 hover:bg-amber-500/20 text-amber-500">
                   Gérer mon abonnement
                 </Button>
               </Link>
             </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
