'use client';

import { useState, useMemo } from 'react';
import { useFounderStore, CompetitorRadarScores, FeatureStatus, Competitor } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trophy, Medal, Award, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';

type AxisKey = keyof CompetitorRadarScores;

interface ScoreBreakdown {
    radar: number;       // 0-100 from weighted radar
    features: number;    // 0-100 from feature coverage
    signals: number;     // 0-100 from signal sentiment
    dataQuality: number; // 0-100 from data completeness
    total: number;       // 0-100 weighted final
}

export function CompetitiveScoreTab() {
    const competitors = useFounderStore(s => s.competitors);
    const mySolution = useFounderStore(s => s.mySolution);
    const marketSignals = useFounderStore(s => s.marketSignals);
    const language = useFounderStore(s => s.language);

    const t = {
        title: language === 'fr' ? 'Score Compétitif Multi-Facteurs' : 'Multi-Factor Competitive Score',
        subtitle: language === 'fr'
            ? 'Scoring avancé combinant radar, features, signaux et complétude des données.'
            : 'Advanced scoring combining radar, features, signals and data completeness.',
        weights: language === 'fr' ? 'Pondération Radar' : 'Radar Weighting',
        ranking: language === 'fr' ? 'Classement' : 'Ranking',
        mySolution: language === 'fr' ? 'Ma Solution' : 'My Solution',
        axes: (translations[language] as any).competitiveWatch.radarAxes,
        breakdown: {
            radar: language === 'fr' ? 'Score Radar' : 'Radar Score',
            features: language === 'fr' ? 'Couverture Features' : 'Feature Coverage',
            signals: language === 'fr' ? 'Sentiment Signaux' : 'Signal Sentiment',
            dataQuality: language === 'fr' ? 'Complétude Données' : 'Data Completeness',
        },
        factors: language === 'fr' ? 'Facteurs du Score' : 'Score Factors',
        radarWeight: language === 'fr' ? 'Radar' : 'Radar',
        featuresWeight: language === 'fr' ? 'Features' : 'Features',
        signalsWeight: language === 'fr' ? 'Signaux' : 'Signals',
        dataWeight: language === 'fr' ? 'Données' : 'Data',
    };

    const axesKeys: AxisKey[] = ['price', 'features', 'ux', 'market', 'innovation', 'support'];

    const [weights, setWeights] = useState<Record<AxisKey, number>>({
        price: 50, features: 50, ux: 50, market: 50, innovation: 50, support: 50,
    });

    // Factor weights
    const [factorWeights, setFactorWeights] = useState({
        radar: 50,
        features: 20,
        signals: 15,
        dataQuality: 15,
    });

    const defaultScores: CompetitorRadarScores = { price: 5, features: 5, ux: 5, market: 5, innovation: 5, support: 5 };

    const calculateRadarScore = (scores: CompetitorRadarScores | undefined) => {
        const safeScores = scores || defaultScores;
        let totalScore = 0;
        let totalWeight = 0;
        axesKeys.forEach(key => {
            totalScore += (safeScores[key] || 0) * weights[key];
            totalWeight += weights[key];
        });
        return totalWeight === 0 ? 50 : (totalScore / totalWeight) * 10;
    };

    const calculateFeatureCoverage = (featureAnalysis: Record<string, FeatureStatus> | undefined) => {
        const criteria = mySolution.comparisonCriteria || [];
        if (criteria.length === 0) return 50; // neutral if no criteria
        const yesCount = criteria.filter(f => featureAnalysis?.[f] === 'yes').length;
        const partialCount = criteria.filter(f => featureAnalysis?.[f] === 'partial').length;
        return Math.round(((yesCount + partialCount * 0.5) / criteria.length) * 100);
    };

    const calculateSignalSentiment = (competitorId: string) => {
        const signals = marketSignals.filter(s => s.competitorId === competitorId);
        if (signals.length === 0) return 50; // neutral
        const positive = signals.filter(s => s.impact === 'positive').length;
        const negative = signals.filter(s => s.impact === 'negative').length;
        const total = signals.length;
        // Score: 100 = all positive, 0 = all negative, 50 = balanced
        return Math.round(((positive - negative) / total + 1) * 50);
    };

    const calculateDataCompleteness = (competitor: Competitor | null) => {
        if (!competitor) {
            // MySolution data completeness
            const fields = [
                mySolution.name, mySolution.description, mySolution.positioning,
                mySolution.targetSegment, mySolution.businessModel,
                mySolution.keyFeatures?.length, mySolution.differentiators?.length,
                mySolution.pricingModel, mySolution.pricingRange,
            ];
            const filled = fields.filter(Boolean).length;
            return Math.round((filled / fields.length) * 100);
        }

        const fields = [
            competitor.name, competitor.description, competitor.website,
            competitor.positioning, competitor.targetSegment, competitor.businessModel,
            competitor.pricing, competitor.strengths, competitor.weaknesses,
            competitor.keyFeatures?.length, competitor.differentiators?.length,
            competitor.pricingModel, competitor.fundingStage, competitor.teamSize,
        ];
        const filled = fields.filter(Boolean).length;
        return Math.round((filled / fields.length) * 100);
    };

    const calculateBreakdown = (
        radarScores: CompetitorRadarScores | undefined,
        featureAnalysis: Record<string, FeatureStatus> | undefined,
        competitorId: string,
        competitor: Competitor | null
    ): ScoreBreakdown => {
        const radar = calculateRadarScore(radarScores);
        const features = calculateFeatureCoverage(featureAnalysis);
        const signals = calculateSignalSentiment(competitorId);
        const dataQuality = calculateDataCompleteness(competitor);

        const totalWeight = factorWeights.radar + factorWeights.features + factorWeights.signals + factorWeights.dataQuality;
        const total = totalWeight === 0 ? 0 : Math.round(
            (radar * factorWeights.radar +
             features * factorWeights.features +
             signals * factorWeights.signals +
             dataQuality * factorWeights.dataQuality) / totalWeight
        );

        return { radar: Math.round(radar), features, signals, dataQuality, total };
    };

    const ranking = useMemo(() => {
        const allEntities = [
            {
                id: 'mySolution',
                name: mySolution.name || t.mySolution,
                radarScores: mySolution.radarScores || defaultScores,
                featureAnalysis: mySolution.featureAnalysis,
                competitor: null as Competitor | null,
                isMySolution: true,
                color: 'hsl(var(--primary))',
                momentum: null as string | null,
            },
            ...competitors.map((c, i) => ({
                id: c.id,
                name: c.name,
                radarScores: c.radarScores || defaultScores,
                featureAnalysis: c.featureAnalysis,
                competitor: c as Competitor | null,
                isMySolution: false,
                color: ['#00cec9', '#fd79a8', '#fdcb6e', '#e17055', '#0984e3'][i % 5],
                momentum: c.momentum as string | null,
            })),
        ];

        return allEntities
            .map(entity => ({
                ...entity,
                breakdown: calculateBreakdown(
                    entity.radarScores,
                    entity.featureAnalysis,
                    entity.id,
                    entity.competitor
                ),
            }))
            .sort((a, b) => b.breakdown.total - a.breakdown.total);
    }, [competitors, mySolution, weights, factorWeights, marketSignals]);

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="h-6 w-6 text-warning" />;
        if (index === 1) return <Medal className="h-6 w-6 text-gray-300" />;
        if (index === 2) return <Award className="h-6 w-6 text-primary" />;
        return <span className="text-muted-foreground font-bold text-lg w-6 text-center">{index + 1}</span>;
    };

    const getMomentumIcon = (momentum: string | null) => {
        if (momentum === 'rising') return <TrendingUp className="h-3.5 w-3.5 text-success" />;
        if (momentum === 'declining') return <TrendingDown className="h-3.5 w-3.5 text-danger" />;
        return null;
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-success';
        if (score >= 40) return 'text-warning';
        return 'text-danger';
    };

    return (
        <TooltipProvider>
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">{t.title}</h2>
                    <p className="text-muted-foreground text-sm">{t.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Weights Configuration */}
                    <div className="space-y-4">
                        <Card className="bg-card border-border">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-foreground">{t.weights}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {axesKeys.map((key) => (
                                    <div key={key} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-foreground">{t.axes[key]}</span>
                                            <span className="text-muted-foreground font-mono text-xs">{weights[key]}%</span>
                                        </div>
                                        <Slider
                                            value={[weights[key]]}
                                            min={0} max={100} step={10}
                                            onValueChange={(val) => setWeights(prev => ({ ...prev, [key]: val[0] }))}
                                            className="py-0.5"
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Factor Weights */}
                        <Card className="bg-card border-border">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-foreground flex items-center gap-1">
                                    {t.factors}
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-card border-border text-foreground max-w-[200px]">
                                            {language === 'fr'
                                                ? 'Ajustez l\'importance de chaque facteur dans le score final.'
                                                : 'Adjust the importance of each factor in the final score.'}
                                        </TooltipContent>
                                    </Tooltip>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {([
                                    { key: 'radar', label: t.radarWeight, color: 'text-primary' },
                                    { key: 'features', label: t.featuresWeight, color: 'text-info' },
                                    { key: 'signals', label: t.signalsWeight, color: 'text-destructive' },
                                    { key: 'dataQuality', label: t.dataWeight, color: 'text-warning' },
                                ] as const).map(({ key, label, color }) => (
                                    <div key={key} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className={color}>{label}</span>
                                            <span className="text-muted-foreground font-mono text-xs">{factorWeights[key]}%</span>
                                        </div>
                                        <Slider
                                            value={[factorWeights[key]]}
                                            min={0} max={100} step={5}
                                            onValueChange={(val) => setFactorWeights(prev => ({ ...prev, [key]: val[0] }))}
                                            className="py-0.5"
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Ranking List */}
                    <Card className="bg-card border-border lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base text-foreground">{t.ranking}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {ranking.map((entity, index) => (
                                <Tooltip key={entity.id}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-default ${entity.isMySolution
                                                ? 'bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(108,92,231,0.15)]'
                                                : 'bg-background border-border hover:border-border'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center min-w-[40px]">
                                                {getRankIcon(index)}
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <h3 className={`font-semibold flex items-center gap-2 ${entity.isMySolution ? 'text-accent-foreground' : 'text-foreground'}`}>
                                                        {entity.name}
                                                        {entity.isMySolution && (
                                                            <Badge className="bg-primary hover:bg-primary/90 text-foreground border-0 text-[10px]">
                                                                YOU
                                                            </Badge>
                                                        )}
                                                        {getMomentumIcon(entity.momentum)}
                                                    </h3>
                                                    <div className="text-right">
                                                        <span className={`text-2xl font-bold ${getScoreColor(entity.breakdown.total)}`}>
                                                            {entity.breakdown.total}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">/100</span>
                                                    </div>
                                                </div>

                                                {/* Score Bar */}
                                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500 ease-out"
                                                        style={{
                                                            width: `${entity.breakdown.total}%`,
                                                            backgroundColor: entity.color
                                                        }}
                                                    />
                                                </div>

                                                {/* Mini breakdown bars */}
                                                <div className="grid grid-cols-4 gap-2 text-xs">
                                                    {([
                                                        { key: 'radar', label: t.breakdown.radar, color: 'hsl(var(--primary))' },
                                                        { key: 'features', label: t.breakdown.features, color: '#00cec9' },
                                                        { key: 'signals', label: t.breakdown.signals, color: '#fd79a8' },
                                                        { key: 'dataQuality', label: t.breakdown.dataQuality, color: '#fdcb6e' },
                                                    ] as const).map(({ key, label, color }) => (
                                                        <div key={key}>
                                                            <div className="flex justify-between mb-0.5">
                                                                <span className="text-muted-foreground truncate">{label}</span>
                                                                <span className="text-foreground font-mono">{entity.breakdown[key]}</span>
                                                            </div>
                                                            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full transition-all duration-300"
                                                                    style={{
                                                                        width: `${entity.breakdown[key]}%`,
                                                                        backgroundColor: color
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        className="bg-card border-border text-foreground p-3 space-y-2 max-w-[250px]"
                                    >
                                        <p className="font-semibold text-sm">{entity.name}</p>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-primary">{t.breakdown.radar}</span>
                                                <span className="font-mono">{entity.breakdown.radar}/100</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-info">{t.breakdown.features}</span>
                                                <span className="font-mono">{entity.breakdown.features}/100</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-destructive">{t.breakdown.signals}</span>
                                                <span className="font-mono">{entity.breakdown.signals}/100</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-warning">{t.breakdown.dataQuality}</span>
                                                <span className="font-mono">{entity.breakdown.dataQuality}/100</span>
                                            </div>
                                            <hr className="border-border" />
                                            <div className="flex justify-between font-semibold">
                                                <span>Total</span>
                                                <span className={getScoreColor(entity.breakdown.total)}>{entity.breakdown.total}/100</span>
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TooltipProvider>
    );
}
