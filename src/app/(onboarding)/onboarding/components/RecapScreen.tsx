"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function RecapScreen({ session, onComplete }: { session: any, onComplete: () => void }) {
  const t = useTranslations('onboarding');
  const [loading, setLoading] = useState(false);
  const [synthesis, setSynthesis] = useState(session.draftOutput || {
    canvas: { problem: '', solution: '', customerSegments: '', revenueStreams: '' },
    hypotheses: [{ title: '', successCriteria: '' }, { title: '', successCriteria: '' }],
    milestone: { title: '', targetDate: '' },
    founderProfile: ''
  });
  
  const [optInWeekly, setOptInWeekly] = useState(false);
  const [optInJournal, setOptInJournal] = useState(true);

  // Trigger synthesis if missing
  const [synthesizing, setSynthesizing] = useState(!session.draftOutput);

  useEffect(() => {
    if (!session.draftOutput) {
      setSynthesizing(true);
      fetch('/api/onboarding/synthesize', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.synthesis) {
            setSynthesis(data.synthesis);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setSynthesizing(false));
    }
  }, [session.draftOutput]);

  const confirm = async () => {
    setLoading(true);
    try {
      await fetch('/api/onboarding/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ synthesis, optInWeekly, optInJournal })
      });
      onComplete(); // This will navigate
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const updateCanvas = (field: string, value: string) => {
    setSynthesis((prev: any) => ({ ...prev, canvas: { ...prev.canvas, [field]: value } }));
  };

  const updateHypothesis = (index: number, field: string, value: string) => {
    setSynthesis((prev: any) => {
      const newHyp = [...prev.hypotheses];
      if (!newHyp[index]) newHyp[index] = {};
      newHyp[index][field] = value;
      return { ...prev, hypotheses: newHyp };
    });
  };

  if (synthesizing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold">{t('recapTitle')}</h2>
        <p className="text-muted-foreground mt-2">Génération de la synthèse en cours...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto overflow-y-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('recapTitle')}</h1>
        <p className="text-muted-foreground">{t('recapSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Canvas */}
        <Card>
          <CardHeader>
            <CardTitle>Lean Canvas (Brouillon)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Problème</Label>
              <Textarea value={synthesis.canvas?.problem || ''} onChange={(e) => updateCanvas('problem', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Solution</Label>
              <Textarea value={synthesis.canvas?.solution || ''} onChange={(e) => updateCanvas('solution', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cible</Label>
              <Textarea value={synthesis.canvas?.customerSegments || ''} onChange={(e) => updateCanvas('customerSegments', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Revenus</Label>
              <Textarea value={synthesis.canvas?.revenueStreams || ''} onChange={(e) => updateCanvas('revenueStreams', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Milestone */}
          <Card>
            <CardHeader>
              <CardTitle>Milestone à 90 jours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Objectif</Label>
                <Input 
                  value={synthesis.milestone?.title || ''} 
                  onChange={(e) => setSynthesis((p:any) => ({ ...p, milestone: { ...p.milestone, title: e.target.value } }))} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Hypotheses */}
          <Card>
            <CardHeader>
              <CardTitle>Hypothèses Clés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {synthesis.hypotheses?.map((hyp: any, i: number) => (
                <div key={i} className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
                  <Label>Hypothèse {i + 1}</Label>
                  <Input value={hyp.title || ''} onChange={(e) => updateHypothesis(i, 'title', e.target.value)} />
                  <Input placeholder="Critère de succès" value={hyp.successCriteria || ''} onChange={(e) => updateHypothesis(i, 'successCriteria', e.target.value)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profil Founder */}
      <Card>
        <CardHeader>
          <CardTitle>Ton Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            value={synthesis.founderProfile || ''} 
            onChange={(e) => setSynthesis((p:any) => ({ ...p, founderProfile: e.target.value }))}
            className="min-h-[100px]" 
          />
        </CardContent>
      </Card>

      {/* Opt-ins */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{t('consentWeekly')}</Label>
              <p className="text-sm text-muted-foreground">Un récapitulatif par email chaque lundi.</p>
            </div>
            <Switch checked={optInWeekly} onCheckedChange={setOptInWeekly} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{t('consentJournal')}</Label>
              <p className="text-sm text-muted-foreground">Suivi de l'humeur et du stress.</p>
            </div>
            <Switch checked={optInJournal} onCheckedChange={setOptInJournal} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pb-12">
        <Button size="lg" onClick={confirm} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {t('finish')}
        </Button>
      </div>
    </div>
  );
}
