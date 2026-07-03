'use client';

import { useState } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ListChecks,
    ArrowRight,
    Plus,
    CheckCircle2,
    Clock,
    Zap,
    Target,
    Lightbulb,
    TrendingUp,
} from 'lucide-react';

interface FeatureGapItem {
    feature: string;
    competitorsCoverage: number;
    businessImpact: 'critical' | 'high' | 'medium' | 'low';
    recommendation: string;
    suggestedRoadmapItem?: { title: string; priority: 'high' | 'medium' | 'low' } | null;
}

interface CrossModuleRecommendations {
    leanCanvas?: { section: string; suggestion: string }[];
    roadmap?: { title: string; priority: 'high' | 'medium' | 'low'; reasoning: string }[];
    hypotheses?: { statement: string; category: string; reasoning: string }[];
    routine?: { suggestion: string; reasoning: string }[];
}

interface ActionItemsPanelProps {
    featureGaps?: FeatureGapItem[];
    crossModuleRecs?: CrossModuleRecommendations;
    pricingIntelligence?: {
        yourPosition: string;
        recommendation: string;
        potentialRevenueImpact: string;
    };
}

const impactColors: Record<string, string> = {
    critical: 'bg-danger/20 text-danger border-danger/30',
    high: 'bg-primary/20 text-primary border-primary/30',
    medium: 'bg-warning/20 text-warning border-warning/30',
    low: 'bg-info/20 text-info border-info/30',
};

const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

