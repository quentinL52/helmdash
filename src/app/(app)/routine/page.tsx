'use client';

import { useState } from "react";
import { useLocalStorage } from '@/hooks/use-local-storage';

// --- ICONS (inline SVG) ---
const Icons = {
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
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
};

// --- REUSABLE COMPONENTS ---
const Button = ({ children, onClick, variant = "default", size = "sm", style, ...props }: any) => {
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


const DEFAULT_ROUTINE = [
  { day: "Lundi", tasks: [
    { text: "Revue stratégie & mise à jour Lean Canvas", done: false },
    { text: "Définir les 3 priorités de la semaine", done: false },
  ]},
  { day: "Mardi", tasks: [
    { text: "Outreach : contacter 5-10 prospects", done: false },
    { text: "1 interview utilisateur (15-20 min)", done: false },
  ]},
  { day: "Mercredi", tasks: [
    { text: "Rédiger 1 post LinkedIn (build in public)", done: false },
    { text: "Veille concurrence & écosystème IA", done: false },
  ]},
  { day: "Jeudi", tasks: [
    { text: "1 appel réseau (mentor, fondateur, expert)", done: false },
    { text: "Avancement admin / finance / juridique", done: false },
  ]},
  { day: "Vendredi", tasks: [
    { text: "Synthèse feedback utilisateurs → décisions produit", done: false },
    { text: "Rétrospective perso : qu'est-ce qui a marché ?", done: false },
    { text: "Mise à jour roadmap semaine suivante", done: false },
  ]},
];

// --- ROUTINE PAGE ---
export default function RoutinePage() {
  const [routine, setRoutine] = useLocalStorage<any[]>("routine", DEFAULT_ROUTINE);
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [newTask, setNewTask] = useState("");

  const toggle = (dayIdx: number, taskIdx: number) => {
    const next = routine.map((d, di) => di === dayIdx ? {
      ...d, tasks: d.tasks.map((t: any, ti: number) => ti === taskIdx ? { ...t, done: !t.done } : t),
    } : d);
    setRoutine(next);
  };

  const addTask = (dayIdx: number) => {
    if (!newTask.trim()) return;
    const next = routine.map((d, di) => di === dayIdx ? {
      ...d, tasks: [...d.tasks, { text: newTask, done: false }],
    } : d);
    setRoutine(next);
    setNewTask("");
    setAddingTo(null);
  };

  const removeTask = (dayIdx: number, taskIdx: number) => {
    const next = routine.map((d, di) => di === dayIdx ? {
      ...d, tasks: d.tasks.filter((_: any, ti: number) => ti !== taskIdx),
    } : d);
    setRoutine(next);
  };

  const resetWeek = () => {
    const next = routine.map(d => ({ ...d, tasks: d.tasks.map((t: any) => ({ ...t, done: false })) }));
    setRoutine(next);
  };

  const totalTasks = routine.reduce((a, d) => a + d.tasks.length, 0);
  const doneTasks = routine.reduce((a, d) => a + d.tasks.filter((t: any) => t.done).length, 0);
  const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

  const dayColors = [COLORS.accent, COLORS.orange, COLORS.pink, COLORS.teal, COLORS.warning];

  const animationCSS = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.3s ease both; }
  `;

  return (
    <div className="fade-in" style={{fontFamily: "'DM Sans', sans-serif", color: COLORS.text}}>
       <style>{animationCSS}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Routine Hebdo</h1>
          <p style={{ fontSize: "14px", color: COLORS.textMuted, marginTop: "4px" }}>
            {doneTasks}/{totalTasks} tâches complétées
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
          <Button size="sm" onClick={resetWeek}>Reset semaine</Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
        {routine.map((day, dayIdx) => (
          <Card key={day.day} style={{
            borderTop: `3px solid ${dayColors[dayIdx % dayColors.length]}`, padding: "16px"
          }}>
            <h4 style={{
              fontSize: "13px", fontWeight: 700, color: dayColors[dayIdx % dayColors.length],
              fontFamily: "'Space Mono', monospace", marginBottom: "12px",
              textTransform: "uppercase", letterSpacing: "0.04em",
            }}>
              {day.day}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {day.tasks.map((task: any, taskIdx: number) => (
                <div
                  key={taskIdx}
                  className="group/task"
                  style={{
                    display: "flex", alignItems: "flex-start", gap: "8px",
                    padding: "6px 8px", borderRadius: "6px",
                    background: task.done ? `${COLORS.success}08` : "transparent",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    onClick={() => toggle(dayIdx, taskIdx)}
                    style={{
                      width: "18px", height: "18px", borderRadius: "4px", flexShrink: 0, marginTop: "1px",
                      border: `2px solid ${task.done ? COLORS.success : COLORS.border}`,
                      background: task.done ? COLORS.success : "transparent",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    {task.done && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontSize: "13px", color: task.done ? COLORS.textDim : COLORS.text,
                    textDecoration: task.done ? "line-through" : "none",
                    lineHeight: 1.4, flex: 1, transition: "all 0.2s",
                  }}>
                    {task.text}
                  </span>
                  <button
                    onClick={() => removeTask(dayIdx, taskIdx)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "0", opacity: 0, flexShrink: 0, transition: 'opacity 0.2s' }}
                    className="group-hover/task:opacity-40 hover:!opacity-100"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              ))}
            </div>
            {addingTo === dayIdx ? (
              <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                <Input
                  value={newTask}
                  onChange={(e: any) => setNewTask(e.target.value)}
                  placeholder="Nouvelle tâche..."
                  onKeyDown={(e: any) => e.key === "Enter" && addTask(dayIdx)}
                  autoFocus
                />
                <Button size="sm" variant="primary" onClick={() => addTask(dayIdx)}>+</Button>
              </div>
            ) : (
              <button
                onClick={() => { setAddingTo(dayIdx); setNewTask(""); }}
                style={{
                  marginTop: "8px", background: "none", border: `1px dashed ${COLORS.border}`,
                  borderRadius: "6px", padding: "6px", width: "100%", cursor: "pointer",
                  color: COLORS.textDim, fontSize: "11px", fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e: any) => { e.target.style.borderColor = COLORS.accent; e.target.style.color = COLORS.accent; }}
                onMouseLeave={(e: any) => { e.target.style.borderColor = COLORS.border; e.target.style.color = COLORS.textDim; }}
              >
                + Ajouter
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
