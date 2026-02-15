'use client';

import { useState } from "react";
import { useFounderStore } from '@/store/founder-store';
import { generateRoutineAnalysis } from '@/lib/ai-service';
import { Area, AreaChart, Tooltip, ResponsiveContainer } from 'recharts';
import { translations } from '@/lib/translations';
import { RecommendationBanner } from '@/components/ui/recommendation-banner';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- ICONS (inline SVG) ---
const Icons = {
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
  ),
  Sparkles: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
  ),
};

// --- COLOR PALETTE ---
const COLORS = {
  bg: "#0f1117",
  surface: "#181a24",
  surfaceHover: "#1e2130",
  border: "#282c3a",
  text: "#e8e9ed",
  textMuted: "#8b8fa3",
  textDim: "#5c6078",
  accent: "#6c5ce7",
  accentLight: "#a29bfe",
  success: "#00cec9",
  warning: "#fdcb6e",
  orange: "#e17055",
  pink: "#fd79a8",
  teal: "#00b894",
  delete: "#ff4d4f",
};

// --- REUSABLE COMPONENTS ---
// --- REUSABLE COMPONENTS ---
// Renamed to avoid collision with imported Button if any, but we are importing Button from ui/button in the replacement above? 
// Actually the previous import of Button from ui/button might conflict with this local Button.
// Let's RENAME the local Button to StyledButton to be safe.
const StyledButton = ({ onClick, children, variant = "default", size = "md", style, ...props }: any) => {
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: "6px",
    border: "none", borderRadius: "8px", cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
    transition: "all 0.2s ease",
    fontSize: size === "sm" ? "12px" : "13px",
    padding: size === "sm" ? "6px 10px" : "8px 16px",
  };
  const variants: Record<string, React.CSSProperties> = {
    default: { background: COLORS.surfaceHover, color: COLORS.text, border: `1px solid ${COLORS.border}` },
    primary: { background: COLORS.accent, color: "#fff", border: "none" },
    danger: { background: "rgba(255, 77, 79, 0.1)", color: COLORS.delete, border: `1px solid ${COLORS.delete}` },
    ghost: { background: "transparent", color: COLORS.textMuted, border: "none" },
    ai: { background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)", color: "#fff", border: "none" },
  };
  return (
    <button
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e: any) => { e.target.style.opacity = "0.85"; }}
      onMouseLeave={(e: any) => { e.target.style.opacity = "1"; }}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ style, ...props }: any) => (
  <input
    style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "8px",
      padding: "6px 8px", color: COLORS.text, fontSize: "12px",
      fontFamily: "'DM Sans', sans-serif", outline: "none", width: "100%",
      transition: "border-color 0.2s", ...style,
    }}
    onFocus={(e: any) => { e.target.style.borderColor = COLORS.accent; }}
    onBlur={(e: any) => { e.target.style.borderColor = COLORS.border; }}
    {...props}
  />
);

const Card = ({ children, style, className = "" }: any) => (
  <div className={className} style={{
    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
    borderRadius: "12px", ...style,
  }}>
    {children}
  </div>
);