export function ActionItemsPanel({
    featureGaps = [],
    crossModuleRecs,
    pricingIntelligence,
}: ActionItemsPanelProps) {
    const addRoadmapItem = useFounderStore(s => s.addRoadmapItem);
    const addHypothesis = useFounderStore(s => s.addHypothesis);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const [appliedActions, setAppliedActions] = useState<Set<string>>(new Set());

    const handleAddToRoadmap = (title: string, priority: 'high' | 'medium' | 'low', key: string) => {
        addRoadmapItem({
            title,
            description: language === 'fr'
                ? 'Généré depuis l\'analyse concurrentielle AI'
                : 'Generated from AI competitive analysis',
            status: 'todo',
            priority,
        });
        setAppliedActions(prev => new Set(prev).add(key));
        toast({
            title: t.actionItems.addToRoadmap,
            description: title,
        });
    };

    const handleCreateHypothesis = (statement: string, category: string, key: string) => {
        const validCategories = ['problem', 'solution', 'channel', 'revenue', 'segment'] as const;
        const cat = validCategories.includes(category as any)
            ? (category as typeof validCategories[number])
            : 'solution';

        addHypothesis({
            statement,
            category: cat,
            riskLevel: 'medium',
            testMethod: '',
            successCriteria: '',
            status: 'draft',
        });
        setAppliedActions(prev => new Set(prev).add(key));
        toast({
            title: t.actionItems.createHypothesis,
            description: statement.slice(0, 80) + (statement.length > 80 ? '...' : ''),
        });
    };

    const sortedGaps = [...featureGaps].sort(
        (a, b) => (priorityOrder[a.businessImpact] ?? 3) - (priorityOrder[b.businessImpact] ?? 3)
    );

    const roadmapRecs = crossModuleRecs?.roadmap || [];
    const hypothesisRecs = crossModuleRecs?.hypotheses || [];
    const routineRecs = crossModuleRecs?.routine || [];
    const canvasRecs = crossModuleRecs?.leanCanvas || [];

    const totalActions = sortedGaps.length + roadmapRecs.length + hypothesisRecs.length + routineRecs.length + canvasRecs.length;
    const appliedCount = appliedActions.size;

    if (totalActions === 0 && !pricingIntelligence) return null;

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg text-foreground">{t.actionItems.title}</CardTitle>
                    </div>
                    {totalActions > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {appliedCount} {t.actionItems.applied}
                            </Badge>
                            <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">
                                <Clock className="h-3 w-3 mr-1" />
                                {totalActions - appliedCount} {t.actionItems.pending}
                            </Badge>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Pricing Intelligence */}
                {pricingIntelligence && (
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <h4 className="text-sm font-semibold text-foreground">
                                {language === 'fr' ? 'Intelligence Pricing' : 'Pricing Intelligence'}
                            </h4>
                            <Badge variant="outline" className="ml-auto text-xs bg-primary/10 text-accent-foreground border-primary/30">
                                {pricingIntelligence.yourPosition.replace('_', ' ')}
                            </Badge>
                        </div>
                        <p className="text-sm text-foreground mb-1">{pricingIntelligence.recommendation}</p>
                        <p className="text-xs text-muted-foreground">
                            {language === 'fr' ? 'Impact potentiel' : 'Potential impact'}: {pricingIntelligence.potentialRevenueImpact}
                        </p>
                    </div>
                )}

                {/* Feature Gap Prioritization */}
                {sortedGaps.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <h4 className="text-sm font-semibold text-foreground">
                                {language === 'fr' ? 'Gaps Features Prioritaires' : 'Priority Feature Gaps'}
                            </h4>
                        </div>
                        <div className="space-y-2">
                            {sortedGaps.map((gap, i) => {
                                const key = `gap-${i}`;
                                const isApplied = appliedActions.has(key);
                                return (
                                    <div
                                        key={key}
                                        className={`rounded-lg border p-3 transition-colors ${
                                            isApplied
                                                ? 'bg-success/5 border-success/20'
                                                : 'bg-background border-border'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-foreground">{gap.feature}</span>
                                                    <Badge variant="outline" className={`text-xs ${impactColors[gap.businessImpact]}`}>
                                                        {gap.businessImpact}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {gap.competitorsCoverage} {language === 'fr' ? 'concurrents' : 'competitors'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{gap.recommendation}</p>
                                            </div>
                                            {!isApplied && gap.suggestedRoadmapItem && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleAddToRoadmap(
                                                        gap.suggestedRoadmapItem!.title,
                                                        gap.suggestedRoadmapItem!.priority,
                                                        key
                                                    )}
                                                    className="shrink-0 text-primary hover:text-accent-foreground hover:bg-primary/10"
                                                >
                                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                                    Roadmap
                                                </Button>
                                            )}
                                            {isApplied && (
                                                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Roadmap Recommendations */}
                {roadmapRecs.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-info" />
                            <h4 className="text-sm font-semibold text-foreground">
                                {language === 'fr' ? 'Recommandations Roadmap' : 'Roadmap Recommendations'}
                            </h4>
                        </div>
                        <div className="space-y-2">
                            {roadmapRecs.map((rec, i) => {
                                const key = `roadmap-${i}`;
                                const isApplied = appliedActions.has(key);
                                return (
                                    <div
                                        key={key}
                                        className={`rounded-lg border p-3 transition-colors ${
                                            isApplied
                                                ? 'bg-success/5 border-success/20'
                                                : 'bg-background border-border'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-foreground">{rec.title}</span>
                                                    <Badge variant="outline" className={`text-xs ${impactColors[rec.priority]}`}>
                                                        {rec.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{rec.reasoning}</p>
                                            </div>
                                            {!isApplied ? (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleAddToRoadmap(rec.title, rec.priority, key)}
                                                    className="shrink-0 text-primary hover:text-accent-foreground hover:bg-primary/10"
                                                >
                                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                                    Roadmap
                                                </Button>
                                            ) : (
                                                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Hypothesis Recommendations */}
                {hypothesisRecs.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-warning" />
                            <h4 className="text-sm font-semibold text-foreground">
                                {language === 'fr' ? 'Hypothèses Suggérées' : 'Suggested Hypotheses'}
                            </h4>
                        </div>
                        <div className="space-y-2">
                            {hypothesisRecs.map((hyp, i) => {
                                const key = `hyp-${i}`;
                                const isApplied = appliedActions.has(key);
                                return (
                                    <div
                                        key={key}
                                        className={`rounded-lg border p-3 transition-colors ${
                                            isApplied
                                                ? 'bg-success/5 border-success/20'
                                                : 'bg-background border-border'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-foreground">{hyp.statement}</span>
                                                    <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-border">
                                                        {hyp.category}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{hyp.reasoning}</p>
                                            </div>
                                            {!isApplied ? (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleCreateHypothesis(hyp.statement, hyp.category, key)}
                                                    className="shrink-0 text-warning hover:text-warning hover:bg-warning/10"
                                                >
                                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                                    {language === 'fr' ? 'Hypothèse' : 'Hypothesis'}
                                                </Button>
                                            ) : (
                                                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Routine + Canvas Recommendations (read-only insights) */}
                {(routineRecs.length > 0 || canvasRecs.length > 0) && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-accent-foreground" />
                            <h4 className="text-sm font-semibold text-foreground">
                                {language === 'fr' ? 'Autres Recommandations' : 'Other Recommendations'}
                            </h4>
                        </div>
                        <div className="space-y-2">
                            {canvasRecs.map((rec, i) => (
                                <div key={`canvas-${i}`} className="rounded-lg bg-background border border-border p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-xs bg-primary/10 text-accent-foreground border-primary/30">
                                            Lean Canvas
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{rec.section}</span>
                                    </div>
                                    <p className="text-sm text-foreground">{rec.suggestion}</p>
                                </div>
                            ))}
                            {routineRecs.map((rec, i) => (
                                <div key={`routine-${i}`} className="rounded-lg bg-background border border-border p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-xs bg-info/10 text-info border-info/30">
                                            Routine
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-foreground">{rec.suggestion}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{rec.reasoning}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
