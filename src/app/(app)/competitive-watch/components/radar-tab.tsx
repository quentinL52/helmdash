'use client';

import { useMemo } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Card, CardContent } from '@/components/ui/card';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from 'recharts';
import { Eye } from 'lucide-react';

// --- Color palette for radar chart lines ---
const RADAR_COLORS = [
    '#00cec9',
    '#fd79a8',
    '#fdcb6e',
    '#e17055',
    '#0984e3',
    '#55efc4',
    '#fab1a0',
    '#74b9ff',
    '#a29bfe',
    '#b2bec3',
];

export function RadarTab() {
    const competitors = useFounderStore(s => s.competitors);
    const mySolution = useFounderStore(s => s.mySolution);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const radarAxesKeys = ['price', 'features', 'ux', 'market', 'innovation', 'support'] as const;

    const radarData = useMemo(() => {
        return radarAxesKeys.map((axis) => {
            const entry: Record<string, string | number> = {
                axis: t.radarAxes[axis],
                mySolution: mySolution.radarScores?.[axis] ?? 5, // Add My Solution score safely
            };
            competitors.forEach((c) => {
                entry[c.name] = c.radarScores?.[axis] ?? 5;
            });
            return entry;
        });
    }, [competitors, mySolution, language, t.radarAxes]); // Add mySolution dependency

    if (competitors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground space-y-2">
                <Eye className="h-12 w-12 opacity-40" />
                <p>{t.noCompetitors}</p>
                <p className="text-sm">
                    {language === 'fr'
                        ? 'Ajoutez des concurrents dans l\'onglet Vue d\'ensemble pour voir le radar.'
                        : 'Add competitors in the Overview tab to see the radar chart.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-foreground">
                    {language === 'fr' ? 'Carte Radar des Concurrents' : 'Competitor Radar Chart'}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {language === 'fr'
                        ? 'Comparez visuellement les forces de vos concurrents.'
                        : 'Visually compare your competitors strengths.'}
                </p>
            </div>
            <Card className="bg-card border-border">
                <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={500}>
                        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
                            <PolarGrid stroke="#282c3a" />
                            <PolarAngleAxis
                                dataKey="axis"
                                tick={{ fill: '#8b8fa3', fontSize: 13 }}
                            />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 10]}
                                tick={{ fill: '#8b8fa3', fontSize: 11 }}
                                tickCount={6}
                            />
                            {/* My Solution Radar */}
                            <Radar
                                name={mySolution.name || (language === 'fr' ? 'Ma Solution' : 'My Solution')}
                                dataKey="mySolution"
                                stroke="hsl(var(--primary))"
                                fill="hsl(var(--primary))"
                                fillOpacity={0.3}
                                strokeWidth={3}
                            />
                            {competitors.map((c, idx) => (
                                <Radar
                                    key={c.id}
                                    name={c.name}
                                    dataKey={c.name}
                                    stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
                                    fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
                                    fillOpacity={0.1}
                                    strokeWidth={2}
                                />
                            ))}
                            <Legend
                                wrapperStyle={{ color: '#e8e9ed', paddingTop: '20px' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1d2d',
                                    border: '1px solid #282c3a',
                                    borderRadius: '8px',
                                    color: '#e8e9ed',
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
