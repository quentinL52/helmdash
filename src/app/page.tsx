'use client';

import { useState, useEffect, useReducer, useCallback, useRef } from "react";

// ─── STORAGE HELPERS ───
const loadState = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
};
const saveState = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

// ─── ICONS (inline SVG) ───
const Icons = {
  Canvas: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/><path d="M15 3v6"/>
    </svg>
  ),
  Ideas: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 1 4 12.7V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.3A7 7 0 0 1 12 2z"/><line x1="9" y1="21" x2="15" y2="21"/>
    </svg>
  ),
  CRM: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Roadmap: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Routine: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  ),
  Grip: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
      <circle cx="8" cy="4" r="2"/><circle cx="16" cy="4" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="20" r="2"/><circle cx="16" cy="20" r="2"/>
    </svg>
  ),
};

// ─── COLOR PALETTE ───
const COLORS = {
  bg: "#0f1117",
  surface: "#181a24",
  surfaceHover: "#1e2130",
  border: "#282c3a",
  borderLight: "#333848",
  text: "#e8e9ed",
  textMuted: "#8b8fa3",
  textDim: "#5c6078",
  accent: "#6c5ce7",
  accentLight: "#a29bfe",
  accentDim: "#4a3fb5",
  success: "#00cec9",
  warning: "#fdcb6e",
  danger: "#ff6b6b",
  orange: "#e17055",
  pink: "#fd79a8",
  teal: "#00b894",
};

const POST_IT_COLORS = [
  { bg: "#ffeaa7", text: "#2d3436", label: "Jaune" },
  { bg: "#fab1a0", text: "#2d3436", label: "Corail" },
  { bg: "#81ecec", text: "#2d3436", label: "Cyan" },
  { bg: "#a29bfe", text: "#2d3436", label: "Violet" },
  { bg: "#55efc4", text: "#2d3436", label: "Vert" },
  { bg: "#fd79a8", text: "#2d3436", label: "Rose" },
];

const CRM_STATUSES = [
  { key: "prospect", label: "Prospect", color: COLORS.textMuted },
  { key: "contacted", label: "Contacté", color: COLORS.warning },
  { key: "meeting", label: "RDV prévu", color: COLORS.accentLight },
  { key: "interested", label: "Intéressé", color: COLORS.success },
  { key: "lost", label: "Perdu", color: COLORS.danger },
];

const ROADMAP_STATUSES = [
  { key: "todo", label: "À faire", color: COLORS.textMuted },
  { key: "doing", label: "En cours", color: COLORS.warning },
  { key: "done", label: "Terminé", color: COLORS.success },
];

// ─── GLOBAL STYLES ───
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&family=Space+Mono:wght@400;700&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: ${COLORS.borderLight}; }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-12px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .fade-in { animation: fadeIn 0.3s ease both; }
  .scale-in { animation: scaleIn 0.25s ease both; }
