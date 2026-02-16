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
} from 'lucide-react';
import { AiInsightsTab } from './ai-insights-tab';
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
    const addRoadmapItem = useFounderStore((s) => s.addRoadmapItem);
    const addHypothesis = useFounderStore((s) => s.addHypothesis);
    const mySolution = useFounderStore((s) => s.mySolution);
    const competitors = useFounderStore((s) => s.competitors);
    const leanCanvas = useFounderStore((s) => s.leanCanvas);
    const roadmap = useFounderStore((s) => s.roadmap);
    const hypotheses = useFounderStore((s) => s.hypotheses);

    const [isGenerating, setIsGenerating] = useState(false);

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

    const handleAction = (text: string, type: 'roadmap' | 'hypothesis') => {
        if (type === 'roadmap') {
            addRoadmapItem({
                title: text,
                description: language === 'fr'
                    ? 'Généré depuis le SWOT Lean'
                    : 'Generated from Lean SWOT',
                status: 'todo',
                priority: 'medium',
            });
            toast({ title: t.leanDashboard.addToRoadmap, description: text.slice(0, 80) });
        } else {
            addHypothesis({
                statement: text,
                category: 'solution',
                riskLevel: 'medium',
                testMethod: '',
                successCriteria: '',
                status: 'draft',
            });
            toast({ title: t.leanDashboard.createHypothesis, description: text.slice(0, 80) });
        }
    };

    const handleGenerateStrategy = async () => {
        setIsGenerating(true);
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
                {/* Full AI Insights */}
                <AiInsightsTab />

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
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateStrategy}
                    disabled={isGenerating}
                    className="border-[#6c5ce7]/30 text-[#a29bfe] hover:bg-[#6c5ce7]/10"
                >
                    {isGenerating ? (
                        <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> {language === 'fr' ? 'Analyse en cours...' : 'Analyzing...'}</>
                    ) : (
                        <><Sparkles className="h-4 w-4 mr-1" /> {language === 'fr' ? 'Actualiser l\'IA Stratégique' : 'Refresh AI Strategy'}</>
                    )}
                </Button>
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
                    {!hasSwotData ? (
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
                                    </div>
                                    <ul className="space-y-1.5">
                                        {leanSwot[key].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 group">
                                                <span className="text-xs text-muted-foreground leading-relaxed flex-1">
                                                    {item}
                                                </span>
                                                <div className="hidden group-hover:flex gap-1 shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-5 w-5 p-0"
                                                        onClick={() => handleAction(item, 'roadmap')}
                                                        title={t.leanDashboard.addToRoadmap}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                        {leanSwot[key].length === 0 && (
                                            <li className="text-xs text-muted-foreground italic">—</li>
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
                                            onClick={() => handleAction(
                                                rec.title,
                                                'roadmap'
                                            )}
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
                            <Button variant="outline" size="sm" onClick={handleGenerateStrategy} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                                {language === 'fr' ? 'Générer une stratégie' : 'Generate Strategy'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
