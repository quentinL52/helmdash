'use client';

import { useState, useMemo } from 'react';
import { useFounderStore, CompetitorRadarScores } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

type AxisKey = keyof CompetitorRadarScores;

export function CompetitiveScoreTab() {
    const competitors = useFounderStore(s => s.competitors);
    const mySolution = useFounderStore(s => s.mySolution);
    const language = useFounderStore(s => s.language);

    // Temporary translations
    const t = {
        title: language === 'fr' ? 'Score Compétitif' : 'Competitive Score',
        subtitle: language === 'fr'
            ? 'Classement pondéré basé sur vos critères prioritaires.'
            : 'Weighted ranking based on your priority criteria.',
        weights: language === 'fr' ? 'Pondération des Critères' : 'Criteria Weighting',
        ranking: language === 'fr' ? 'Classement' : 'Ranking',
        score: language === 'fr' ? 'Score' : 'Score',
        mySolution: language === 'fr' ? 'Ma Solution' : 'My Solution',
        axes: (translations[language] as any).competitiveWatch.radarAxes,
    };

    const axesKeys: AxisKey[] = ['price', 'features', 'ux', 'market', 'innovation', 'support'];

    // Local state for weights (default: equal importance 50%)
    const [weights, setWeights] = useState<Record<AxisKey, number>>({
        price: 50,
        features: 50,
        ux: 50,
        market: 50,
        innovation: 50,
        support: 50,
    });

    const defaultScores: CompetitorRadarScores = { price: 5, features: 5, ux: 5, market: 5, innovation: 5, support: 5 };

    const calculateScore = (scores: CompetitorRadarScores | undefined) => {
        const safeScores = scores || defaultScores;
        let totalScore = 0;
        let totalWeight = 0;

        axesKeys.forEach(key => {
            const weight = weights[key];
            const score = safeScores[key] || 0; // 0-10
            totalScore += score * weight;
            totalWeight += weight;
        });

        if (totalWeight === 0) return 0;
        return (totalScore / totalWeight); // Result is 0-10
    };

    const ranking = useMemo(() => {
        const allEntities = [
            {
                id: 'mySolution',
                name: mySolution.name || t.mySolution,
                scores: mySolution.radarScores || defaultScores,
                isMySolution: true,
                color: '#6c5ce7',
            },
            ...competitors.map((c, i) => ({
                id: c.id,
                name: c.name,
                scores: c.radarScores || defaultScores,
                isMySolution: false,
                color: ['#00cec9', '#fd79a8', '#fdcb6e', '#e17055', '#0984e3'][i % 5],
            })),
        ];

        return allEntities
            .map(entity => ({
                ...entity,
                finalScore: calculateScore(entity.scores),
            }))
            .sort((a, b) => b.finalScore - a.finalScore);
    }, [competitors, mySolution, weights, t.mySolution]);

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="h-6 w-6 text-yellow-400" />;
        if (index === 1) return <Medal className="h-6 w-6 text-gray-300" />; // Silver
        if (index === 2) return <Award className="h-6 w-6 text-orange-400" />; // Bronze
        return <span className="text-[#8b8fa3] font-bold text-lg w-6 text-center">{index + 1}</span>;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-[#e8e9ed]">{t.title}</h2>
                <p className="text-[#8b8fa3] text-sm">{t.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weights Configuration */}
                <Card className="bg-[#181a24] border-[#282c3a] lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base text-[#e8e9ed]">{t.weights}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {axesKeys.map((key) => (
                            <div key={key} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#e8e9ed]">{t.axes[key]}</span>
                                    <span className="text-[#8b8fa3] font-mono">{weights[key]}%</span>
                                </div>
                                <Slider
                                    value={[weights[key]]}
                                    min={0}
                                    max={100}
                                    step={10}
                                    onValueChange={(val) => setWeights(prev => ({ ...prev, [key]: val[0] }))}
                                    className="py-1"
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Ranking List */}
                <Card className="bg-[#181a24] border-[#282c3a] lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base text-[#e8e9ed]">{t.ranking}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {ranking.map((entity, index) => (
                            <div
                                key={entity.id}
                                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${entity.isMySolution
                                    ? 'bg-[#6c5ce7]/10 border-[#6c5ce7]/50 shadow-[0_0_15px_rgba(108,92,231,0.15)]'
                                    : 'bg-[#0f1117] border-[#282c3a]'
                                    }`}
                            >
                                <div className="flex items-center justify-center min-w-[40px]">
                                    {getRankIcon(index)}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className={`font-semibold ${entity.isMySolution ? 'text-[#a29bfe]' : 'text-[#e8e9ed]'}`}>
                                            {entity.name}
                                            {entity.isMySolution && (
                                                <Badge className="ml-2 bg-[#6c5ce7] hover:bg-[#5a4bd6] text-white border-0 text-[10px]">
                                                    YOU
                                                </Badge>
                                            )}
                                        </h3>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-[#e8e9ed]">{(entity.finalScore * 10).toFixed(0)}</span>
                                            <span className="text-xs text-[#8b8fa3]">/100</span>
                                        </div>
                                    </div>

                                    {/* Score Bar */}
                                    <div className="h-2 w-full bg-[#282c3a] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 ease-out"
                                            style={{
                                                width: `${(entity.finalScore / 10) * 100}%`,
                                                backgroundColor: entity.color
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