`;

// ─── REUSABLE COMPONENTS ───
const Button = ({ children, onClick, variant = "default", size = "md", style, ...props }) => {
  const base = {
    display: "inline-flex", alignItems: "center", gap: "6px",
    border: "none", borderRadius: "8px", cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
    transition: "all 0.2s ease",
    fontSize: size === "sm" ? "12px" : "13px",
    padding: size === "sm" ? "6px 10px" : "8px 16px",
  };
  const variants = {
    default: { background: COLORS.surfaceHover, color: COLORS.text, border: `1px solid ${COLORS.border}` },
    primary: { background: COLORS.accent, color: "#fff", border: "none" },
    ghost: { background: "transparent", color: COLORS.textMuted, border: "none", padding: "4px 8px" },
    danger: { background: "rgba(255,107,107,0.1)", color: COLORS.danger, border: `1px solid rgba(255,107,107,0.2)` },
  };
  return (
    <button
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => { e.target.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.target.style.opacity = "1"; }}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ style, ...props }) => (
  <input
    style={{
      background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "8px",
      padding: "8px 12px", color: COLORS.text, fontSize: "13px",
      fontFamily: "'DM Sans', sans-serif", outline: "none", width: "100%",
      transition: "border-color 0.2s", ...style,
    }}
    onFocus={e => { e.target.style.borderColor = COLORS.accent; }}
    onBlur={e => { e.target.style.borderColor = COLORS.border; }}
    {...props}
  />
);

const TextArea = ({ style, ...props }) => (
  <textarea
    style={{
      background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "8px",
      padding: "8px 12px", color: COLORS.text, fontSize: "13px", resize: "vertical",
      fontFamily: "'DM Sans', sans-serif", outline: "none", width: "100%",
      minHeight: "60px", transition: "border-color 0.2s", ...style,
    }}
    onFocus={e => { e.target.style.borderColor = COLORS.accent; }}
    onBlur={e => { e.target.style.borderColor = COLORS.border; }}
    {...props}
  />
);

const Badge = ({ children, color = COLORS.accent, style }) => (
  <span style={{
    display: "inline-block", padding: "2px 8px", borderRadius: "4px", fontSize: "11px",
    fontWeight: 600, background: `${color}22`, color, letterSpacing: "0.02em", ...style,
  }}>
    {children}
  </span>
);

const Card = ({ children, style, className = "" }) => (
  <div className={className} style={{
    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
    borderRadius: "12px", padding: "16px", ...style,
  }}>
    {children}
  </div>
);

const SectionTitle = ({ children, count }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
    <h3 style={{ fontSize: "15px", fontWeight: 600, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>
      {children}
    </h3>
    {count !== undefined && (
      <span style={{
        fontSize: "11px", color: COLORS.textDim, background: COLORS.surfaceHover,
        padding: "2px 8px", borderRadius: "10px",
      }}>
        {count}
      </span>
    )}
  </div>
);

// ─── MODULE 1: LEAN CANVAS ───
const CANVAS_FIELDS = [
  { key: "problem", label: "Problème", row: "1/3", col: "1/2", hint: "Top 3 problèmes de tes utilisateurs" },
  { key: "solution", label: "Solution", row: "1/2", col: "2/3", hint: "Tes solutions à ces problèmes" },
  { key: "metrics", label: "Métriques clés", row: "2/3", col: "2/3", hint: "KPIs que tu vas suivre" },
  { key: "uvp", label: "Proposition de valeur unique", row: "1/3", col: "3/4", hint: "Message clair et convaincant" },
  { key: "advantage", label: "Avantage injuste", row: "1/3", col: "4/5", hint: "Ce qu'on ne peut pas copier facilement" },
  { key: "channels", label: "Canaux", row: "1/2", col: "5/6", hint: "Comment tu atteins tes utilisateurs" },
  { key: "segments", label: "Segments clients", row: "2/3", col: "5/6", hint: "Tes utilisateurs cibles" },
  { key: "costs", label: "Structure de coûts", row: "3/4", col: "1/4", hint: "Coûts fixes et variables" },
  { key: "revenue", label: "Sources de revenus", row: "3/4", col: "4/7", hint: "Comment tu gagnes de l'argent" },
];

const LeanCanvas = () => {
  const [data, setData] = useState(() => loadState("leancanvas", {}));
  const [lastSaved, setLastSaved] = useState(null);

  const update = (key, val) => {
    const next = { ...data, [key]: val };
    setData(next);
    saveState("leancanvas", next);
    setLastSaved(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
  };

  const filled = CANVAS_FIELDS.filter(f => data[f.key]?.trim()).length;

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>Lean Canvas</h2>
          <p style={{ fontSize: "12px", color: COLORS.textDim, marginTop: "4px" }}>
            {filled}/{CANVAS_FIELDS.length} sections remplies
            {lastSaved && <span> · Sauvegardé à {lastSaved}</span>}
          </p>
        </div>
        <div style={{ width: "120px", height: "6px", background: COLORS.bg, borderRadius: "3px", overflow: "hidden" }}>
          <div style={{
            width: `${(filled / CANVAS_FIELDS.length) * 100}%`, height: "100%",
            background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentLight})`,
            borderRadius: "3px", transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gridTemplateRows: "repeat(3, auto)",
        gap: "1px",
        background: COLORS.border,
        borderRadius: "12px",
        overflow: "hidden",
        border: `1px solid ${COLORS.border}`,
      }}>
        {CANVAS_FIELDS.map((field) => (
          <div
            key={field.key}
            style={{
              gridRow: field.row, gridColumn: field.col,
              background: COLORS.surface, padding: "14px",
              minHeight: field.row === "3/4" ? "100px" : "130px",
              display: "flex", flexDirection: "column",
            }}
          >
            <label style={{
              fontSize: "11px", fontWeight: 700, color: COLORS.accent,
              textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px",
              fontFamily: "'Space Mono', monospace",
            }}>
              {field.label}
            </label>
            <p style={{ fontSize: "10px", color: COLORS.textDim, marginBottom: "8px", lineHeight: 1.3 }}>
              {field.hint}
            </p>
            <textarea
              value={data[field.key] || ""}
              onChange={e => update(field.key, e.target.value)}
              placeholder="Écrire ici..."
              style={{
                flex: 1, background: "transparent", border: "none", color: COLORS.text,
                fontSize: "13px", fontFamily: "'DM Sans', sans-serif", outline: "none",
                resize: "none", lineHeight: 1.5,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── MODULE 2: IDEA BOARD (POST-ITS) ───
const IdeaBoard = () => {
  const [ideas, setIdeas] = useState(() => loadState("ideas", []));
  const [showForm, setShowForm] = useState(false);
  const [newIdea, setNewIdea] = useState({ text: "", color: 0, category: "" });
  const [filter, setFilter] = useState("all");

  const save = (next) => { setIdeas(next); saveState("ideas", next); };

  const addIdea = () => {
    if (!newIdea.text.trim()) return;
    save([...ideas, {
      id: Date.now(), text: newIdea.text, color: newIdea.color,
      category: newIdea.category || "Général", date: new Date().toLocaleDateString("fr-FR"),
    }]);
    setNewIdea({ text: "", color: 0, category: "" });
    setShowForm(false);
  };

  const removeIdea = (id) => save(ideas.filter(i => i.id !== id));

  const categories = ["all", ...new Set(ideas.map(i => i.category))];
  const filtered = filter === "all" ? ideas : ideas.filter(i => i.category === filter);

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>
          Board d'idées
        </h2>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          <Icons.Plus /> Nouvelle idée
        </Button>
      </div>

      {showForm && (
        <Card className="scale-in" style={{ marginBottom: "20px", border: `1px solid ${COLORS.accent}33` }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <TextArea
              value={newIdea.text}
              onChange={e => setNewIdea({ ...newIdea, text: e.target.value })}
              placeholder="Décris ton idée..."
              autoFocus
            />
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <Input
                value={newIdea.category}
                onChange={e => setNewIdea({ ...newIdea, category: e.target.value })}
                placeholder="Catégorie (ex: Produit, Marketing...)"
                style={{ flex: 1, minWidth: "180px" }}
              />
              <div style={{ display: "flex", gap: "6px" }}>
                {POST_IT_COLORS.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => setNewIdea({ ...newIdea, color: i })}
                    style={{
                      width: "24px", height: "24px", borderRadius: "6px", background: c.bg,
                      cursor: "pointer", border: newIdea.color === i ? `2px solid ${COLORS.text}` : "2px solid transparent",
                      transition: "all 0.15s",
                    }}
                  />
                ))}
              </div>
              <Button variant="primary" onClick={addIdea}>Ajouter</Button>
            </div>
          </div>
        </Card>
      )}

      {categories.length > 1 && (
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: "4px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
                fontSize: "12px", fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                background: filter === cat ? COLORS.accent : COLORS.surfaceHover,
                color: filter === cat ? "#fff" : COLORS.textMuted,
                transition: "all 0.2s",
              }}
            >
              {cat === "all" ? "Toutes" : cat}
            </button>
          ))}
        </div>
      )}

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "12px",
      }}>
        {filtered.map((idea, idx) => {
          const c = POST_IT_COLORS[idea.color] || POST_IT_COLORS[0];
          return (
            <div
              key={idea.id}
              className="fade-in"
              style={{
                background: c.bg, color: c.text, borderRadius: "4px",
                padding: "16px", minHeight: "120px", position: "relative",
                boxShadow: "2px 3px 8px rgba(0,0,0,0.15)",
                transform: `rotate(${(idx % 5 - 2) * 0.8}deg)`,
                transition: "transform 0.2s, box-shadow 0.2s",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                animationDelay: `${idx * 50}ms`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "rotate(0deg) scale(1.03)"; e.currentTarget.style.boxShadow = "4px 6px 16px rgba(0,0,0,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${(idx % 5 - 2) * 0.8}deg)`; e.currentTarget.style.boxShadow = "2px 3px 8px rgba(0,0,0,0.15)"; }}
            >
              <div>
                <p style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                  {idea.text}
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                <span style={{ fontSize: "10px", opacity: 0.6, fontFamily: "'Space Mono', monospace" }}>
                  {idea.category} · {idea.date}
                </span>
                <button
                  onClick={() => removeIdea(idea.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.4, padding: "2px" }}
                  onMouseEnter={e => { e.target.style.opacity = 1; }}
                  onMouseLeave={e => { e.target.style.opacity = 0.4; }}
                >
                  <Icons.Trash />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: COLORS.textDim }}>
            <p style={{ fontSize: "14px" }}>Aucune idée pour le moment</p>
            <p style={{ fontSize: "12px", marginTop: "4px" }}>Clique sur "Nouvelle idée" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MODULE 3: CRM ───
const CRMModule = () => {
  const [contacts, setContacts] = useState(() => loadState("crm", []));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", status: "prospect", notes: "" });
  const [editId, setEditId] = useState(null);

  const save = (next) => { setContacts(next); saveState("crm", next); };

  const submit = () => {
    if (!form.name.trim()) return;
    if (editId) {
      save(contacts.map(c => c.id === editId ? { ...c, ...form } : c));
      setEditId(null);
    } else {
      save([...contacts, { ...form, id: Date.now(), date: new Date().toLocaleDateString("fr-FR") }]);
    }
    setForm({ name: "", company: "", email: "", status: "prospect", notes: "" });
    setShowForm(false);
  };

  const startEdit = (c) => {
    setForm({ name: c.name, company: c.company, email: c.email, status: c.status, notes: c.notes });
    setEditId(c.id);
    setShowForm(true);
  };

  const remove = (id) => save(contacts.filter(c => c.id !== id));
  const updateStatus = (id, status) => save(contacts.map(c => c.id === id ? { ...c, status } : c));

  const grouped = CRM_STATUSES.map(s => ({
    ...s,
    contacts: contacts.filter(c => c.status === s.key),
  }));

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>
            Suivi Contacts
          </h2>
          <p style={{ fontSize: "12px", color: COLORS.textDim, marginTop: "4px" }}>
            {contacts.length} contact{contacts.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: "", company: "", email: "", status: "prospect", notes: "" }); }}>
          <Icons.Plus /> Nouveau contact
        </Button>
      </div>

      {showForm && (
        <Card className="scale-in" style={{ marginBottom: "20px", border: `1px solid ${COLORS.accent}33` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nom *" autoFocus />
            <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Entreprise" />
            <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" />
            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              style={{
                background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "8px",
                padding: "8px 12px", color: COLORS.text, fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif", outline: "none",
              }}
            >
              {CRM_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <div style={{ gridColumn: "1 / -1" }}>
              <TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes..." style={{ minHeight: "50px" }} />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button onClick={() => { setShowForm(false); setEditId(null); }}>Annuler</Button>
              <Button variant="primary" onClick={submit}>{editId ? "Modifier" : "Ajouter"}</Button>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
        {grouped.map(group => (
          <div key={group.key} style={{ minWidth: "220px", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", padding: "0 4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: group.color }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: COLORS.text, fontFamily: "'Space Mono', monospace" }}>
                {group.label}
              </span>
              <span style={{ fontSize: "11px", color: COLORS.textDim }}>{group.contacts.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {group.contacts.map(c => (
                <Card key={c.id} style={{ padding: "12px", cursor: "default" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: COLORS.text }}>{c.name}</p>
                      {c.company && <p style={{ fontSize: "11px", color: COLORS.textMuted, marginTop: "2px" }}>{c.company}</p>}
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button onClick={() => startEdit(c)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "2px" }}>
                        <Icons.Edit />
                      </button>
                      <button onClick={() => remove(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "2px" }}>
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                  {c.notes && <p style={{ fontSize: "11px", color: COLORS.textDim, marginTop: "6px", lineHeight: 1.4 }}>{c.notes}</p>}
                  <div style={{ marginTop: "8px" }}>
                    <select
                      value={c.status}
                      onChange={e => updateStatus(c.id, e.target.value)}
                      style={{
                        background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "4px",
                        padding: "3px 6px", color: group.color, fontSize: "10px",
                        fontFamily: "'DM Sans', sans-serif", outline: "none", cursor: "pointer",
                      }}
                    >
                      {CRM_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── MODULE 4: ROADMAP ───
const RoadmapModule = () => {
  const [tasks, setTasks] = useState(() => loadState("roadmap", []));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: "todo", priority: "medium", week: "" });

  const save = (next) => { setTasks(next); saveState("roadmap", next); };

  const add = () => {
    if (!form.title.trim()) return;
    save([...tasks, { ...form, id: Date.now() }]);
    setForm({ title: "", description: "", status: "todo", priority: "medium", week: "" });
    setShowForm(false);
  };

  const updateStatus = (id, status) => save(tasks.map(t => t.id === id ? { ...t, status } : t));
  const remove = (id) => save(tasks.filter(t => t.id !== id));

  const priorityColors = { high: COLORS.danger, medium: COLORS.warning, low: COLORS.teal };
  const priorityLabels = { high: "Haute", medium: "Moyenne", low: "Basse" };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>
          Roadmap
        </h2>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          <Icons.Plus /> Nouvelle tâche
        </Button>
      </div>

      {showForm && (
        <Card className="scale-in" style={{ marginBottom: "20px", border: `1px solid ${COLORS.accent}33` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Titre *" autoFocus />
            <Input value={form.week} onChange={e => setForm({ ...form, week: e.target.value })} placeholder="Semaine (ex: S7, Fév)" />
            <div style={{ gridColumn: "1 / -1" }}>
              <TextArea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description..." style={{ minHeight: "40px" }} />
            </div>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "8px 12px", color: COLORS.text, fontSize: "13px", fontFamily: "'DM Sans', sans-serif", outline: "none" }}>
              <option value="high">Priorité haute</option>
              <option value="medium">Priorité moyenne</option>
              <option value="low">Priorité basse</option>
            </select>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button onClick={() => setShowForm(false)}>Annuler</Button>
              <Button variant="primary" onClick={add}>Ajouter</Button>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px" }}>
        {ROADMAP_STATUSES.map(status => {
          const filtered = tasks.filter(t => t.status === status.key);
          return (
            <div key={status.key} style={{ flex: 1, minWidth: "250px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px",
                padding: "8px 12px", background: `${status.color}11`, borderRadius: "8px",
                border: `1px solid ${status.color}22`,
              }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: status.color }} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: status.color, fontFamily: "'Space Mono', monospace" }}>
                  {status.label}
                </span>
                <span style={{ fontSize: "11px", color: COLORS.textDim, marginLeft: "auto" }}>{filtered.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filtered.map(task => (
                  <Card key={task.id} style={{ padding: "12px" }}>
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
                      {task.week && <Badge color={COLORS.accentLight}>{task.week}</Badge>}
                      <select
                        value={task.status}
                        onChange={e => updateStatus(task.id, e.target.value)}
                        style={{
                          marginLeft: "auto", background: COLORS.bg, border: `1px solid ${COLORS.border}`,
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
};

// ─── MODULE 5: WEEKLY ROUTINE ───
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

const RoutineModule = () => {
  const [routine, setRoutine] = useState(() => loadState("routine", DEFAULT_ROUTINE));
  const [addingTo, setAddingTo] = useState(null);
  const [newTask, setNewTask] = useState("");

  const save = (next) => { setRoutine(next); saveState("routine", next); };

  const toggle = (dayIdx, taskIdx) => {
    const next = routine.map((d, di) => di === dayIdx ? {
      ...d, tasks: d.tasks.map((t, ti) => ti === taskIdx ? { ...t, done: !t.done } : t),
    } : d);
    save(next);
  };

  const addTask = (dayIdx) => {
    if (!newTask.trim()) return;
    const next = routine.map((d, di) => di === dayIdx ? {
      ...d, tasks: [...d.tasks, { text: newTask, done: false }],
    } : d);
    save(next);
    setNewTask("");
    setAddingTo(null);
  };

  const removeTask = (dayIdx, taskIdx) => {
    const next = routine.map((d, di) => di === dayIdx ? {
      ...d, tasks: d.tasks.filter((_, ti) => ti !== taskIdx),
    } : d);
    save(next);
  };

  const resetWeek = () => {
    const next = routine.map(d => ({ ...d, tasks: d.tasks.map(t => ({ ...t, done: false })) }));
    save(next);
  };

  const totalTasks = routine.reduce((a, d) => a + d.tasks.length, 0);
  const doneTasks = routine.reduce((a, d) => a + d.tasks.filter(t => t.done).length, 0);
  const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

  const dayColors = [COLORS.accent, COLORS.orange, COLORS.pink, COLORS.teal, COLORS.warning];

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>
            Routine Hebdo
          </h2>
          <p style={{ fontSize: "12px", color: COLORS.textDim, marginTop: "4px" }}>
            {doneTasks}/{totalTasks} tâches complétées
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "100px", height: "6px", background: COLORS.bg, borderRadius: "3px", overflow: "hidden" }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        {routine.map((day, dayIdx) => (
          <Card key={day.day} style={{
            borderTop: `3px solid ${dayColors[dayIdx % dayColors.length]}`,
          }}>
            <h4 style={{
              fontSize: "13px", fontWeight: 700, color: dayColors[dayIdx % dayColors.length],
              fontFamily: "'Space Mono', monospace", marginBottom: "12px",
              textTransform: "uppercase", letterSpacing: "0.04em",
            }}>
              {day.day}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {day.tasks.map((task, taskIdx) => (
                <div
                  key={taskIdx}
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
                    fontSize: "12px", color: task.done ? COLORS.textDim : COLORS.text,
                    textDecoration: task.done ? "line-through" : "none",
                    lineHeight: 1.4, flex: 1, transition: "all 0.2s",
                  }}>
                    {task.text}
                  </span>
                  <button
                    onClick={() => removeTask(dayIdx, taskIdx)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "0", opacity: 0.3, flexShrink: 0 }}
                    onMouseEnter={e => { e.target.style.opacity = 1; }}
                    onMouseLeave={e => { e.target.style.opacity = 0.3; }}
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
                  onChange={e => setNewTask(e.target.value)}
                  placeholder="Nouvelle tâche..."
                  onKeyDown={e => e.key === "Enter" && addTask(dayIdx)}
                  autoFocus
                  style={{ fontSize: "12px", padding: "6px 8px" }}
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
                onMouseEnter={e => { e.target.style.borderColor = COLORS.accent; e.target.style.color = COLORS.accent; }}
                onMouseLeave={e => { e.target.style.borderColor = COLORS.border; e.target.style.color = COLORS.textDim; }}
              >
                + Ajouter
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── MAIN APP ───
const MODULES = [
  { key: "canvas", label: "Lean Canvas", icon: Icons.Canvas, component: LeanCanvas },
  { key: "ideas", label: "Idées", icon: Icons.Ideas, component: IdeaBoard },
  { key: "crm", label: "Contacts", icon: Icons.CRM, component: CRMModule },
  { key: "roadmap", label: "Roadmap", icon: Icons.Roadmap, component: RoadmapModule },
  { key: "routine", label: "Routine", icon: Icons.Routine, component: RoutineModule },
];

export default function FounderOS() {
  const [active, setActive] = useState("canvas");
  const ActiveModule = MODULES.find(m => m.key === active)?.component || LeanCanvas;

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg, color: COLORS.text,
      fontFamily: "'DM Sans', sans-serif", display: "flex",
    }}>
      <style>{globalCSS}</style>

      {/* Sidebar */}
      <nav style={{
        width: "220px", background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`,
        padding: "20px 12px", display: "flex", flexDirection: "column", flexShrink: 0,
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ marginBottom: "32px", padding: "0 8px" }}>
          <h1 style={{
            fontSize: "18px", fontWeight: 700, fontFamily: "'Space Mono', monospace",
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            FounderOS
          </h1>
          <p style={{ fontSize: "10px", color: COLORS.textDim, marginTop: "4px", fontFamily: "'Space Mono', monospace" }}>
            Tableau de bord fondateur
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {MODULES.map(mod => {
            const isActive = active === mod.key;
            const Icon = mod.icon;
            return (
              <button
                key={mod.key}
                onClick={() => setActive(mod.key)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "8px", border: "none",
                  cursor: "pointer", width: "100%", textAlign: "left",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? `${COLORS.accent}15` : "transparent",
                  color: isActive ? COLORS.accentLight : COLORS.textMuted,
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = COLORS.surfaceHover; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon />
                {mod.label}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: "auto", padding: "12px 8px", borderTop: `1px solid ${COLORS.border}` }}>
          <p style={{ fontSize: "10px", color: COLORS.textDim, lineHeight: 1.5, fontFamily: "'Space Mono', monospace" }}>
            Les données sont sauvegardées localement dans ton navigateur.
          </p>
        </div>
      </nav>

      {/* Main content */}
      <main style={{
        flex: 1, padding: "28px 32px", overflowY: "auto", maxHeight: "100vh",
      }}>
        <ActiveModule />
      </main>
    </div>
  );
}
