'use client';

import { useState } from "react";
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Trash2, Edit2, Check, X, Repeat, Sparkles } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AgentTriggerButton } from '@/components/dashboard/agent-trigger-button';
import { useGamification } from '@/hooks/use-gamification';

export default function RoutinePage() {
  const routine = useFounderStore(s => s.routine);
  const toggleRoutineTask = useFounderStore(s => s.toggleRoutineTask);
  const addRoutineTask = useFounderStore(s => s.addRoutineTask);
  const updateRoutineTask = useFounderStore(s => s.updateRoutineTask);
  const deleteRoutineTask = useFounderStore(s => s.deleteRoutineTask);
  const language = useFounderStore(s => s.language);

  const t = translations[language].routine;
  const common = translations[language].common;

  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTask, setNewTask] = useState("");

  const [editingTask, setEditingTask] = useState<{ dayId: string; taskId: string } | null>(null);
  const [editedTaskText, setEditedTaskText] = useState("");

  const { awardXP, recordActivity } = useGamification();

  const handleToggle = (dayId: string, taskId: string) => {
    toggleRoutineTask(dayId, taskId);
    recordActivity();
    
    // Evaluate if day is 100% complete
    const updatedRoutine = useFounderStore.getState().routine || [];
    const day = updatedRoutine.find(d => d.id === dayId);
    if (day && day.tasks.length > 0 && day.tasks.every(t => t.done)) {
        awardXP('routine_complete');
    }
  };

  const handleAddTask = (dayId: string) => {
    if (!newTask.trim()) return;
    addRoutineTask(dayId, newTask);
    setNewTask("");
    setAddingTo(null);
  };

  const handleRemoveTask = (dayId: string, taskId: string) => {
    deleteRoutineTask(dayId, taskId);
  };

  const startEditing = (dayId: string, taskId: string, currentText: string) => {
    setEditingTask({ dayId, taskId });
    setEditedTaskText(currentText);
  };

  const saveEditedTask = () => {
    if (!editingTask) return;
    if (!editedTaskText.trim()) return;

    const { dayId, taskId } = editingTask;
    updateRoutineTask(dayId, taskId, editedTaskText);

    setEditingTask(null);
    setEditedTaskText("");
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditedTaskText("");
  };

  const safeRoutine = routine || [];

  const totalTasks = safeRoutine.reduce((a, d) => a + d.tasks.length, 0);
  const doneTasks = safeRoutine.reduce((a, d) => a + d.tasks.filter((t: any) => t.done).length, 0);
  const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      {/* Header & Stats */}
      <div className="p-6 lg:p-8 pb-4 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-pixel text-emerald-500 flex items-center gap-3">
              <Repeat className="w-8 h-8" />
              {t.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {doneTasks}/{totalTasks} {t.completedText}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <AgentTriggerButton 
                agentId="founder-coach"
                label="ANALYSER ROUTINE"
                endpoint="/api/ai/agents/coach"
                icon={<Sparkles className="w-4 h-4 mr-2" />}
                getContext={(store) => ({
                    routine: store.routine,
                    journalEntries: store.journalEntries.slice(0, 5)
                })}
                variant="secondary"
                className="font-pixel text-[10px] bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-[100px] h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: progress === 100 ? 'hsl(var(--success))' : 'hsl(var(--primary))'
                }} 
              />
            </div>
            <span className={`text-xs font-mono font-medium ${progress === 100 ? 'text-success' : 'text-muted-foreground'}`}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Columns */}
      <div className="px-6 lg:px-8 pb-8 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {safeRoutine.map((day) => {
            return (
              <Card key={day.id} className="flex flex-col border-t-4 border-t-emerald-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg capitalize font-pixel text-emerald-500">
                    {(common.days as any)[day.id] || day.day}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {/* Tasks List */}
                  {day.tasks.map((task: any) => {
                    const isEditing = editingTask?.dayId === day.id && editingTask?.taskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className={`group/task relative p-3 rounded-xl border bg-card transition-all ${task.done ? 'opacity-60 border-border' : 'border-border hover:border-primary/50'}`}
                      >
                        {isEditing ? (
                          <div className="flex flex-col w-full gap-2">
                            <Input
                              value={editedTaskText}
                              onChange={(e: any) => setEditedTaskText(e.target.value)}
                              onKeyDown={(e: any) => {
                                if (e.key === "Enter") saveEditedTask();
                                if (e.key === "Escape") cancelEditing();
                              }}
                              autoFocus
                              className="h-8 text-sm"
                            />
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={cancelEditing}>
                                <X className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-success" onClick={saveEditedTask}>
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggle(day.id, task.id)}
                              className={`mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${task.done ? 'bg-success border-success' : 'border-muted-foreground/30 hover:border-primary/50 bg-transparent'}`}
                            >
                              {task.done && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                            </button>

                            <span
                              className={`text-sm leading-snug flex-1 cursor-text ${task.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                              onDoubleClick={() => startEditing(day.id, task.id, task.text)}
                            >
                              {task.text}
                            </span>

                            <div className="absolute right-2 top-2 opacity-0 group-hover/task:opacity-100 flex gap-0.5 transition-opacity bg-card/90 backdrop-blur-sm rounded-md p-0.5 shadow-sm border border-border/50">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => startEditing(day.id, task.id, task.text)}
                                title={common.edit}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-danger"
                                onClick={() => handleRemoveTask(day.id, task.id)}
                                title={common.delete}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add Task Input */}
                  {addingTo === day.id ? (
                    <div className="p-2 rounded-xl border bg-card border-border animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex gap-2">
                        <Input
                          value={newTask}
                          onChange={(e: any) => setNewTask(e.target.value)}
                          placeholder={`${t.add}...`}
                          onKeyDown={(e: any) => {
                            if (e.key === "Enter") handleAddTask(day.id);
                            if (e.key === "Escape") setAddingTo(null);
                          }}
                          autoFocus
                          className="h-8 text-sm"
                        />
                        <Button size="icon" className="h-8 w-8 shrink-0" onClick={() => handleAddTask(day.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingTo(day.id); setNewTask(""); }}
                      className="w-full py-2.5 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <span className="text-lg leading-none mb-0.5">+</span> {t.add}
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
