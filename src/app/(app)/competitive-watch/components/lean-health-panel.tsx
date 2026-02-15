'use client';

import { useMemo } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import {
    computeHealthBreakdown,
    computeHealthScore,
    computeLeanSubScores,
} from '@/lib/competitive-intelligence';
import { HealthScoreGauge } from './health-score-gauge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Returns the appropriate color class based on score value.
 */
function getScoreColor(score: number): string {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 40) return 'bg-amber-400';
    return 'bg-red-400';
}

function getScoreTextColor(score: number): string {
    if (score >= 70) return 'text-emerald-500';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
}

/**
 * LeanHealthPanel: displays 1 main Health Score gauge + 3 visual sub-score bars.
 * Optionally shows the 5 detailed dimensions in a collapsible section.
 */
export function LeanHealthPanel() {
    const language = useFounderStore((s) => s.language);
    const t = (translations[language] as any).competitiveWatch;
    const mySolution = useFounderStore((s) => s.mySolution);
    const competitors = useFounderStore((s) => s.competitors);
    const marketSignals = useFounderStore((s) => s.marketSignals);

    const { healthScore, leanScores, breakdown } = useMemo(() => {
        const bd = computeHealthBreakdown(mySolution, competitors, marketSignals);
        return {
            healthScore: computeHealthScore(bd),
            leanScores: computeLeanSubScores(bd),
            breakdown: bd,
        };
    }, [mySolution, competitors, marketSignals]);

    const subScoreItems = [
        {
            key: 'produit',
            label: t.leanSubScores.produit,
            desc: t.leanSubScores.produitDesc,
            value: leanScores.produit,
        },
        {
            key: 'marche',
            label: t.leanSubScores.marche,
            desc: t.leanSubScores.marcheDesc,
            value: leanScores.marche,
        },
        {
            key: 'business',
            label: t.leanSubScores.business,
            desc: t.leanSubScores.businessDesc,
            value: leanScores.business,
        },
    ];

    const breakdownItems = [
        { label: t.intelligence.breakdown.featureParity, value: breakdown.featureParity },
        { label: t.intelligence.breakdown.pricingPosition, value: breakdown.pricingPosition },
        { label: t.intelligence.breakdown.marketMomentum, value: breakdown.marketMomentum },
        { label: t.intelligence.breakdown.differentiationStrength, value: breakdown.differentiationStrength },
        { label: t.intelligence.breakdown.threatExposure, value: breakdown.threatExposure },
    ];

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Main Health Score Gauge */}
                    <div className="flex-shrink-0">
                        <HealthScoreGauge score={healthScore} size={140} label={t.intelligence.healthScore} />
                    </div>

                    {/* 3 Sub-Score Bars */}
                    <div className="flex-1 w-full space-y-4">
                        {subScoreItems.map((item) => (
                            <div key={item.key} className="space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                    <div>
                                        <span className="font-medium">{item.label}</span>
                                        <span className="text-muted-foreground ml-2 text-xs">{item.desc}</span>
                                    </div>
                                    <span className={cn('font-bold text-sm', getScoreTextColor(item.value))}>
                                        {item.value}
                                    </span>
                                </div>
                                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={cn('h-full rounded-full transition-all duration-700 ease-out', getScoreColor(item.value))}
                                        style={{ width: `${item.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Collapsible: 5 detailed dimensions */}
                <Collapsible className="mt-4">
                    <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2">
                        <ChevronDown className="h-3 w-3" />
                        {language === 'fr' ? 'Voir les 5 dimensions détaillées' : 'View 5 detailed dimensions'}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-3 border-t mt-2">
                            {breakdownItems.map((item) => (
                                <div key={item.label} className="text-center space-y-1">
                                    <div className="text-xs text-muted-foreground">{item.label}</div>
                                    <div className={cn('text-lg font-bold', getScoreTextColor(item.value))}>
                                        {item.value}
                                    </div>
                                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={cn('h-full rounded-full', getScoreColor(item.value))}
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}
