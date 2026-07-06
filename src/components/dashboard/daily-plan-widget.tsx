'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Target, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DailyPlanWidget() {
  const [top3, setTop3] = useState<string[]>(['', '', '']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/command-center/daily-plan')
      .then(res => res.json())
      .then(data => {
        if (data.top3 && Array.isArray(data.top3)) {
          // ensure it has 3 elements
          const loaded = [...data.top3];
          while (loaded.length < 3) loaded.push('');
          setTop3(loaded.slice(0, 3));
        }
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/command-center/daily-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ top3 })
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (index: number, val: string) => {
    const newTop3 = [...top3];
    newTop3[index] = val;
    setTop3(newTop3);
  };

  if (loading) return <Card className="animate-pulse h-48 bg-card/50"></Card>;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Top 3 du jour
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {top3.map((task, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
              {idx + 1}
            </div>
            <Input 
              value={task} 
              onChange={(e) => handleChange(idx, e.target.value)} 
              placeholder={`Objectif prioritaire ${idx + 1}...`}
              className="bg-background/50 border-border/50"
            />
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
