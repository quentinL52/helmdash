'use client';

import { useState } from "react";

// --- STORAGE HELPERS ---
const loadState = (key: string, fallback: any) => {
  try {
    if (typeof window === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
};
const saveState = (key: string, val: any) => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(val));
  } catch { }
};

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
  accent: "hsl(var(--primary))",
};

const POST_IT_COLORS = [
  { bg: "#ffeaa7", text: "#2d3436", label: "Jaune" },
  { bg: "#fab1a0", text: "#2d3436", label: "Corail" },
  { bg: "#81ecec", text: "#2d3436", label: "Cyan" },
  { bg: "#a29bfe", text: "#2d3436", label: "Violet" },
  { bg: "#55efc4", text: "#2d3436", label: "Vert" },
  { bg: "#fd79a8", text: "#2d3436", label: "Rose" },
];

const animationCSS = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .fade-in { animation: fadeIn 0.3s ease both; }
  .scale-in { animation: scaleIn 0.25s ease both; }
`;

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
    primary: { background: "hsl(var(--primary))", color: "#fff", border: "none" },
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
      minHeight: "60px", transition: "border-color 0.2s", ...style,
    }}
    onFocus={(e: any) => { e.target.style.borderColor = COLORS.accent; }}
    onBlur={(e: any) => { e.target.style.borderColor = COLORS.border; }}
    {...props}
  />
);

const Card = ({ children, style, className = "" }: any) => (
  <div className={className} style={{
    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
    borderRadius: "12px", padding: "16px", ...style,
  }}>
    {children}
  </div>
);


// --- WHITEBOARD PAGE ---
export default function WhiteboardPage() {
  const [ideas, setIdeas] = useState(() => loadState("ideas", []));
  const [showForm, setShowForm] = useState(false);
  const [newIdea, setNewIdea] = useState({ text: "", color: 0, category: "" });
  const [filter, setFilter] = useState("all");

  const save = (next: any) => { setIdeas(next); saveState("ideas", next); };

  const addIdea = () => {
    if (!newIdea.text.trim()) return;
    save([...ideas, {
      id: Date.now(), text: newIdea.text, color: newIdea.color,
      category: newIdea.category || "Général", date: new Date().toLocaleDateString("fr-FR"),
    }]);
    setNewIdea({ text: "", color: 0, category: "" });
    setShowForm(false);
  };

  const removeIdea = (id: any) => save(ideas.filter((i: any) => i.id !== id));

  const categories: string[] = ["all", ...Array.from(new Set<string>(ideas.map((i: any) => i.category || "Général")))];
  const filtered = filter === "all" ? ideas : ideas.filter((i: any) => i.category === filter);

  return (
    <div className="fade-in" style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
      <style>{animationCSS}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
          Tableau Blanc
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
              onChange={(e: any) => setNewIdea({ ...newIdea, text: e.target.value })}
              placeholder="Décris ton idée..."
              autoFocus
            />
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <Input
                value={newIdea.category}
                onChange={(e: any) => setNewIdea({ ...newIdea, category: e.target.value })}
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
        {(filtered as any[]).map((idea, idx) => {
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
              onMouseEnter={(e: any) => { e.currentTarget.style.transform = "rotate(0deg) scale(1.03)"; e.currentTarget.style.boxShadow = "4px 6px 16px rgba(0,0,0,0.25)"; }}
              onMouseLeave={(e: any) => { e.currentTarget.style.transform = `rotate(${(idx % 5 - 2) * 0.8}deg)`; e.currentTarget.style.boxShadow = "2px 3px 8px rgba(0,0,0,0.15)"; }}
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
                  onMouseEnter={(e: any) => { e.target.style.opacity = 1; }}
                  onMouseLeave={(e: any) => { e.target.style.opacity = 0.4; }}
                >
                  <Icons.Trash />
                </button>
              </div>
            </div>
          );
        })}

        {(filtered as any[]).length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: COLORS.textDim }}>
            <p style={{ fontSize: "14px" }}>Aucune idée pour le moment</p>
            <p style={{ fontSize: "12px", marginTop: "4px" }}>Clique sur "Nouvelle idée" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}
