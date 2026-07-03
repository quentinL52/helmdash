'use client';

import { useMemo } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Clock, TrendingUp } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const COLORS = [
    'hsl(var(--primary))', '#00cec9', '#e17055', '#fdcb6e', '#74b9ff',
    '#a29bfe', '#55efc4', '#fab1a0', '#81ecec', '#ff7675',
];

export function TimelineChart() {
    const competitors = useFounderStore(s => s.competitors);
    const mySolution = useFounderStore(s => s.mySolution);
    const competitiveSnapshots = useFounderStore(s => s.competitiveSnapshots);
    const addCompetitiveSnapshot = useFounderStore(s => s.addCompetitiveSnapshot);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const handleTakeSnapshot = () => {
        const now = new Date().toISOString();
        competitors.forEach((competitor) => {
            addCompetitiveSnapshot({
                date: now,
                competitorId: competitor.id,
                radarScores: { ...competitor.radarScores },
                overallThreatLevel: competitor.threatLevel ?? 0,
            });
        });
    };

    // Build chart data: group snapshots by date, create one data point per date
    const chartData = useMemo(() => {
        if (competitiveSnapshots.length === 0) return [];

        // Group by date (day level)
        const dateMap = new Map<string, Map<string, number>>();
        competitiveSnapshots.forEach((snap) => {
            const dateKey = snap.date.split('T')[0];
            if (!dateMap.has(dateKey)) dateMap.set(dateKey, new Map());
            const dayMap = dateMap.get(dateKey)!;
            // Use threat level as the main score metric
            dayMap.set(snap.competitorId, snap.overallThreatLevel);
        });

        // Sort by date
        const sortedDates = Array.from(dateMap.keys()).sort();

        return sortedDates.map((dateKey) => {
            const dayMap = dateMap.get(dateKey)!;
            const point: Record<string, string | number> = {
                date: new Date(dateKey).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                }),
                dateRaw: dateKey,
            };
            competitors.forEach((c) => {
                if (dayMap.has(c.id)) {
                    point[c.name] = dayMap.get(c.id)!;
                }
            });
            return point;
        });
    }, [competitiveSnapshots, competitors, language]);

    // Radar-based score chart data (alternative view using radar avg)
    const radarChartData = useMemo(() => {
        if (competitiveSnapshots.length === 0) return [];

        const dateMap = new Map<string, Map<string, number>>();
        competitiveSnapshots.forEach((snap) => {
            const dateKey = snap.date.split('T')[0];
            if (!dateMap.has(dateKey)) dateMap.set(dateKey, new Map());
            const dayMap = dateMap.get(dateKey)!;
            const scores = snap.radarScores;
            const avg = (scores.price + scores.features + scores.ux + scores.market + scores.innovation + scores.support) / 6;
            dayMap.set(snap.competitorId, Math.round(avg * 10)); // Scale to 0-100
        });

        const sortedDates = Array.from(dateMap.keys()).sort();

        return sortedDates.map((dateKey) => {
            const dayMap = dateMap.get(dateKey)!;
            const point: Record<string, string | number> = {
                date: new Date(dateKey).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                }),
                dateRaw: dateKey,
            };
            competitors.forEach((c) => {
                if (dayMap.has(c.id)) {
                    point[c.name] = dayMap.get(c.id)!;
                }
            });
            return point;
        });
    }, [competitiveSnapshots, competitors, language]);

    const competitorNames = competitors.map((c) => c.name);
    const hasData = chartData.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">
                        {t.timeline?.title || (language === 'fr' ? 'Timeline Concurrentielle' : 'Competitive Timeline')}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {t.timeline?.subtitle || (language === 'fr'
                            ? 'Suivez l\'évolution du niveau de menace au fil du temps.'
                            : 'Track threat level evolution over time.')}
                    </p>
                </div>
                <Button
                    onClick={handleTakeSnapshot}
                    disabled={competitors.length === 0}
                    className="bg-primary hover:bg-primary/90 text-foreground"
                    size="sm"
                >
                    <Camera className="h-4 w-4 mr-1" />
                    {t.intelligence?.takeSnapshot || (language === 'fr' ? 'Prendre un Snapshot' : 'Take Snapshot')}
                </Button>
            </div>

            {!hasData ? (
                <Card className="bg-card border-border">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Clock className="h-12 w-12 text-muted-foreground opacity-40 mb-4" />
                        <p className="text-foreground font-medium mb-2">
                            {language === 'fr' ? 'Aucun snapshot disponible' : 'No snapshots available'}
                        </p>
                        <p className="text-muted-foreground text-sm max-w-md">
                            {language === 'fr'
                                ? 'Prenez des snapshots réguliers pour suivre l\'évolution concurrentielle. Chaque snapshot capture les scores radar et niveaux de menace de vos concurrents.'
                                : 'Take regular snapshots to track competitive evolution. Each snapshot captures radar scores and threat levels for your competitors.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {/* Threat Level Timeline */}
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-foreground flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-danger" />
                                {language === 'fr' ? 'Niveau de Menace' : 'Threat Level'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2b2d36" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#8b8fa3"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        stroke="#8b8fa3"
                                        tick={{ fontSize: 12 }}
                                        domain={[0, 100]}
                                        label={{
                                            value: language === 'fr' ? 'Menace (0-100)' : 'Threat (0-100)',
                                            angle: -90,
                                            position: 'insideLeft',
                                            style: { fill: '#8b8fa3', fontSize: 11 },
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1a1d2d',
                                            border: '1px solid #2b2d36',
                                            borderRadius: 8,
                                            color: '#e8e9ed',
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{ color: '#e8e9ed', fontSize: 12 }}
                                    />
                                    {competitorNames.map((name, i) => (
                                        <Line
                                            key={name}
                                            type="monotone"
                                            dataKey={name}
                                            stroke={COLORS[i % COLORS.length]}
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                            connectNulls
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Radar Score Timeline */}
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-foreground flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                {language === 'fr' ? 'Score Radar Moyen' : 'Average Radar Score'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={radarChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2b2d36" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#8b8fa3"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        stroke="#8b8fa3"
                                        tick={{ fontSize: 12 }}
                                        domain={[0, 100]}
                                        label={{
                                            value: language === 'fr' ? 'Score (0-100)' : 'Score (0-100)',
                                            angle: -90,
                                            position: 'insideLeft',
                                            style: { fill: '#8b8fa3', fontSize: 11 },
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1a1d2d',
                                            border: '1px solid #2b2d36',
                                            borderRadius: 8,
                                            color: '#e8e9ed',
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{ color: '#e8e9ed', fontSize: 12 }}
                                    />
                                    {competitorNames.map((name, i) => (
                                        <Line
                                            key={name}
                                            type="monotone"
                                            dataKey={name}
                                            stroke={COLORS[i % COLORS.length]}
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                            connectNulls
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Snapshot info */}
                    <div className="text-xs text-muted-foreground text-center">
                        {language === 'fr'
                            ? `${competitiveSnapshots.length} snapshots enregistrés pour ${competitors.length} concurrents`
                            : `${competitiveSnapshots.length} snapshots recorded for ${competitors.length} competitors`}
                    </div>
                </div>
            )}
        </div>
    );
}
