'use client';

import { useState, useEffect } from "react";
import { useFounderStore, RoadmapItem } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Plus, Trash2, Edit2, Map as MapIcon } from 'lucide-react';
import { PageAgent } from '@/components/agent/PageAgent';
import { createClient } from '@/utils/supabase/client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGamification } from '@/hooks/use-gamification';

export default function RoadmapPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const tasks = useFounderStore(s => s.roadmap);
  const addRoadmapItem = useFounderStore(s => s.addRoadmapItem);
  const updateRoadmapItem = useFounderStore(s => s.updateRoadmapItem);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  const pageContext = tasks?.length
    ? `${tasks.length} tâches, ${tasks.filter(t => t.status === 'doing').length} en cours.`
    : 'Aucune tâche dans la roadmap.';
  const deleteRoadmapItem = useFounderStore(s => s.deleteRoadmapItem);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: "todo", priority: "medium", week: "", startDate: "", dueDate: "" });
  const { awardXP } = useGamification();

  const language = useFounderStore(s => s.language);
  const t = translations[language].roadmap;
  const common = translations[language].common;

  const ROADMAP_STATUSES = [
    { key: "todo", label: t.status.todo, className: "text-muted-foreground", bgClassName: "bg-muted/10", borderClassName: "border-muted/20", indicatorClassName: "bg-muted-foreground" },
    { key: "doing", label: t.status.doing, className: "text-warning", bgClassName: "bg-warning/10", borderClassName: "border-warning/20", indicatorClassName: "bg-warning" },
    { key: "done", label: t.status.done, className: "text-success", bgClassName: "bg-success/10", borderClassName: "border-success/20", indicatorClassName: "bg-success" },
  ];

  const add = () => {
    if (!form.title.trim()) return;

    if (editingId) {
      updateRoadmapItem(editingId, form as any);
      setEditingId(null);
    } else {
      addRoadmapItem(form as any);
    }

    setForm({ title: "", description: "", status: "todo", priority: "medium", week: "", startDate: "", dueDate: "" });
    setShowForm(false);
  };

  const edit = (task: any) => {
    setForm({ ...task, startDate: task.startDate || "", dueDate: task.dueDate || "" });
    setEditingId(task.id);
    setShowForm(true);
  };

  const cancel = () => {
    setForm({ title: "", description: "", status: "todo", priority: "medium", week: "", startDate: "", dueDate: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const updateStatus = (id: string, status: any) => {
      updateRoadmapItem(id, { status });
      if (status === 'done') {
          awardXP('roadmap_task_completed');
      }
  };
  const remove = (id: string) => deleteRoadmapItem(id);

  const priorityColors: Record<string, string> = { 
    high: "bg-danger/20 text-danger", 
    medium: "bg-warning/20 text-warning", 
    low: "bg-primary/20 text-primary" 
  };
  const priorityLabels: Record<string, string> = {
    high: t.priority.high,
    medium: t.priority.medium,
    low: t.priority.low
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center shrink-0">
        <h1 className="text-3xl font-bold tracking-tight font-pixel text-primary flex items-center gap-3">
            <MapIcon className="w-8 h-8" />
            {t.title}
        </h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: "", description: "", status: "todo", priority: "medium", week: "", startDate: "", dueDate: "" }); }}>
            <Plus className="mr-2 h-4 w-4" /> {t.new}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="shrink-0 border-t-4 border-t-orange-500 animate-in slide-in-from-top-4 duration-200">
          <CardHeader>
              <CardTitle className="text-lg font-pixel text-primary">
                {t.new}
              </CardTitle>
            </CardHeader>
          <CardContent className="pt-6 grid grid-cols-2 gap-4">
            <Input value={form.title} onChange={(e: any) => setForm({ ...form, title: e.target.value })} placeholder={`${t.form.title} *`} autoFocus />
            <Input value={form.week} onChange={(e: any) => setForm({ ...form, week: e.target.value })} placeholder={t.form.week} />
            <div className="col-span-2">
              <Textarea value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} placeholder={`${t.form.description}...`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Date de début</label>
              <Input type="date" value={form.startDate} onChange={(e: any) => setForm({ ...form, startDate: e.target.value })} className="dark:[color-scheme:dark]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Date limite</label>
              <Input type="date" value={form.dueDate} onChange={(e: any) => setForm({ ...form, dueDate: e.target.value })} className="dark:[color-scheme:dark]" />
            </div>
            <select 
              value={form.priority} 
              onChange={(e: any) => setForm({ ...form, priority: e.target.value })} 
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="high">{t.priority.high}</option>
              <option value="medium">{t.priority.medium}</option>
              <option value="low">{t.priority.low}</option>
            </select>
            <div className="flex gap-2 justify-end items-end h-10">
              <Button variant="outline" onClick={cancel}>{common.cancel}</Button>
              <Button onClick={add}>{editingId ? common.save || 'Save' : common.add}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
        {ROADMAP_STATUSES.map(status => {
          const filtered = tasks.filter(t => t.status === status.key);
          return (
            <div key={status.key} className="flex-1 min-w-[280px] flex flex-col">
              <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg border shrink-0 ${status.bgClassName} ${status.borderClassName}`}>
                <div className={`w-2 h-2 rounded-full ${status.indicatorClassName}`} />
                <span className={`text-sm font-semibold font-mono ${status.className}`}>
                  {status.label}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">{filtered.length}</span>
              </div>
              
              <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1">
                {filtered.map(task => (
                  <Card key={task.id} className="p-3 border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{task.title}</p>
                        {task.description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{task.description}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => edit(task)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-danger" onClick={() => remove(task.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-center mt-3 flex-wrap">
                      <Badge variant="outline" className={`border-transparent ${priorityColors[task.priority]}`}>
                        {priorityLabels[task.priority]}
                      </Badge>
                      {task.week && <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{task.week}</Badge>}
                      
                      <select
                        value={task.status}
                        onChange={(e: any) => updateStatus(task.id, e.target.value)}
                        className="ml-auto bg-transparent border border-border rounded px-1.5 py-0.5 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        {ROADMAP_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {userId && (
        <PageAgent userId={userId} pageLabel="Roadmap" pageContext={pageContext} />
      )}
    </div>
  );
}
