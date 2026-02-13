"use client";

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Task } from '../page';

interface DailyPlannerProps {
  day: Date;
  tasks: Task[];
  onTaskAdd: (text: string) => void;
  onTaskToggle: (id: string) => void;
  onTaskDelete: (id: string) => void;
}

export function DailyPlanner({
  day,
  tasks,
  onTaskAdd,
  onTaskToggle,
  onTaskDelete,
}: DailyPlannerProps) {
  const [newTask, setNewTask] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onTaskAdd(newTask.trim());
      setNewTask('');
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">
          {day.toLocaleDateString('en-US', { weekday: 'long' })}
          <span className="text-sm text-muted-foreground ml-2">
            {day.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <Input
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
        <div className="space-y-2">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 group"
              >
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => onTaskToggle(task.id)}
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={cn(
                    'flex-grow text-sm cursor-pointer',
                    task.completed && 'line-through text-muted-foreground'
                  )}
                >
                  {task.text}
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100"
                  onClick={() => onTaskDelete(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              No tasks for today.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
