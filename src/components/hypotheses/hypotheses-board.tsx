'use client';

import { useState } from 'react';
import { useFounderStore, Hypothesis, HypothesisStatus } from '@/store/founder-store';
import { HypothesisColumn } from './hypothesis-column';
import { HypothesisDialog } from './create-hypothesis-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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

const COLUMN_COLORS: Record<HypothesisStatus, string> = {
    draft: COLORS.textMuted,
    testing: COLORS.warning,
    validated: COLORS.success,
    invalidated: COLORS.danger,
    pivoted: COLORS.accent,
}

const columns: { id: HypothesisStatus; title: string }[] = [
    { id: 'draft', title: 'Draft' },
    { id: 'testing', title: 'In Testing' },
    { id: 'validated', title: 'Validated' },
    { id: 'invalidated', title: 'Invalidated' },
    { id: 'pivoted', title: 'Pivoted' },
];

export function HypothesesBoard() {
    const { hypotheses, addHypothesis } = useFounderStore();
    const [editingHypothesis, setEditingHypothesis] = useState<Hypothesis | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        statement: '',
        category: 'problem',
        riskLevel: 'medium',
        testMethod: '',
        successCriteria: ''
    });

    const handleEdit = (hypothesis: Hypothesis) => {
        setEditingHypothesis(hypothesis);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        if (!formData.statement) return;

        addHypothesis({
            statement: formData.statement,
            category: formData.category as any,
            riskLevel: formData.riskLevel as any,
            testMethod: formData.testMethod,
            successCriteria: formData.successCriteria,
            status: 'draft',
        });

        setFormData({
            statement: '',
            category: 'problem',
            riskLevel: 'medium',
            testMethod: '',
            successCriteria: ''
        });
        setShowForm(false);
    };

    const handleDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setTimeout(() => setEditingHypothesis(null), 300);
        }
    };

    const inputStyle = {
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "8px",
        padding: "8px 12px",
        color: COLORS.text,
        fontSize: "13px",
        fontFamily: "'DM Sans', sans-serif",
        outline: "none",
        width: "100%",
    };

    return (
        <div className="flex flex-col h-full bg-background/50 text-foreground font-sans">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#e8e9ed]">Hypotheses</h2>
                    <p className="text-[#8b8fa3]">
                        Validate your risky assumptions.
                    </p>
                </div>
                <div
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-[6px] border-none rounded-[8px] cursor-pointer font-medium transition-all duration-200 text-[13px] px-[16px] py-[8px] bg-[#6c5ce7] text-white hover:opacity-85"
                >
                    <Plus className="h-4 w-4" /> New Hypothesis
                </div>
            </div>

            {showForm && (
                <div
                    className="mb-6 p-4 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-300"
                    style={{
                        backgroundColor: COLORS.surface,
                        borderColor: `${COLORS.accent}33`,
                    }}
                >
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2">
                            <input
                                style={{
                                    ...inputStyle,
                                    borderColor: COLORS.accent
                                }}
                                placeholder="Hypothesis Statement *"
                                value={formData.statement}
                                onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <select
                            style={inputStyle}
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="problem">Problem</option>
                            <option value="solution">Solution</option>
                            <option value="channel">Channel</option>
                            <option value="revenue">Revenue</option>
                            <option value="segment">Segment</option>
                        </select>
                        <select
                            style={inputStyle}
                            value={formData.riskLevel}
                            onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                        >
                            <option value="critical">Critical Risk</option>
                            <option value="high">High Risk</option>
                            <option value="medium">Medium Risk</option>
                            <option value="low">Low Risk</option>
                        </select>
                        <input
                            style={inputStyle}
                            placeholder="Test Method (e.g. Interview)"
                            value={formData.testMethod}
                            onChange={(e) => setFormData({ ...formData, testMethod: e.target.value })}
                        />
                        <input
                            style={inputStyle}
                            placeholder="Success Criteria (e.g. > 10%)"
                            value={formData.successCriteria}
                            onChange={(e) => setFormData({ ...formData, successCriteria: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setShowForm(false)}
                            className="text-[#8b8fa3] hover:text-[#e8e9ed] hover:bg-[#282c3a]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="bg-[#6c5ce7] hover:bg-[#5b4cc4] text-white"
                        >
                            Add Hypothesis
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex gap-4 flex-1 min-h-0">
                {columns.map((col) => (
                    <div key={col.id} className="flex-1 flex flex-col min-w-0" style={{ minWidth: '200px' }}>
                        <div
                            className="flex items-center gap-2 mb-3 px-3 py-2 border backdrop-blur-sm"
                            style={{
                                borderRadius: '8px', // Explicit 8px for roadmap match
                                backgroundColor: `${COLUMN_COLORS[col.id]}11`,
                                borderColor: `${COLUMN_COLORS[col.id]}22`,
                            }}
                        >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLUMN_COLORS[col.id] }} />
                            <span className="text-[13px] font-semibold tracking-tight" style={{ color: COLUMN_COLORS[col.id], fontFamily: 'monospace' }}>
                                {col.title}
                            </span>
                            <span className="ml-auto text-[11px] text-muted-foreground">
                                {hypotheses.filter((h) => h.status === col.id).length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                            {hypotheses
                                .filter((h) => h.status === col.id)
                                .map((hypothesis) => (
                                    <HypothesisColumn
                                        key={hypothesis.id}
                                        column={col}
                                        hypotheses={[hypothesis]} // Passing single hypothesis to reuse structure if simpler, or refactor Column to be just wrapper
                                        onEdit={handleEdit}
                                        color={COLUMN_COLORS[col.id]}
                                    />
                                ))}
                        </div>
                    </div>
                ))}
            </div>

            <HypothesisDialog
                key={editingHypothesis?.id || 'new'} // Refresh dialog on ID change to avoid stale state
                open={isDialogOpen}
                onOpenChange={handleDialogOpenChange}
                hypothesisToEdit={editingHypothesis}
            />
        </div>
    );
}
