'use client';

import { useMemo } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Target } from 'lucide-react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ZAxis,
    Cell,
} from 'recharts';

const MOMENTUM_COLORS: Record<string, string> = {
    rising: '#e17055',
    stable: '#fdcb6e',
    declining: '#55efc4',
};

function parseTeamSize(teamSize?: string): number {
    if (!teamSize) return 20;
    const numbers = teamSize.match(/\d+/g);
    if (!numbers) return 20;
    const parsed = numbers.map(Number);
    return parsed.length > 1 ? (parsed[0] + parsed[parsed.length - 1]) / 2 : parsed[0];
}

function parseFundingAmount(funding?: string): number {
    if (!funding) return 0;
    const lower = funding.toLowerCase();
    // Handle common formats: "$5M", "5M€", "5 million", etc.
    const match = lower.match(/([\d.,]+)\s*(m|k|b|million|thousand|billion)?/);
    if (!match) return 0;
    let value = parseFloat(match[1].replace(',', '.'));
    const unit = match[2];
    if (unit === 'b' || unit === 'billion') value *= 1000;
    else if (unit === 'm' || unit === 'million') value *= 1;
    else if (unit === 'k' || unit === 'thousand') value *= 0.001;
    return value;
}

function computeImpactProbability(competitor: {
    threatLevel?: number;
    momentum?: string;
    radarScores: { price: number; features: number; ux: number; market: number; innovation: number; support: number };
}): { impact: number; probability: number } {
    // Impact = how much damage they could do (based on radar strength)
    const scores = competitor.radarScores;
    const avgScore = (scores.price + scores.features + scores.ux + scores.market + scores.innovation + scores.support) / 6;
    const impact = Math.min(100, Math.max(0, avgScore * 10));

    // Probability = likelihood they will overtake/challenge you (based on threat + momentum)
    const threat = competitor.threatLevel ?? 30;
    const momentumBoost = competitor.momentum === 'rising' ? 15 : competitor.momentum === 'declining' ? -15 : 0;
    const probability = Math.min(100, Math.max(0, threat + momentumBoost));

    return { impact, probability };
}

