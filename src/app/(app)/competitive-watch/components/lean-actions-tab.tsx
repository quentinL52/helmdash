'use client';

import { useState, useMemo } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
    Brain,
    Loader2,
    Shield,
    AlertTriangle,
    Lightbulb,
    Target,
    Swords,
    Plus,
    Zap,
    Sparkles,
    MoreHorizontal,
    LayoutDashboard,
    ArrowRight,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { SwotTab } from './swot-tab';

interface LeanActionsTabProps {
    /** Whether to show all details or just the lean summary */
    advancedMode: boolean;
}

/**
 * Lean Actions Tab: consolidates SWOT Lean (auto‑generated, 3 bullets max),
 * Kill Sheet generator, and AI Strategy insights.
 * In Advanced mode, shows the full AiInsightsTab and SwotTab.
 */
export function LeanActionsTab({ advancedMode }: LeanActionsTabProps) {
    const language = useFounderStore((s) => s.language);
    const t = (translations[language] as any).competitiveWatch;
    const competitiveIntelligence = useFounderStore((s) => s.competitiveIntelligence);
    const strategicRecommendations = useFounderStore((s) => s.strategicRecommendations);
    const addSwotItem = useFounderStore((s) => s.addSwotItem);
    const updateSwotItem = useFounderStore((s) => s.updateSwotItem);
    const removeSwotItem = useFounderStore((s) => s.removeSwotItem);

    // Local state for editing
    const [editingItem, setEditingItem] = useState<{ type: string; index: number; text: string } | null>(null);
    const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});

    // --- Lean SWOT (Hybrid: AI > Alerts) ---
    const leanSwot = useMemo(() => {
        // If AI SWOT exists, use it
        if (strategicRecommendations?.swotAnalysis) {
            return strategicRecommendations.swotAnalysis;
        }

        // Fallback: derive from alerts (Legacy logic)
        const alerts = competitiveIntelligence?.alerts || [];
        const strengths: string[] = [];
        const weaknesses: string[] = [];
        const opportunities: string[] = [];
        const threats: string[] = [];

        for (const alert of alerts) {
            if (!alert.suggestedAction) continue;
            const text = alert.suggestedAction.slice(0, 120);
            switch (alert.type) {
                case 'info':
                case 'action_required':
                    if (alert.severity === 'low') strengths.push(text);
                    else weaknesses.push(text);
                    break;
                case 'opportunity':
                    opportunities.push(text);
                    break;
                case 'threat':
                    threats.push(text);
                    break;
            }
        }

        return {
            strengths: strengths.slice(0, 3),
            weaknesses: weaknesses.slice(0, 3),
            opportunities: opportunities.slice(0, 3),
            threats: threats.slice(0, 3),
        };
    }, [competitiveIntelligence, strategicRecommendations]);

    const hasSwotData = Object.values(leanSwot).some((arr) => arr.length > 0);



    const handleAddSwotItem = (type: any) => {
        const text = newItemTexts[type]?.trim();
        if (!text) return;

        addSwotItem(type, text);
        setNewItemTexts(prev => ({ ...prev, [type]: '' }));
    };

    const handleUpdateSwotItem = () => {
        if (!editingItem) return;
        updateSwotItem(editingItem.type as any, editingItem.index, editingItem.text);
        setEditingItem(null);
    };

    const quadrantConfig = [
        {
            key: 'strengths' as const,
            label: language === 'fr' ? 'Forces' : 'Strengths',
            icon: Shield,
            color: 'text-success',
            bg: 'bg-success/10 border-success/20',
        },
        {
            key: 'weaknesses' as const,
            label: language === 'fr' ? 'Faiblesses' : 'Weaknesses',
            icon: AlertTriangle,
            color: 'text-danger',
            bg: 'bg-danger/10 border-danger/20',
        },
        {
            key: 'opportunities' as const,
            label: language === 'fr' ? 'Opportunités' : 'Opportunities',
            icon: Lightbulb,
            color: 'text-info',
            bg: 'bg-info/10 border-info/20',
        },
        {
            key: 'threats' as const,
            label: language === 'fr' ? 'Menaces' : 'Threats',
            icon: Target,
            color: 'text-primary',
            bg: 'bg-primary/10 border-primary/20',
        },
    ];

    // In advanced mode, show full AI tab + full SWOT tab
    if (advancedMode) {
        return (
            <div className="space-y-8">
                {/* Full SWOT Tab */}
                <SwotTab />
            </div>
        );
    }

    // --- Essential mode: Lean SWOT ---
    return (
        <div className="space-y-6">

            {/* Lean SWOT */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Swords className="h-4 w-4 text-primary" />
                            <CardTitle className="text-base">{t.leanActions.swotTitle}</CardTitle>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t.leanActions.swotDesc}
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    {!hasSwotData && !strategicRecommendations ? (
                        <div className="text-center py-6">
                            <p className="text-sm text-muted-foreground mb-3">
                                {t.leanDashboard.noActions}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {quadrantConfig.map(({ key, label, icon: Icon, color, bg }) => (
                                <div key={key} className={`rounded-lg border p-3 ${bg}`}>
                                    <div className={`flex items-center gap-2 mb-2 ${color}`}>
                                        <Icon className="h-4 w-4" />
                                        <span className="text-sm font-medium">{label}</span>
                                        <span className="text-xs ml-auto opacity-70">
                                            {(leanSwot[key] || []).length}/3
                                        </span>
                                    </div>
                                    <ul className="space-y-2">
                                        {(leanSwot[key] || []).map((item, i) => (
                                            <li key={i} className="group relative">
                                                {editingItem?.type === key && editingItem?.index === i ? (
                                                    <div className="flex gap-2">
                                                        <input
                                                            className="flex-1 text-xs bg-background border rounded px-2 py-1"
                                                            value={editingItem.text}
                                                            onChange={(e) => setEditingItem({ ...editingItem, text: e.target.value })}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleUpdateSwotItem();
                                                                if (e.key === 'Escape') setEditingItem(null);
                                                            }}
                                                            autoFocus
                                                        />
                                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleUpdateSwotItem}>
                                                            <ArrowRight className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start gap-2 group p-1 rounded hover:bg-background/50">
                                                        <span
                                                            className="text-xs text-muted-foreground leading-relaxed flex-1 cursor-pointer hover:text-foreground"
                                                            onClick={() => setEditingItem({ type: key, index: i, text: item })}
                                                        >
                                                            {item}
                                                        </span>
                                                        <div className="hidden group-hover:flex gap-1 shrink-0 absolute right-0 top-0 bg-background/80 rounded shadow-sm">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                                                onClick={() => removeSwotItem(key, i)}
                                                            >
                                                                <span className="sr-only">Delete</span>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </li>
                                        ))}

                                        {/* Add New Item Input */}
                                        {(leanSwot[key]?.length || 0) < 3 && (
                                            <li className="mt-2">
                                                <div className="flex gap-2 items-center">
                                                    <input
                                                        className="flex-1 text-xs bg-transparent border-b border-dashed border-muted-foreground/30 focus:border-secondary outline-none py-1 placeholder:text-muted-foreground/40"
                                                        placeholder={language === 'fr' ? "+ Ajouter..." : "+ Add item..."}
                                                        value={newItemTexts[key] || ''}
                                                        onChange={(e) => setNewItemTexts(prev => ({ ...prev, [key]: e.target.value }))}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleAddSwotItem(key);
                                                        }}
                                                    />
                                                    {newItemTexts[key] && (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-5 w-5"
                                                            onClick={() => handleAddSwotItem(key)}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
