'use client';

import { useState } from "react";
import { useFounderStore, RoadmapItem } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { RecommendationBanner } from '@/components/ui/recommendation-banner';
import { Sparkles } from 'lucide-react';
import { COLORS } from '@/lib/constants';

// --- ICONS (inline SVG) ---
const Icons = {
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
  ),
};



// --- REUSABLE COMPONENTS ---
const Button = ({ children, onClick, variant = "default", size = "md", style, className, ...props }: any) => {
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
    primary: { background: "#6c5ce7", color: "#fff", border: "none" },
  };
  return (
    <button
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e: any) => { e.target.style.opacity = "0.85"; }}
      onMouseLeave={(e: any) => { e.target.style.opacity = "1"; }}
      className={className}
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
  const tasks = useFounderStore(s => s.roadmap);
  const addRoadmapItem = useFounderStore(s => s.addRoadmapItem);
  const updateRoadmapItem = useFounderStore(s => s.updateRoadmapItem);
  const deleteRoadmapItem = useFounderStore(s => s.deleteRoadmapItem);

  const recommendations = useFounderStore(s => s.strategicRecommendations?.roadmapRecommendations);
  const showRecommendations = useFounderStore(s => s.showStrategicRecommendations);
  const toggleRecommendations = useFounderStore(s => s.toggleStrategicRecommendations);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: "todo", priority: "medium", week: "", startDate: "", dueDate: "" });

  const language = useFounderStore(s => s.language);
  const t = translations[language].roadmap;
  const common = translations[language].common;

  const ROADMAP_STATUSES = [
    { key: "todo", label: t.status.todo, color: COLORS.textMuted },
    { key: "doing", label: t.status.doing, color: COLORS.warning },
    { key: "done", label: t.status.done, color: COLORS.success },
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

  const updateStatus = (id: string, status: any) => updateRoadmapItem(id, { status });
  const remove = (id: string) => deleteRoadmapItem(id);

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
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={toggleRecommendations}
            style={{ background: showRecommendations ? COLORS.accent + '22' : COLORS.surface, color: showRecommendations ? COLORS.accent : COLORS.textMuted }}
          >
            <Sparkles className="w-4 h-4" />
          </Button>
          <Button variant="primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: "", description: "", status: "todo", priority: "medium", week: "", startDate: "", dueDate: "" }); }}>
            <Icons.Plus /> {t.new}
          </Button>
        </div>
      </div>

      {showRecommendations && recommendations && recommendations.length > 0 && (
        <RecommendationBanner
          recommendations={recommendations}
          type="roadmap"
          onApply={(item) => addRoadmapItem({
            title: item.title,
            priority: item.priority as any,
            status: 'todo',
            week: item.timeframe
          })}
          onDismiss={toggleRecommendations}
        />
      )}

      {showForm && (
        <Card className="scale-in" style={{ marginBottom: "20px", border: `1px solid ${COLORS.accent}33`, flexShrink: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <Input value={form.title} onChange={(e: any) => setForm({ ...form, title: e.target.value })} placeholder={`${t.form.title} *`} autoFocus />
            <Input value={form.week} onChange={(e: any) => setForm({ ...form, week: e.target.value })} placeholder={t.form.week} />
            <div style={{ gridColumn: "1 / -1" }}>
              <TextArea value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} placeholder={`${t.form.description}...`} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", color: COLORS.textMuted, fontWeight: 600 }}>Date de début</label>
              <Input type="date" value={form.startDate} onChange={(e: any) => setForm({ ...form, startDate: e.target.value })} style={{ colorScheme: "dark" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", color: COLORS.textMuted, fontWeight: 600 }}>Date limite</label>
              <Input type="date" value={form.dueDate} onChange={(e: any) => setForm({ ...form, dueDate: e.target.value })} style={{ colorScheme: "dark" }} />
            </div>
            <select value={form.priority} onChange={(e: any) => setForm({ ...form, priority: e.target.value })} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "8px 12px", color: COLORS.text, fontSize: "13px", fontFamily: "'DM Sans', sans-serif", outline: "none" }}>
              <option value="high">{t.priority.high}</option>
              <option value="medium">{t.priority.medium}</option>
              <option value="low">{t.priority.low}</option>
            </select>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button onClick={cancel}>{common.cancel}</Button>
              <Button variant="primary" onClick={add}>{editingId ? common.save || 'Save' : common.add}</Button>
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
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button onClick={() => edit(task)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "2px", flexShrink: 0 }}>
                          <Icons.Edit />
                        </button>
                        <button onClick={() => remove(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "2px", flexShrink: 0 }}>
                          <Icons.Trash />
                        </button>
                      </div>
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
