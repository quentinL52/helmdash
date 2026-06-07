'use client';

import { useState, useMemo } from 'react';
import { useFounderStore, Hypothesis, HypothesisCategory, HypothesisRisk } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { COLORS } from '@/lib/constants';

// --- INLINE ICONS ---
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
    ArrowRight: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
    ),
    Check: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    ),
    X: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
    ),
    Rotate: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
    ),
    ChevronRight: () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
    ),
    Beaker: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 3h15" /><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" /><path d="M6 14h12" /></svg>
    ),
    BarChart: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
    ),
    Lightbulb: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></svg>
    ),
    Archive: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>
    ),
};

// --- REUSABLE COMPONENTS (same pattern as roadmap) ---
const Btn = ({ children, onClick, variant = "default", size = "md", disabled = false, style }: any) => {
    const base: React.CSSProperties = {
        display: "inline-flex", alignItems: "center", gap: "5px",
        border: "none", borderRadius: "8px", cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
        transition: "all 0.2s ease", opacity: disabled ? 0.4 : 1,
        fontSize: size === "sm" ? "11px" : size === "xs" ? "10px" : "13px",
        padding: size === "sm" ? "5px 10px" : size === "xs" ? "4px 8px" : "8px 16px",
    };
    const variants: Record<string, React.CSSProperties> = {
        default: { background: COLORS.surfaceHover, color: COLORS.text, border: `1px solid ${COLORS.border}` },
        primary: { background: COLORS.accent, color: "#fff", border: "none" },
        success: { background: "#00cec9", color: "#000", border: "none" },
        danger: { background: "#ff6b6b", color: "#fff", border: "none" },
        warning: { background: "#fdcb6e", color: "#000", border: "none" },
        blue: { background: "#0984e3", color: "#fff", border: "none" },
    };
    return (
        <button
            onClick={disabled ? undefined : onClick}
            style={{ ...base, ...variants[variant], ...style }}
            onMouseEnter={(e: any) => { if (!disabled) e.target.style.opacity = "0.85"; }}
            onMouseLeave={(e: any) => { e.target.style.opacity = disabled ? "0.4" : "1"; }}
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

const Badge = ({ children, color = COLORS.accent, style }: any) => (
    <span style={{
        display: "inline-flex", alignItems: "center", gap: "4px",
        padding: "2px 8px", borderRadius: "4px", fontSize: "10px",
        fontWeight: 600, background: `${color}22`, color, letterSpacing: "0.02em", ...style,
    }}>
        {children}
    </span>
);

const Card = ({ children, style, borderColor }: any) => (
    <div style={{
        background: COLORS.surface, border: `1px solid ${borderColor || COLORS.border}`,
        borderRadius: "12px", padding: "12px", ...style,
    }}>
        {children}
    </div>
);

// --- HELPERS ---
const RISK_COLORS: Record<string, string> = {
    low: "#00b894", medium: "#fdcb6e", high: "#e17055", critical: "#ff6b6b",
};

const EMPTY_FORM = {
    statement: "", category: "problem", riskLevel: "medium",
    testMethod: "", successCriteria: "", measureNotes: "", learnings: "",
};

// ==========================================================
// === MAIN BOARD (flat, same pattern as roadmap)          ===
// ==========================================================
export function HypothesesBoard() {
    const hypotheses = useFounderStore(s => s.hypotheses);
    const addHypothesis = useFounderStore(s => s.addHypothesis);
    const updateHypothesis = useFounderStore(s => s.updateHypothesis);
    const deleteHypothesis = useFounderStore(s => s.deleteHypothesis);
    const language = useFounderStore(s => s.language);
    const t = translations[language].hypotheses;
    const common = translations[language].common;

    // --- Local state only (exactly like roadmap) ---
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [showResults, setShowResults] = useState(false);

    // Categorize
    const drafts = useMemo(() => hypotheses.filter(h => h.status === 'draft'), [hypotheses]);
    const buildPhase = useMemo(() => hypotheses.filter(h => h.status === 'testing' && !h.actualResult), [hypotheses]);
    const measurePhase = useMemo(() => hypotheses.filter(h => h.status === 'testing' && h.actualResult === 'measuring'), [hypotheses]);
    const learnPhase = useMemo(() => hypotheses.filter(h => h.status === 'testing' && h.actualResult === 'learning'), [hypotheses]);
    const validated = useMemo(() => hypotheses.filter(h => h.status === 'validated'), [hypotheses]);
    const invalidated = useMemo(() => hypotheses.filter(h => h.status === 'invalidated'), [hypotheses]);

    // --- Actions (like roadmap: edit / add / cancel) ---
    const edit = (h: Hypothesis) => {
        setForm({
            statement: h.statement,
            category: h.category,
            riskLevel: h.riskLevel,
            testMethod: h.testMethod,
            successCriteria: h.successCriteria,
            measureNotes: h.measureNotes || '',
            learnings: h.learnings || '',
        });
        setEditingId(h.id);
        setShowForm(true);
    };

    const save = () => {
        if (!form.statement.trim()) return;
        if (editingId) {
            updateHypothesis(editingId, {
                statement: form.statement,
                category: form.category as HypothesisCategory,
                riskLevel: form.riskLevel as HypothesisRisk,
                testMethod: form.testMethod,
                successCriteria: form.successCriteria,
                measureNotes: form.measureNotes,
                learnings: form.learnings,
            });
            setEditingId(null);
        } else {
            addHypothesis({
                statement: form.statement,
                category: form.category as HypothesisCategory,
                riskLevel: form.riskLevel as HypothesisRisk,
                testMethod: form.testMethod,
                successCriteria: form.successCriteria,
                status: 'draft',
            });
        }
        setForm(EMPTY_FORM);
        setShowForm(false);
    };

    const cancel = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setShowForm(false);
    };

    const moveToBuild = (id: string) => updateHypothesis(id, { status: 'testing', actualResult: undefined });
    const moveToMeasure = (id: string) => updateHypothesis(id, { actualResult: 'measuring' });
    const moveToLearn = (id: string) => updateHypothesis(id, { actualResult: 'learning' });
    const doValidate = (id: string) => updateHypothesis(id, { status: 'validated', actualResult: 'done' });
    const doInvalidate = (id: string) => updateHypothesis(id, { status: 'invalidated', actualResult: 'done' });
    const doPivot = (h: Hypothesis) => {
        updateHypothesis(h.id, { status: 'pivoted', actualResult: 'done' });
        addHypothesis({
            statement: h.statement, category: h.category, riskLevel: h.riskLevel,
            testMethod: '', successCriteria: '', status: 'draft', pivotedFromId: h.id,
        });
    };
    const remove = (id: string) => deleteHypothesis(id);

    // Select style
    const selectStyle: React.CSSProperties = {
        background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "8px",
        padding: "8px 12px", color: COLORS.text, fontSize: "13px",
        fontFamily: "'DM Sans', sans-serif", outline: "none",
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

            {/* ====== EDIT FORM (exactly like roadmap) ====== */}
            {showForm && (
                <Card className="scale-in" borderColor={`${COLORS.accent}33`} style={{ marginBottom: "16px", flexShrink: 0 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <TextArea
                                value={form.statement}
                                onChange={(e: any) => setForm({ ...form, statement: e.target.value })}
                                placeholder={`${t.form.statement} *`}
                                autoFocus
                                style={{ minHeight: "50px" }}
                            />
                        </div>
                        <select value={form.category} onChange={(e: any) => setForm({ ...form, category: e.target.value })} style={selectStyle}>
                            <option value="problem">{t.categories.problem}</option>
                            <option value="solution">{t.categories.solution}</option>
                            <option value="channel">{t.categories.channel}</option>
                            <option value="revenue">{t.categories.revenue}</option>
                            <option value="segment">{t.categories.segment}</option>
                        </select>
                        <select value={form.riskLevel} onChange={(e: any) => setForm({ ...form, riskLevel: e.target.value })} style={selectStyle}>
                            <option value="critical">{t.risks.critical}</option>
                            <option value="high">{t.risks.high}</option>
                            <option value="medium">{t.risks.medium}</option>
                            <option value="low">{t.risks.low}</option>
                        </select>
                        <Input value={form.testMethod} onChange={(e: any) => setForm({ ...form, testMethod: e.target.value })} placeholder={t.form.method} />
                        <Input value={form.successCriteria} onChange={(e: any) => setForm({ ...form, successCriteria: e.target.value })} placeholder={t.form.criteria} />
                        <div style={{ gridColumn: "1 / -1" }}>
                            <TextArea
                                value={form.measureNotes}
                                onChange={(e: any) => setForm({ ...form, measureNotes: e.target.value })}
                                placeholder={t.bml.measurePlaceholder}
                                style={{ minHeight: "50px" }}
                            />
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <TextArea
                                value={form.learnings}
                                onChange={(e: any) => setForm({ ...form, learnings: e.target.value })}
                                placeholder={t.bml.learningsPlaceholder}
                                style={{ minHeight: "50px" }}
                            />
                        </div>
                        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <Btn onClick={cancel}>{common.cancel}</Btn>
                            <Btn variant="primary" onClick={save}>{editingId ? common.save : common.add}</Btn>
                        </div>
                    </div>
                </Card>
            )}

            {/* ====== DRAFT POOL ====== */}
            <div style={{ marginBottom: "20px", flexShrink: 0 }}>
                <div style={{ background: `${COLORS.textMuted}06`, border: `1px solid ${COLORS.border}`, borderRadius: "12px", padding: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <Icons.Archive />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: COLORS.textMuted }}>{t.bml.draftPool}</span>
                        <span style={{ fontSize: "11px", color: COLORS.textDim }}>{drafts.length}</span>
                        <div style={{ marginLeft: "auto" }}>
                            <Btn variant="primary" size="sm" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(EMPTY_FORM); }}>
                                <Icons.Plus /> {t.new}
                            </Btn>
                        </div>
                    </div>

                    {/* Draft list */}
                    <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                        {drafts.map(h => (
                            <div key={h.id} style={{
                                display: "flex", alignItems: "center", gap: "10px",
                                padding: "6px 10px", borderRadius: "8px",
                                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                            }}>
                                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: RISK_COLORS[h.riskLevel], flexShrink: 0 }} />
                                <p style={{ flex: 1, fontSize: "13px", color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.statement}</p>
                                <Badge color={RISK_COLORS[h.riskLevel]}>{t.risks[h.riskLevel]}</Badge>
                                {h.pivotedFromId && <Badge color={COLORS.accent}><Icons.Rotate /> {t.bml.fromPivot}</Badge>}
                                <button onClick={() => edit(h)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "2px", flexShrink: 0 }}>
                                    <Icons.Edit />
                                </button>
                                <button onClick={() => remove(h.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "2px", flexShrink: 0 }}>
                                    <Icons.Trash />
                                </button>
                                <Btn variant="blue" size="xs" onClick={() => moveToBuild(h.id)}>
                                    <Icons.ArrowRight /> Build
                                </Btn>
                            </div>
                        ))}
                        {drafts.length === 0 && (
                            <p style={{ fontSize: "12px", color: COLORS.textDim, textAlign: "center", padding: "16px 0" }}>{t.bml.draftPoolDesc}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ====== BML COLUMNS ====== */}
            <div style={{ display: "flex", gap: "16px", flex: 1, overflowX: "auto", minHeight: 0 }}>

                {/* --- BUILD --- */}
                <div style={{ flex: 1, minWidth: "260px", display: "flex", flexDirection: "column" }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px",
                        padding: "8px 12px", background: "#0984e311", borderRadius: "10px",
                        border: "1px solid #0984e322", flexShrink: 0,
                    }}>
                        <Icons.Beaker />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#0984e3", fontFamily: "'Space Mono', monospace" }}>BUILD</span>
                        <span style={{ fontSize: "11px", color: COLORS.textDim, marginLeft: "auto" }}>{buildPhase.length}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", flex: 1, paddingBottom: "8px" }}>
                        {buildPhase.map(h => {
                            const isComplete = h.testMethod && h.successCriteria;
                            return (
                                <Card key={h.id} borderColor="#0984e333">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                                        <p style={{ fontSize: "13px", fontWeight: 600, color: COLORS.text, flex: 1 }}>{h.statement}</p>
                                        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                                            <button onClick={() => edit(h)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "2px" }}>
                                                <Icons.Edit />
                                            </button>
                                            <button onClick={() => remove(h.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "2px" }}>
                                                <Icons.Trash />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: "8px", fontSize: "11px", color: COLORS.textDim }}>
                                        <div><span style={{ textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginRight: "6px" }}>{t.bml.method}:</span><span style={{ color: COLORS.textMuted }}>{h.testMethod || '—'}</span></div>
                                        <div style={{ marginTop: "2px" }}><span style={{ textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginRight: "6px" }}>{t.bml.criteria}:</span><span style={{ color: COLORS.textMuted }}>{h.successCriteria || '—'}</span></div>
                                    </div>
                                    <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "10px", borderTop: `1px solid ${COLORS.border}`, paddingTop: "8px", flexWrap: "wrap" }}>
                                        <Badge color={RISK_COLORS[h.riskLevel]}>{t.risks[h.riskLevel]}</Badge>
                                        <Badge color={COLORS.textMuted}>{t.categories[h.category]}</Badge>
                                        <div style={{ marginLeft: "auto" }}>
                                            <Btn variant={isComplete ? "warning" : "default"} size="xs" disabled={!isComplete} onClick={() => moveToMeasure(h.id)}>
                                                <Icons.ArrowRight /> Measure
                                            </Btn>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                        {buildPhase.length === 0 && (
                            <p style={{ fontSize: "12px", color: COLORS.textDim, textAlign: "center", padding: "32px 0" }}>{t.bml.buildDesc}</p>
                        )}
                    </div>
                </div>

                {/* --- MEASURE --- */}
                <div style={{ flex: 1, minWidth: "260px", display: "flex", flexDirection: "column" }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px",
                        padding: "8px 12px", background: "#fdcb6e11", borderRadius: "10px",
                        border: "1px solid #fdcb6e22", flexShrink: 0,
                    }}>
                        <Icons.BarChart />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#fdcb6e", fontFamily: "'Space Mono', monospace" }}>MEASURE</span>
                        <span style={{ fontSize: "11px", color: COLORS.textDim, marginLeft: "auto" }}>{measurePhase.length}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", flex: 1, paddingBottom: "8px" }}>
                        {measurePhase.map(h => (
                            <Card key={h.id} borderColor="#fdcb6e33">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                                    <p style={{ fontSize: "13px", fontWeight: 600, color: COLORS.text, flex: 1 }}>{h.statement}</p>
                                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                                        <button onClick={() => edit(h)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "2px" }}>
                                            <Icons.Edit />
                                        </button>
                                        <button onClick={() => remove(h.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "2px" }}>
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ marginTop: "6px", fontSize: "11px", color: COLORS.textDim }}>
                                    <span style={{ textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{t.bml.method}:</span> <span style={{ color: COLORS.textMuted }}>{h.testMethod}</span>
                                </div>
                                {h.measureNotes && (
                                    <div style={{ marginTop: "6px", background: "#fdcb6e08", border: "1px solid #fdcb6e11", borderRadius: "8px", padding: "6px 8px" }}>
                                        <p style={{ fontSize: "11px", color: COLORS.textMuted, lineHeight: 1.4 }}>{h.measureNotes}</p>
                                    </div>
                                )}
                                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "8px", borderTop: `1px solid ${COLORS.border}`, paddingTop: "8px" }}>
                                    <Badge color={RISK_COLORS[h.riskLevel]}>{t.risks[h.riskLevel]}</Badge>
                                    <div style={{ marginLeft: "auto" }}>
                                        <Btn variant="success" size="xs" onClick={() => moveToLearn(h.id)}>
                                            <Icons.ArrowRight /> Learn
                                        </Btn>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {measurePhase.length === 0 && (
                            <p style={{ fontSize: "12px", color: COLORS.textDim, textAlign: "center", padding: "32px 0" }}>{t.bml.measureDesc}</p>
                        )}
                    </div>
                </div>

                {/* --- LEARN --- */}
                <div style={{ flex: 1, minWidth: "260px", display: "flex", flexDirection: "column" }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px",
                        padding: "8px 12px", background: "#00cec911", borderRadius: "10px",
                        border: "1px solid #00cec922", flexShrink: 0,
                    }}>
                        <Icons.Lightbulb />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#00cec9", fontFamily: "'Space Mono', monospace" }}>LEARN</span>
                        <span style={{ fontSize: "11px", color: COLORS.textDim, marginLeft: "auto" }}>{learnPhase.length}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", flex: 1, paddingBottom: "8px" }}>
                        {learnPhase.map(h => (
                            <Card key={h.id} borderColor="#00cec933">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                                    <p style={{ fontSize: "13px", fontWeight: 600, color: COLORS.text, flex: 1 }}>{h.statement}</p>
                                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                                        <button onClick={() => edit(h)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "2px" }}>
                                            <Icons.Edit />
                                        </button>
                                        <button onClick={() => remove(h.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, padding: "2px" }}>
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                </div>
                                {h.measureNotes && (
                                    <div style={{ marginTop: "6px", background: "#fdcb6e08", border: "1px solid #fdcb6e11", borderRadius: "8px", padding: "6px 8px" }}>
                                        <span style={{ fontSize: "10px", fontWeight: 600, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.05em" }}>Measure</span>
                                        <p style={{ fontSize: "11px", color: COLORS.textMuted, marginTop: "2px" }}>{h.measureNotes}</p>
                                    </div>
                                )}
                                {h.learnings && (
                                    <div style={{ marginTop: "6px", background: "#00cec908", border: "1px solid #00cec911", borderRadius: "8px", padding: "6px 8px" }}>
                                        <span style={{ fontSize: "10px", fontWeight: 600, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.05em" }}>Learnings</span>
                                        <p style={{ fontSize: "11px", color: COLORS.textMuted, marginTop: "2px" }}>{h.learnings}</p>
                                    </div>
                                )}
                                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "8px", borderTop: `1px solid ${COLORS.border}`, paddingTop: "8px", flexWrap: "wrap" }}>
                                    <Badge color={RISK_COLORS[h.riskLevel]}>{t.risks[h.riskLevel]}</Badge>
                                    <div style={{ marginLeft: "auto", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                        <Btn variant="success" size="xs" onClick={() => doValidate(h.id)}>
                                            <Icons.Check /> {t.bml.validate}
                                        </Btn>
                                        <Btn variant="danger" size="xs" onClick={() => doInvalidate(h.id)}>
                                            <Icons.X /> {t.bml.invalidate}
                                        </Btn>
                                        <Btn variant="primary" size="xs" onClick={() => doPivot(h)}>
                                            <Icons.Rotate /> {t.bml.pivot}
                                        </Btn>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {learnPhase.length === 0 && (
                            <p style={{ fontSize: "12px", color: COLORS.textDim, textAlign: "center", padding: "32px 0" }}>{t.bml.learnDesc}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ====== RESULTS (collapsible) ====== */}
            {(validated.length > 0 || invalidated.length > 0) && (
                <div style={{ marginTop: "20px", flexShrink: 0 }}>
                    <button
                        onClick={() => setShowResults(!showResults)}
                        style={{
                            background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted,
                            display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 500,
                            fontFamily: "'DM Sans', sans-serif", padding: "4px 0", marginBottom: "10px",
                        }}
                    >
                        <span style={{ transform: showResults ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-flex" }}>
                            <Icons.ChevronRight />
                        </span>
                        {t.bml.validated} ({validated.length}) / {t.bml.invalidated} ({invalidated.length})
                    </button>
                    {showResults && (
                        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00cec9" }} />
                                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#00cec9" }}>{t.bml.validated}</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {validated.map(h => (
                                        <div key={h.id} style={{ background: COLORS.surface, border: "1px solid #00cec922", borderRadius: "8px", padding: "8px 10px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00cec9" }} />
                                                <p style={{ fontSize: "12px", fontWeight: 500, color: COLORS.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.statement}</p>
                                                <Badge color="#00cec9" style={{ fontSize: "9px" }}>{t.categories[h.category]}</Badge>
                                            </div>
                                            {h.learnings && <p style={{ fontSize: "11px", color: COLORS.textMuted, marginTop: "4px", paddingLeft: "11px" }}>{h.learnings}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ff6b6b" }} />
                                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#ff6b6b" }}>{t.bml.invalidated}</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {invalidated.map(h => (
                                        <div key={h.id} style={{ background: COLORS.surface, border: "1px solid #ff6b6b22", borderRadius: "8px", padding: "8px 10px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ff6b6b" }} />
                                                <p style={{ fontSize: "12px", fontWeight: 500, color: COLORS.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.statement}</p>
                                                <Badge color="#ff6b6b" style={{ fontSize: "9px" }}>{t.categories[h.category]}</Badge>
                                            </div>
                                            {h.learnings && <p style={{ fontSize: "11px", color: COLORS.textMuted, marginTop: "4px", paddingLeft: "11px" }}>{h.learnings}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
