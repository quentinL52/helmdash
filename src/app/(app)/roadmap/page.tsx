'use client';

import { useState } from "react";
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';

// --- ICONS (inline SVG) ---
const Icons = {
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
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
  success: "#00cec9",
  warning: "#fdcb6e",
  danger: "#ff6b6b",
  teal: "#00b894",
};

// --- REUSABLE COMPONENTS ---
const Button = ({ children, onClick, variant = "default", size = "md", style, ...props }: any) => {
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
      padding: "8px 12px", color: COLORS.text, fontSize: "13px",
      fontFamily: "'DM Sans', sans-serif", outline: "none", width: "100%",
      transition: "border-color 0.2s", ...style,
    }}
    onFocus={(e: any) => { e.target.style.borderColor = COLORS.accent; }}
    onBlur={(e: any) => { e.target.style.borderColor = COLORS.border; }}
    {...props}
  />
);

const TextArea = ({ style, ...props }: any) => (
  <textarea
    style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "8px",
      padding: "8px 12px", color: COLORS.text, fontSize: "13px", resize: "vertical",
      fontFamily: "'DM Sans', sans-serif", outline: "none", width: "100%",
      minHeight: "40px", transition: "border-color 0.2s", ...style,
    }}
    onFocus={(e: any) => { e.target.style.borderColor = COLORS.accent; }}
    onBlur={(e: any) => { e.target.style.borderColor = COLORS.border; }}
    {...props}
  />
);

const Badge = ({ children, color = COLORS.accent, style }: any) => (
  <span style={{
    display: "inline-block", padding: "2px 8px", borderRadius: "4px", fontSize: "11px",
    fontWeight: 600, background: `${color}22`, color, letterSpacing: "0.02em", ...style,
  }}>
    {children}
  </span>
);

const Card = ({ children, style, className = "" }: any) => (
  <div className={className} style={{
    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
    borderRadius: "12px", padding: "12px", ...style,
  }}>
    {children}
  </div>
);

// --- ROADMAP PAGE ---
export default function RoadmapPage() {
  const [tasks, setTasks] = useLocalStorage<any[]>("roadmap", []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: "todo", priority: "medium", week: "" });

  const { language } = useFounderStore();
  const t = translations[language].roadmap;
  const common = translations[language].common;

  const ROADMAP_STATUSES = [
    { key: "todo", label: t.status.todo, color: COLORS.textMuted },
    { key: "doing", label: t.status.doing, color: COLORS.warning },
    { key: "done", label: t.status.done, color: COLORS.success },
  ];

  const add = () => {
    if (!form.title.trim()) return;
    setTasks([...tasks, { ...form, id: Date.now() }]);
    setForm({ title: "", description: "", status: "todo", priority: "medium", week: "" });
    setShowForm(false);
  };

  const updateStatus = (id: any, status: any) => setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  const remove = (id: any) => setTasks(tasks.filter(t => t.id !== id));

  const priorityColors: Record<string, string> = { high: COLORS.danger, medium: COLORS.warning, low: COLORS.teal };
  const priorityLabels: Record<string, string> = {
    high: t.priority.high,
    medium: t.priority.medium,
    low: t.priority.low
  };

  const animationCSS = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .fade-in { animation: fadeIn 0.3s ease both; }
    .scale-in { animation: scaleIn 0.25s ease both; }
  `;

  return (
    <div className="fade-in" style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.text, height: "100%", display: "flex", flexDirection: "column" }}>
      <style>{animationCSS}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexShrink: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          <Icons.Plus /> {t.new}
        </Button>
      </div>

      {showForm && (
        <Card className="scale-in" style={{ marginBottom: "20px", border: `1px solid ${COLORS.accent}33`, flexShrink: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <Input value={form.title} onChange={(e: any) => setForm({ ...form, title: e.target.value })} placeholder={`${t.form.title} *`} autoFocus />
            <Input value={form.week} onChange={(e: any) => setForm({ ...form, week: e.target.value })} placeholder={t.form.week} />
            <div style={{ gridColumn: "1 / -1" }}>
              <TextArea value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} placeholder={`${t.form.description}...`} />
            </div>
            <select value={form.priority} onChange={(e: any) => setForm({ ...form, priority: e.target.value })} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "8px 12px", color: COLORS.text, fontSize: "13px", fontFamily: "'DM Sans', sans-serif", outline: "none" }}>
              <option value="high">{t.priority.high}</option>
              <option value="medium">{t.priority.medium}</option>
              <option value="low">{t.priority.low}</option>
            </select>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button onClick={() => setShowForm(false)}>{common.cancel}</Button>
              <Button variant="primary" onClick={add}>{common.add}</Button>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: "16px", flex: 1, overflowX: "auto" }}>
        {ROADMAP_STATUSES.map(status => {
          const filtered = tasks.filter(t => t.status === status.key);
          return (
            <div key={status.key} style={{ flex: 1, minWidth: "280px", display: 'flex', flexDirection: 'column' }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px",
                padding: "8px 12px", background: `${status.color}11`, borderRadius: "8px",
                border: `1px solid ${status.color}22`, flexShrink: 0,
              }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: status.color }} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: status.color, fontFamily: "'Space Mono', monospace" }}>
                  {status.label}
                </span>
                <span style={{ fontSize: "11px", color: COLORS.textDim, marginLeft: "auto" }}>{filtered.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", flex: 1, paddingBottom: '8px' }}>
                {filtered.map(task => (
                  <Card key={task.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: COLORS.text }}>{task.title}</p>
                        {task.description && <p style={{ fontSize: "11px", color: COLORS.textMuted, marginTop: "4px", lineHeight: 1.4 }}>{task.description}</p>}
                      </div>
                      <button onClick={() => remove(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "2px", flexShrink: 0 }}>
                        <Icons.Trash />
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "8px", flexWrap: "wrap" }}>
                      <Badge color={priorityColors[task.priority]}>{priorityLabels[task.priority]}</Badge>
                      {task.week && <Badge color={COLORS.accent}>{task.week}</Badge>}
                      <select
                        value={task.status}
                        onChange={(e: any) => updateStatus(task.id, e.target.value)}
                        style={{
                          marginLeft: "auto", background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                          borderRadius: "4px", padding: "2px 6px", color: COLORS.textMuted,
                          fontSize: "10px", fontFamily: "'DM Sans', sans-serif", outline: "none", cursor: "pointer",
                        }}
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
    </div>
  );
}