// --- ROUTINE PAGE ---
export default function RoutinePage() {
  const routine = useFounderStore(s => s.routine);
  const routineHistory = useFounderStore(s => s.routineHistory);
  const toggleRoutineTask = useFounderStore(s => s.toggleRoutineTask);
  const addRoutineTask = useFounderStore(s => s.addRoutineTask);
  const updateRoutineTask = useFounderStore(s => s.updateRoutineTask);
  const deleteRoutineTask = useFounderStore(s => s.deleteRoutineTask);
  const resetRoutineWeek = useFounderStore(s => s.resetRoutineWeek);

  const language = useFounderStore(s => s.language);

  const recommendations = useFounderStore(s => s.strategicRecommendations?.routineOptimization);
  const showRecommendations = useFounderStore(s => s.showStrategicRecommendations);
  const toggleRecommendations = useFounderStore(s => s.toggleStrategicRecommendations);

  const t = translations[language].routine;
  const common = translations[language].common;

  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTask, setNewTask] = useState("");

  // AI Analysis State
  const [analysis, setAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State for editing task
  const [editingTask, setEditingTask] = useState<{ dayId: string; taskId: string } | null>(null);
  const [editedTaskText, setEditedTaskText] = useState("");

  const handleToggle = (dayId: string, taskId: string) => {
    toggleRoutineTask(dayId, taskId);
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

  const handleAnalyzeRoutine = async () => {
    setAiLoading(true);
    setIsDialogOpen(true);
    setAnalysis(t.coach.analyzing);
    try {
      const result = await generateRoutineAnalysis(routine, routineHistory);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Failed to analyze routine.");
    } finally {
      setAiLoading(false);
    }
  };

  // Safe checks for potentially undefined state during hot reload/migration
  const safeRoutine = routine || [];
  const safeHistory = routineHistory || [];

  const totalTasks = safeRoutine.reduce((a, d) => a + d.tasks.length, 0);
  const doneTasks = safeRoutine.reduce((a, d) => a + d.tasks.filter((t: any) => t.done).length, 0);
  const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

  const dayColors = [COLORS.accent, COLORS.orange, COLORS.pink, COLORS.teal, COLORS.warning];

  const animationCSS = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.3s ease both; }
  `;

  // Filter history to last 14 days for the chart
  const historyData = safeHistory.slice(-14).map(h => ({
    date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    rate: Math.round(h.completionRate * 100)
  }));

  return (
    <div className="fade-in h-[calc(100vh-64px)] flex flex-col overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
      <style>{animationCSS}</style>

      {/* Header & Stats */}
      <div className="shrink-0 p-8 pb-0">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#e8e9ed]">{t.title}</h1>
            <p style={{ fontSize: "14px", color: COLORS.textMuted, marginTop: "4px" }}>
              {doneTasks}/{totalTasks} {t.completedText}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <StyledButton variant="ai" onClick={handleAnalyzeRoutine}>
                  <Icons.Sparkles />
                  {t.analyze}
                </StyledButton>
              </DialogTrigger>
              <DialogContent className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed] max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t.coach.title}</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {t.coach.desc}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 whitespace-pre-wrap leading-relaxed text-sm text-gray-300">
                  {aiLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> {t.coach.analyzing}
                    </div>
                  ) : analysis}
                </div>
              </DialogContent>
            </Dialog>

            <div style={{ width: "100px", height: "6px", background: COLORS.surface, borderRadius: "3px", overflow: "hidden" }}>
              <div style={{
                width: `${progress}%`, height: "100%",
                background: progress === 100 ? COLORS.success : `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentLight})`,
                borderRadius: "3px", transition: "width 0.4s ease",
              }} />
            </div>
            <span style={{ fontSize: "12px", color: progress === 100 ? COLORS.success : COLORS.textMuted, fontFamily: "'Space Mono', monospace" }}>
              {Math.round(progress)}%
            </span>
            <StyledButton size="sm" onClick={resetRoutineWeek}>{t.reset}</StyledButton>
          </div>
        </div>



        {
          showRecommendations && recommendations && recommendations.length > 0 && (
            <div className="mb-6">
              <RecommendationBanner
                recommendations={recommendations}
                type="routine"
                onApply={(item) => {
                  const isDaily = item.timeframe?.toLowerCase().includes('daily');
                  if (isDaily) {
                    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
                      addRoutineTask(day, item.suggestion);
                    });
                  } else {
                    // Default to Monday for weekly tasks
                    addRoutineTask('monday', item.suggestion);
                  }
                }}
                onDismiss={toggleRecommendations}
              />
            </div>
          )
        }

        {/* Consistency Chart */}
        {
          historyData.length > 2 && (
            <div className="h-[100px] w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '8px' }}
                    itemStyle={{ color: COLORS.text }}
                  />
                  <Area type="monotone" dataKey="rate" stroke={COLORS.accent} fillOpacity={1} fill="url(#colorRate)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )
        }
      </div>
      {/* Columns */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="grid grid-cols-5 gap-4 pb-8">
          {safeRoutine.map((day, dayIdx) => (
            <div key={day.id} className="flex flex-col gap-3">
              {/* 1. Styled Header Frame */}
              <div
                className="p-3 text-center rounded-xl border"
                style={{
                  backgroundColor: `${dayColors[dayIdx % dayColors.length]}10`, // Very light opacity
                  borderColor: `${dayColors[dayIdx % dayColors.length]}40`,
                  // color: dayColors[dayIdx % dayColors.length]
                }}
              >
                <h4 style={{
                  fontSize: "14px", fontWeight: 700,
                  color: dayColors[dayIdx % dayColors.length],
                  fontFamily: "'Space Mono', monospace",
                  textTransform: "uppercase", letterSpacing: "0.04em",
                }}>
                  {(common.days as any)[day.id] || day.day}
                </h4>
              </div>

              {/* 2. Tasks Frame (Separate) */}
              <div className="flex flex-col gap-2">
                {day.tasks.map((task: any) => {
                  const isEditing = editingTask?.dayId === day.id && editingTask?.taskId === task.id;

                  return (
                    <div
                      key={task.id}
                      className="group/task relative p-3 rounded-xl border bg-[#181a24] border-[#282c3a] hover:border-[#3f445a] transition-all"
                      style={{
                        opacity: task.done ? 0.6 : 1,
                      }}
                    >
                      {isEditing ? (
                        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "8px" }}>
                          <Input
                            value={editedTaskText}
                            onChange={(e: any) => setEditedTaskText(e.target.value)}
                            onKeyDown={(e: any) => {
                              if (e.key === "Enter") saveEditedTask();
                              if (e.key === "Escape") cancelEditing();
                            }}
                            autoFocus
                          />
                          <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                            <StyledButton variant="ghost" size="sm" onClick={cancelEditing} style={{ padding: "4px" }}>
                              <Icons.X />
                            </StyledButton>
                            <StyledButton variant="ghost" size="sm" onClick={saveEditedTask} style={{ color: COLORS.success, padding: "4px" }}>
                              <Icons.Check />
                            </StyledButton>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div
                            onClick={() => handleToggle(day.id, task.id)}
                            className="mt-0.5 w-5 h-5 rounded-md border-2 border-[#282c3a] flex items-center justify-center cursor-pointer transition-colors"
                            style={{
                              borderColor: task.done ? COLORS.success : COLORS.border,
                              backgroundColor: task.done ? COLORS.success : "transparent",
                            }}
                          >
                            {task.done && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>

                          <span
                            className="text-sm leading-snug flex-1 cursor-text"
                            style={{
                              color: task.done ? COLORS.textDim : COLORS.text,
                              textDecoration: task.done ? "line-through" : "none",
                            }}
                            onDoubleClick={() => startEditing(day.id, task.id, task.text)}
                          >
                            {task.text}
                          </span>

                          <div className="absolute right-2 top-2 opacity-0 group-hover/task:opacity-100 flex gap-1 transition-opacity bg-[#181a24]/80 backdrop-blur-sm rounded-md p-1">
                            <button
                              onClick={() => startEditing(day.id, task.id, task.text)}
                              className="p-1 hover:text-white text-[#8b8fa3] transition-colors"
                              title={common.edit}
                            >
                              <Icons.Edit />
                            </button>
                            <button
                              onClick={() => handleRemoveTask(day.id, task.id)}
                              className="p-1 hover:text-[#ff4d4f] text-[#8b8fa3] transition-colors"
                              title={common.delete}
                            >
                              <Icons.Trash />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 3. Add Button Frame */}
                {addingTo === day.id ? (
                  <div className="p-3 rounded-xl border bg-[#181a24] border-[#282c3a]">
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Input
                        value={newTask}
                        onChange={(e: any) => setNewTask(e.target.value)}
                        placeholder={`${t.add}...`}
                        onKeyDown={(e: any) => {
                          if (e.key === "Enter") handleAddTask(day.id);
                          if (e.key === "Escape") setAddingTo(null);
                        }}
                        autoFocus
                      />
                      <StyledButton size="sm" variant="primary" onClick={() => handleAddTask(day.id)}>+</StyledButton>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddingTo(day.id); setNewTask(""); }}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-[#282c3a] text-[#5c6078] hover:border-[#6c5ce7] hover:text-[#6c5ce7] hover:bg-[#6c5ce7]/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <span>+</span> {t.add}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
