"use client";

import { useLocalStorage } from '@/hooks/use-local-storage';
import { startOfWeek, eachDayOfInterval, endOfWeek, format } from 'date-fns';
import { DailyPlanner } from './components/daily-planner';

export type Task = {
  id: string;
  text: string;
  completed: boolean;
};

type PlannerData = Record<string, Task[]>;

export default function PlannerPage() {
  const [tasks, setTasks] = useLocalStorage<PlannerData>('ignitehq-planner', {});
  
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getDayKey = (date: Date) => format(date, 'yyyy-MM-dd');

  const handleTaskAdd = (day: Date, text: string) => {
    const dayKey = getDayKey(day);
    const newTask: Task = { id: Date.now().toString(), text, completed: false };
    const dayTasks = tasks[dayKey] || [];
    setTasks({ ...tasks, [dayKey]: [...dayTasks, newTask] });
  };

  const handleTaskToggle = (day: Date, taskId: string) => {
    const dayKey = getDayKey(day);
    const dayTasks = (tasks[dayKey] || []).map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks({ ...tasks, [dayKey]: dayTasks });
  };
  
  const handleTaskDelete = (day: Date, taskId: string) => {
    const dayKey = getDayKey(day);
    const dayTasks = (tasks[dayKey] || []).filter((task) => task.id !== taskId);
    setTasks({ ...tasks, [dayKey]: dayTasks });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weekly Planner</h1>
        <p className="text-muted-foreground">
          Organize your week, set objectives, and stay on track.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {weekDays.map((day) => (
          <DailyPlanner
            key={day.toString()}
            day={day}
            tasks={tasks[getDayKey(day)] || []}
            onTaskAdd={(text) => handleTaskAdd(day, text)}
            onTaskToggle={(id) => handleTaskToggle(day, id)}
            onTaskDelete={(id) => handleTaskDelete(day, id)}
          />
        ))}
      </div>
    </div>
  );
}
