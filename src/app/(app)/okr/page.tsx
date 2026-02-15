'use client';

import { useState } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { OkrCard } from '@/components/okr/okr-card';
import { Plus, Target, TrendingUp, AlertCircle } from 'lucide-react';

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

// --- REUSABLE COMPONENTS (Matching Roadmap) ---
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
        outline: { background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}` },
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

const Card = ({ children, style, className = "" }: any) => (
    <div className={className} style={{
        background: COLORS.surface, border: `1px solid ${COLORS.border}`,
        borderRadius: "12px", padding: "12px", ...style,
    }}>
        {children}
    </div>
);

const Select = ({ value, onChange, options, style }: any) => (
    <select
        value={value}
        onChange={onChange}
        style={{
            background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "8px",
            padding: "8px 12px", color: COLORS.text, fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif", outline: "none",
            transition: "border-color 0.2s", ...style,
        }}
        onFocus={(e: any) => { e.target.style.borderColor = COLORS.accent; }}
        onBlur={(e: any) => { e.target.style.borderColor = COLORS.border; }}
    >
        {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
    </select>
);

export default function OkrPage() {
    const objectives = useFounderStore(s => s.objectives);
    const addObjective = useFounderStore(s => s.addObjective);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newQuarter, setNewQuarter] = useState('Q1 2026');

    const handleAddObjective = () => {
        if (!newTitle.trim()) return;
        addObjective({
            title: newTitle,
            status: 'on-track',
            quarter: newQuarter
        });
        setNewTitle('');
        setShowForm(false);
    };

    // Calculate overall stats
    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter(o => o.progress >= 100).length;
    const avgProgress = totalObjectives > 0
        ? Math.round(objectives.reduce((acc, o) => acc + o.progress, 0) / totalObjectives)
        : 0;

    const animationCSS = `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .fade-in { animation: fadeIn 0.3s ease both; }
        .scale-in { animation: scaleIn 0.25s ease both; }
    `;

    return (
        <div className="fade-in" style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.text, height: "100%", display: "flex", flexDirection: "column", padding: "24px 32px 32px" }}>
            <style>{animationCSS}</style>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexShrink: 0 }}>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">OKRs & Goals</h1>
                    <p style={{ color: COLORS.textMuted, marginTop: "4px" }}>Align your daily execution with your long-term North Star.</p>
                </div>
                <Button variant="primary" onClick={() => setShowForm(!showForm)}>
                    <Plus style={{ width: 16, height: 16 }} /> New Objective
                </Button>
            </div>

            {/* Inline Add Form */}
            {showForm && (
                <Card className="scale-in" style={{ marginBottom: "20px", border: `1px solid ${COLORS.accent}33`, flexShrink: 0 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "10px", alignItems: "center" }}>
                        <Input
                            value={newTitle}
                            onChange={(e: any) => setNewTitle(e.target.value)}
                            placeholder="Objective Statement (e.g. Achieve Product-Market Fit)"
                            autoFocus
                        />
                        <Select
                            value={newQuarter}
                            onChange={(e: any) => setNewQuarter(e.target.value)}
                            options={[
                                { value: "Q4 2025", label: "Q4 2025" },
                                { value: "Q1 2026", label: "Q1 2026" },
                                { value: "Q2 2026", label: "Q2 2026" },
                                { value: "Q3 2026", label: "Q3 2026" },
                            ]}
                        />
                        <div style={{ display: "flex", gap: "8px" }}>
                            <Button onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleAddObjective}>Create</Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card style={{ background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${COLORS.surfaceHover} 100%)` }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p style={{ color: COLORS.textMuted, fontSize: "13px", fontWeight: 500 }}>Active Objectives</p>
                            <h3 className="text-2xl font-bold mt-1">{totalObjectives}</h3>
                        </div>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${COLORS.accent}22`, color: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Target className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
                <Card style={{ background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${COLORS.surfaceHover} 100%)` }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p style={{ color: COLORS.textMuted, fontSize: "13px", fontWeight: 500 }}>Overall Progress</p>
                            <h3 className="text-2xl font-bold mt-1">{avgProgress}%</h3>
                        </div>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${COLORS.warning}22`, color: COLORS.warning, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
                <Card style={{ background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${COLORS.surfaceHover} 100%)` }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p style={{ color: COLORS.textMuted, fontSize: "13px", fontWeight: 500 }}>Completed</p>
                            <h3 className="text-2xl font-bold mt-1">{completedObjectives}</h3>
                        </div>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${COLORS.success}22`, color: COLORS.success, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Objectives List */}
            {objectives.length === 0 ? (
                <div className="text-center py-20 rounded-xl" style={{ border: `1px dashed ${COLORS.border}`, background: `${COLORS.surface}44` }}>
                    <Target className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.textDim }} />
                    <h3 className="text-lg font-medium">No Objectives Set</h3>
                    <p style={{ color: COLORS.textMuted, marginTop: "8px", marginBottom: "24px" }}>Start by defining what success looks like for this quarter.</p>
                    <Button variant="outline" onClick={() => setShowForm(true)}>Set First Objective</Button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {objectives.map((obj) => (
                        <OkrCard key={obj.id} objective={obj} />
                    ))}
                </div>
            )}
        </div>
    );
}
