'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function BlockedWaitingWidget() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/command-center/blocked-items')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <Card className="animate-pulse h-48 bg-card/50"></Card>;

  return (
    <Card className="bg-card border-border flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Blocked & Waiting
          </div>
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto max-h-64">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground flex items-center justify-center h-16">
            Aucun élément bloquant.
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-1 p-3 rounded-md bg-amber-500/5 border border-amber-500/20">
                <div className="font-semibold text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Waiting on: {item.waitingOn}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
