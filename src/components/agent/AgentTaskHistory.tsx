'use client';

import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, Play, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentTask {
  id: string;
  taskId: string;
  agentRole: string;
  taskObjective: string;
  status: string;
  result?: Record<string, unknown> | null;
  errorMessage?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: 'En attente', icon: Clock, color: 'text-muted-foreground' },
  running: { label: 'En cours', icon: Play, color: 'text-blue-500' },
  success: { label: 'Succès', icon: CheckCircle, color: 'text-green-500' },
  partial: { label: 'Partiel', icon: AlertTriangle, color: 'text-yellow-500' },
  failed: { label: 'Échec', icon: XCircle, color: 'text-red-500' },
  needs_approval: { label: 'Approbation', icon: AlertTriangle, color: 'text-orange-500' },
};

const ROLE_LABELS: Record<string, string> = {
  pm: 'PM Agent',
  cfo: 'CFO Agent',
  growth: 'Growth Agent',
  legal: 'Legal Agent',
  tech_lead: 'Tech Lead',
  research: 'Research Agent',
  content: 'Content Agent',
  recruiting: 'Recruiting Agent',
};

export function AgentTaskHistory({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/ai/agents/tasks?limit=20');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to fetch agent tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <p>Aucune tâche déléguée pour le moment.</p>
        <p className="mt-1 text-xs">Demandez à l'agent central de déléguer une tâche (ex: « Analyse mon marché » ou « Planifie le sprint »).</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Tâches déléguées</h3>
      </div>
      <ScrollArea className="h-[300px]">
        <div className="divide-y">
          {tasks.map((task) => {
            const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            return (
              <div key={task.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {ROLE_LABELS[task.agentRole] || task.agentRole}
                      </Badge>
                      <span className={cn("flex items-center gap-1 text-xs font-medium", cfg.color)}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{task.taskObjective}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(task.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                      {task.completedAt && ` — Terminé ${new Date(task.completedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}`}
                    </p>
                  </div>
                  {task.errorMessage && (
                    <span className="text-[10px] text-red-500 max-w-[200px] truncate shrink-0" title={task.errorMessage}>
                      ⚠ Erreur
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}