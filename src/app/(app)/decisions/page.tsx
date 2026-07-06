"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Swords, CheckCircle2, XCircle, Clock, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

type Decision = {
  id: string;
  title: string;
  context: string | null;
  status: 'pending' | 'approved' | 'challenged' | 'rejected';
  aiFeedback: string | null;
  updatedAt: string;
};

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContext, setNewContext] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/decisions');
      const data = await res.json();
      if (data.decisions) {
        setDecisions(data.decisions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createDecision = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, context: newContext })
      });
      if (res.ok) {
        setNewTitle('');
        setNewContext('');
        setIsDialogOpen(false);
        fetchDecisions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteDecision = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette décision ?')) return;
    try {
      await fetch(`/api/decisions/${id}`, { method: 'DELETE' });
      setDecisions(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (id: string, status: Decision['status']) => {
    try {
      const res = await fetch(`/api/decisions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const data = await res.json();
        setDecisions(prev => prev.map(d => d.id === id ? data.decision : d));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const challengeDecision = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/decisions/${id}/challenge`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDecisions(prev => prev.map(d => d.id === id ? data.decision : d));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" /> En réflexion</Badge>;
      case 'approved': return <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approuvée</Badge>;
      case 'challenged': return <Badge variant="default" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 flex items-center gap-1"><Swords className="w-3 h-3" /> Challengée</Badge>;
      case 'rejected': return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejetée</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journal de Décisions</h1>
          <p className="text-muted-foreground mt-1">Challengez vos choix avec votre AI co-founder avant de les acter.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Nouvelle décision</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une décision au journal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre (Le choix à faire)</label>
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Pivoter sur le modèle B2B..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contexte & Rationnel</label>
                <Textarea value={newContext} onChange={e => setNewContext(e.target.value)} placeholder="Pourquoi cette décision ? Quels sont les enjeux ?" rows={4} />
              </div>
              <Button onClick={createDecision} className="w-full" disabled={!newTitle.trim()}>Enregistrer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {decisions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Swords className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">Aucune décision pour le moment</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Notez vos dilemmes majeurs ici pour les soumettre au regard critique de l'IA.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {decisions.map(decision => (
            <Card key={decision.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5">
                    {getStatusBadge(decision.status)}
                    <CardTitle className="text-xl leading-tight mt-2">{decision.title}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => deleteDecision(decision.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                {decision.context && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{decision.context}</p>
                )}
                
                {decision.aiFeedback && (
                  <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 relative">
                    <div className="absolute -top-3 left-4 bg-background px-2 text-xs font-semibold text-amber-500 flex items-center gap-1">
                      <Swords className="w-3 h-3" /> Sparring Partner
                    </div>
                    <p className="text-sm text-amber-600/90 dark:text-amber-400/90 whitespace-pre-wrap leading-relaxed mt-1">
                      {decision.aiFeedback}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-4 border-t bg-muted/20 gap-2 flex-wrap">
                {decision.status === 'pending' && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full sm:w-auto flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => challengeDecision(decision.id)}
                    disabled={actionLoading === decision.id}
                  >
                    {actionLoading === decision.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Swords className="w-4 h-4 mr-2" />}
                    Challenge this
                  </Button>
                )}
                
                {(decision.status === 'pending' || decision.status === 'challenged') && (
                  <>
                    <Button variant="outline" size="sm" className="flex-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => updateStatus(decision.id, 'approved')}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Valider
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => updateStatus(decision.id, 'rejected')}>
                      <XCircle className="w-4 h-4 mr-2" /> Rejeter
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