export function ThreatMatrix() {
    const competitors = useFounderStore(s => s.competitors);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const chartData = useMemo(() => {
        return competitors.map((c) => {
            const { impact, probability } = computeImpactProbability(c);
            const teamSize = parseTeamSize(c.teamSize);
            const funding = parseFundingAmount(c.fundingAmount);
            // Bubble size: combine team + funding for visual weight
            const bubbleSize = Math.max(100, (teamSize * 2) + (funding * 10));

            return {
                name: c.name,
                x: probability,
                y: impact,
                z: bubbleSize,
                momentum: c.momentum || 'stable',
                threatLevel: c.threatLevel ?? 0,
                teamSize: c.teamSize || '?',
                fundingStage: c.fundingStage || '?',
                fundingAmount: c.fundingAmount || '?',
            };
        });
    }, [competitors]);

    if (competitors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground space-y-2">
                <Eye className="h-12 w-12 opacity-40" />
                <p>{t.noCompetitors}</p>
            </div>
        );
    }

    // Determine quadrant labels
    const quadrantLabels = {
        topRight: language === 'fr' ? 'Menace critique' : 'Critical threat',
        topLeft: language === 'fr' ? 'Puissant mais peu probable' : 'Powerful but unlikely',
        bottomRight: language === 'fr' ? 'Probable mais limité' : 'Likely but limited',
        bottomLeft: language === 'fr' ? 'Faible risque' : 'Low risk',
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-foreground">
                    {t.threatMatrix?.title || (language === 'fr' ? 'Matrice de Menaces' : 'Threat Matrix')}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {t.threatMatrix?.subtitle || (language === 'fr'
                        ? 'Évaluez la probabilité et l\'impact de chaque concurrent.'
                        : 'Assess the probability and impact of each competitor.')}
                </p>
            </div>

            <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base text-foreground flex items-center gap-2">
                        <Target className="h-4 w-4 text-danger" />
                        {language === 'fr' ? 'Probabilité vs Impact' : 'Probability vs Impact'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <ResponsiveContainer width="100%" height={400}>
                            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2b2d36" />
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    name={language === 'fr' ? 'Probabilité' : 'Probability'}
                                    domain={[0, 100]}
                                    stroke="#8b8fa3"
                                    tick={{ fontSize: 11 }}
                                    label={{
                                        value: language === 'fr' ? 'Probabilité de menace (%)' : 'Threat Probability (%)',
                                        position: 'insideBottom',
                                        offset: -10,
                                        style: { fill: '#8b8fa3', fontSize: 11 },
                                    }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    name="Impact"
                                    domain={[0, 100]}
                                    stroke="#8b8fa3"
                                    tick={{ fontSize: 11 }}
                                    label={{
                                        value: language === 'fr' ? 'Impact potentiel (%)' : 'Potential Impact (%)',
                                        angle: -90,
                                        position: 'insideLeft',
                                        style: { fill: '#8b8fa3', fontSize: 11 },
                                    }}
                                />
                                <ZAxis
                                    type="number"
                                    dataKey="z"
                                    range={[100, 600]}
                                    name={language === 'fr' ? 'Taille' : 'Size'}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (!active || !payload || payload.length === 0) return null;
                                        const data = payload[0]?.payload;
                                        if (!data) return null;
                                        const momentumLabel = data.momentum === 'rising'
                                            ? (language === 'fr' ? 'En hausse' : 'Rising')
                                            : data.momentum === 'declining'
                                                ? (language === 'fr' ? 'En baisse' : 'Declining')
                                                : (language === 'fr' ? 'Stable' : 'Stable');
                                        return (
                                            <div className="bg-card border border-border rounded-lg p-3 text-sm space-y-1">
                                                <p className="font-semibold text-foreground text-base">{data.name}</p>
                                                <p className="text-muted-foreground">
                                                    {language === 'fr' ? 'Probabilité' : 'Probability'}: {Math.round(data.x)}%
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Impact: {Math.round(data.y)}%
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {language === 'fr' ? 'Équipe' : 'Team'}: {data.teamSize}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Funding: {data.fundingStage} ({data.fundingAmount})
                                                </p>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <div
                                                        className="w-2.5 h-2.5 rounded-full"
                                                        style={{ backgroundColor: MOMENTUM_COLORS[data.momentum] || '#fdcb6e' }}
                                                    />
                                                    <span className="text-xs text-muted-foreground">{momentumLabel}</span>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                <Scatter data={chartData}>
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={MOMENTUM_COLORS[entry.momentum] || '#fdcb6e'}
                                            opacity={0.8}
                                        />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>

                        {/* Quadrant labels */}
                        <div className="absolute top-6 left-8 text-xs text-muted-foreground/50 pointer-events-none">
                            {quadrantLabels.topLeft}
                        </div>
                        <div className="absolute top-6 right-10 text-xs text-danger/50 pointer-events-none">
                            {quadrantLabels.topRight}
                        </div>
                        <div className="absolute bottom-10 left-8 text-xs text-success/50 pointer-events-none">
                            {quadrantLabels.bottomLeft}
                        </div>
                        <div className="absolute bottom-10 right-10 text-xs text-muted-foreground/50 pointer-events-none">
                            {quadrantLabels.bottomRight}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mt-4 justify-center">
                        {Object.entries(MOMENTUM_COLORS).map(([momentum, color]) => (
                            <div key={momentum} className="flex items-center gap-1.5">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-xs text-muted-foreground">
                                    {momentum === 'rising'
                                        ? (language === 'fr' ? 'En hausse' : 'Rising')
                                        : momentum === 'declining'
                                            ? (language === 'fr' ? 'En baisse' : 'Declining')
                                            : (language === 'fr' ? 'Stable' : 'Stable')}
                                </span>
                            </div>
                        ))}
                        <div className="flex items-center gap-1.5 ml-4">
                            <span className="text-xs text-muted-foreground">
                                {language === 'fr' ? 'Taille bulle = équipe + funding' : 'Bubble size = team + funding'}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Critical threats */}
                <Card className="bg-danger/5 border-danger/20">
                    <CardContent className="pt-4 pb-3">
                        <p className="text-sm font-medium text-danger mb-2">
                            {quadrantLabels.topRight}
                        </p>
                        <div className="space-y-1">
                            {chartData
                                .filter((d) => d.x > 50 && d.y > 50)
                                .map((d) => (
                                    <div key={d.name} className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: MOMENTUM_COLORS[d.momentum] }}
                                        />
                                        <span className="text-sm text-foreground">{d.name}</span>
                                        <Badge className="ml-auto bg-danger/20 text-danger border-danger/30 text-xs">
                                            {Math.round(d.x)}%
                                        </Badge>
                                    </div>
                                ))}
                            {chartData.filter((d) => d.x > 50 && d.y > 50).length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    {language === 'fr' ? 'Aucun concurrent dans cette zone' : 'No competitors in this zone'}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Watch list */}
                <Card className="bg-warning/5 border-warning/20">
                    <CardContent className="pt-4 pb-3">
                        <p className="text-sm font-medium text-warning mb-2">
                            {language === 'fr' ? 'À surveiller' : 'Watch list'}
                        </p>
                        <div className="space-y-1">
                            {chartData
                                .filter((d) => (d.x > 50 && d.y <= 50) || (d.x <= 50 && d.y > 50))
                                .map((d) => (
                                    <div key={d.name} className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: MOMENTUM_COLORS[d.momentum] }}
                                        />
                                        <span className="text-sm text-foreground">{d.name}</span>
                                    </div>
                                ))}
                            {chartData.filter((d) => (d.x > 50 && d.y <= 50) || (d.x <= 50 && d.y > 50)).length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    {language === 'fr' ? 'Aucun concurrent dans cette zone' : 'No competitors in this zone'}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Low risk */}
                <Card className="bg-success/5 border-success/20">
                    <CardContent className="pt-4 pb-3">
                        <p className="text-sm font-medium text-success mb-2">
                            {quadrantLabels.bottomLeft}
                        </p>
                        <div className="space-y-1">
                            {chartData
                                .filter((d) => d.x <= 50 && d.y <= 50)
                                .map((d) => (
                                    <div key={d.name} className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: MOMENTUM_COLORS[d.momentum] }}
                                        />
                                        <span className="text-sm text-foreground">{d.name}</span>
                                    </div>
                                ))}
                            {chartData.filter((d) => d.x <= 50 && d.y <= 50).length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    {language === 'fr' ? 'Aucun concurrent dans cette zone' : 'No competitors in this zone'}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
