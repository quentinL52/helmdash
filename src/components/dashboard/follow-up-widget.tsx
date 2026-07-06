'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, PhoneCall } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function FollowUpWidget() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/command-center/contacts-followup')
      .then(res => res.json())
      .then(data => {
        setContacts(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <Card className="animate-pulse h-64 bg-card/50"></Card>;

  return (
    <Card className="bg-card border-border flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Engine: Follow-ups
          </div>
          <Badge variant="outline">{contacts.length} à relancer</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {contacts.length === 0 ? (
          <div className="text-sm text-muted-foreground flex items-center justify-center h-24">
            Aucun contact à relancer aujourd'hui.
          </div>
        ) : (
          <ul className="space-y-3">
            {contacts.map((contact) => (
              <li key={contact.id} className="flex flex-col gap-1 p-3 rounded-md bg-background/50 border border-border/50">
                <div className="flex justify-between items-start">
                  <div className="font-semibold text-sm">{contact.name}</div>
                  <Badge variant="secondary" className="text-[10px]">{contact.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Action : {contact.nextActionLabel || contact.nextAction || 'Relance générale'}
                </div>
                <div className="flex justify-end mt-2">
                   <Link href={`/crm/${contact.id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        <PhoneCall className="w-3 h-3 mr-1" /> Traiter
                      </Button>
                   </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
