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
    const setStrategicRecommendations = useFounderStore((s) => s.setStrategicRecommendations);
    const addSwotItem = useFounderStore((s) => s.addSwotItem);
    const updateSwotItem = useFounderStore((s) => s.updateSwotItem);
    const removeSwotItem = useFounderStore((s) => s.removeSwotItem);
    const removeStrategicRecommendation = useFounderStore((s) => s.removeStrategicRecommendation);
    const addRoadmapItem = useFounderStore((s) => s.addRoadmapItem);
    const addHypothesis = useFounderStore((s) => s.addHypothesis);
    const updateCanvasSection = useFounderStore((s) => s.updateCanvasSection);
    const mySolution = useFounderStore((s) => s.mySolution);
    const competitors = useFounderStore((s) => s.competitors);
    const leanCanvas = useFounderStore((s) => s.leanCanvas);
    const roadmap = useFounderStore((s) => s.roadmap);
    const hypotheses = useFounderStore((s) => s.hypotheses);

    const [isGenerating, setIsGenerating] = useState(false);

    // Local state for editing
    const [editingItem, setEditingItem] = useState<{ type: string; index: number; text: string } | null>(null);
    const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});

    // Confirmation dialog state
    const [showConfirmGenerate, setShowConfirmGenerate] = useState(false);

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

    const handleGenerateStrategy = async () => {
        setIsGenerating(true);
        setShowConfirmGenerate(false); // Close dialog
        try {
            // Import dynamically to avoid circular dependencies if any, or just consistent usage
            const { generateStrategicRecommendations } = await import('@/lib/ai-service');

            const recommendations = await generateStrategicRecommendations({
                mySolution,
                competitors,
                leanCanvas,
                roadmap,
                hypotheses,
                language,
            });

            setStrategicRecommendations(recommendations);
            toast({
                title: language === 'fr' ? 'Stratégie générée' : 'Strategy generated',
                description: language === 'fr'
                    ? 'Nouvelles recommandations disponibles.'
                    : 'New recommendations available.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: language === 'fr' ? 'Erreur' : 'Error',
                description: language === 'fr'
                    ? 'Impossible de générer la stratégie.'
                    : 'Could not generate strategy.',
                variant: 'destructive',
            });
        } finally {
            setIsGenerating(false);
        }
    };

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
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
        },
        {
            key: 'weaknesses' as const,
            label: language === 'fr' ? 'Faiblesses' : 'Weaknesses',
            icon: AlertTriangle,
            color: 'text-red-400',
            bg: 'bg-red-500/10 border-red-500/20',
        },
        {
            key: 'opportunities' as const,
            label: language === 'fr' ? 'Opportunités' : 'Opportunities',
            icon: Lightbulb,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
        },
        {
            key: 'threats' as const,
            label: language === 'fr' ? 'Menaces' : 'Threats',
            icon: Target,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10 border-orange-500/20',
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

    // --- Essential mode: Lean SWOT + AI Strategy summary ---
    return (
        <div className="space-y-6">
            {/* Header with Generate Button */}
            <div className="flex justify-end">
                <div className="relative">
                    {/* Confirmation Dialog Component (Simplified inline or Shadcn AlertDialog) */}
                    {showConfirmGenerate && (
                        <div className="absolute top-10 right-0 z-50 w-72 bg-popover text-popover-foreground border rounded-md shadow-lg p-4">
                            <h4 className="font-semibold mb-2 text-sm">{language === 'fr' ? 'Confirmer la régénération ?' : 'Confirm regeneration?'}</h4>
                            <p className="text-xs text-muted-foreground mb-4">
                                {language === 'fr'
                                    ? 'Cela écrasera vos éléments SWOT actuels. Êtes-vous sûr ?'
                                    : 'This will overwrite your current SWOT items. Are you sure?'}
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setShowConfirmGenerate(false)}>
                                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                                </Button>
                                <Button size="sm" variant="destructive" onClick={handleGenerateStrategy}>
                                    {language === 'fr' ? 'Confirmer' : 'Confirm'}
                                </Button>
                            </div>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (hasSwotData) {
                                setShowConfirmGenerate(true);
                            } else {
                                handleGenerateStrategy();
                            }
                        }}
                        disabled={isGenerating}
                        className="border-primary/30 text-accent-foreground hover:bg-primary/10"
                    >
                        {isGenerating ? (
                            <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> {language === 'fr' ? 'Analyse en cours...' : 'Analyzing...'}</>
                        ) : (
                            <><Sparkles className="h-4 w-4 mr-1" /> {language === 'fr' ? 'Actualiser l\'IA Stratégique' : 'Refresh AI Strategy'}</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Lean SWOT */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Swords className="h-4 w-4 text-violet-400" />
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
                                                        className="flex-1 text-xs bg-transparent border-b border-dashed border-muted-foreground/30 focus:border-violet-500 outline-none py-1 placeholder:text-muted-foreground/40"
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

            {/* AI Strategy Summary */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-violet-400" />
                        <CardTitle className="text-base">{t.leanActions.strategyTitle}</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {t.leanActions.strategyDesc}
                    </p>
                </CardHeader>
                <CardContent>
                    {strategicRecommendations ? (
                        <div className="space-y-3">
                            {/* Show top 3 roadmap recommendations */}
                            {strategicRecommendations.roadmapRecommendations?.slice(0, 3).map((rec, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                                    <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium">{rec.title}</div>
                                        {rec.timeframe && (
                                            <p className="text-xs text-muted-foreground mt-0.5">{rec.timeframe}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs h-7"
                                            onClick={() => {
                                                addRoadmapItem({
                                                    title: rec.title,
                                                    status: 'todo',
                                                    priority: rec.priority,
                                                });
                                                toast({ title: t.leanDashboard.addToRoadmap, description: rec.title });
                                                removeStrategicRecommendation('roadmap', rec.title);
                                            }}
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            {t.leanDashboard.addToRoadmap}
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {/* NEW: Show Lean Canvas Recommendations if any */}
                            {strategicRecommendations.leanCanvasRecommendations?.slice(0, 2).map((rec, i) => (
                                <div key={`lc-${i}`} className="flex items-start gap-3 p-3 rounded-lg border bg-card border-violet-500/20">
                                    <Lightbulb className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-semibold text-violet-400 uppercase mb-1 block">
                                            {rec.section}
                                        </span>
                                        <p className="text-sm text-muted-foreground">{rec.suggestion}</p>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs h-7"
                                            onClick={() => {
                                                const sectionMap: Record<string, string> = {
                                                    'Problem': 'problem',
                                                    'Solution': 'solution',
                                                    'Unique Value Proposition': 'uvp',
                                                    'Unfair Advantage': 'advantage',
                                                    'Channels': 'channels',
                                                    'Customer Segments': 'segments',
                                                    'Cost Structure': 'cost',
                                                    'Revenue Streams': 'revenue',
                                                    'Key Metrics': 'metrics'
                                                };
                                                const targetSection = sectionMap[rec.section] || 'solution';

                                                const currentContent = leanCanvas[targetSection] || '';
                                                const newContent = currentContent
                                                    ? `${currentContent}\n\n• ${rec.suggestion}`
                                                    : `• ${rec.suggestion}`;

                                                updateCanvasSection(targetSection, newContent);
                                                toast({
                                                    title: language === 'fr' ? 'Ajouté au Lean Canvas' : 'Added to Lean Canvas',
                                                    description: rec.suggestion.slice(0, 50)
                                                });
                                                removeStrategicRecommendation('lean', rec.suggestion);
                                            }}
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            {language === 'fr' ? 'Ajouter' : 'Add'}
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {strategicRecommendations.generatedAt && (
                                <p className="text-xs text-muted-foreground text-right">
                                    {language === 'fr' ? 'Dernière analyse' : 'Last analysis'}:{' '}
                                    {new Date(strategicRecommendations.generatedAt).toLocaleString(language)}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-sm text-muted-foreground mb-3">
                                {t.leanDashboard.noActions}
                            </p>
                            <Button variant="outline" size="sm" onClick={() => {
                                if (hasSwotData) setShowConfirmGenerate(true);
                                else handleGenerateStrategy();
                            }} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                                {language === 'fr' ? 'Générer une stratégie' : 'Generate Strategy'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
