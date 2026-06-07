'use client';

import { useState, useRef, useEffect } from 'react';
import { useFounderStore, CompetitorRadarScores } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Move, HelpCircle, RefreshCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type AxisKey = keyof CompetitorRadarScores;

export function PositioningMapTab() {
    const competitors = useFounderStore(s => s.competitors);
    const mySolution = useFounderStore(s => s.mySolution);
    const updateCompetitor = useFounderStore(s => s.updateCompetitor);
    const updateMySolution = useFounderStore(s => s.updateMySolution);
    const language = useFounderStore(s => s.language);

    // Temporary translations
    const t = {
        title: language === 'fr' ? 'Carte de Positionnement' : 'Positioning Map',
        subtitle: language === 'fr'
            ? 'Visualisez et ajustez le positionnement par glisser-déposer.'
            : 'Visualize and adjust positioning via drag and drop.',
        xAxis: language === 'fr' ? 'Axe X' : 'X Axis',
        yAxis: language === 'fr' ? 'Axe Y' : 'Y Axis',
        reset: language === 'fr' ? 'Réinitialiser' : 'Reset',
        mySolution: language === 'fr' ? 'Ma Solution' : 'My Solution',
        axes: (translations[language] as any).competitiveWatch.radarAxes,
    };

    const [xAxis, setXAxis] = useState<AxisKey>('price');
    const [yAxis, setYAxis] = useState<AxisKey>('features');
    const [draggingId, setDraggingId] = useState<string | null>(null); // 'mySolution' or competitor ID

    const svgRef = useRef<SVGSVGElement>(null);

    const axesKeys: AxisKey[] = ['price', 'features', 'ux', 'market', 'innovation', 'support'];

    const getCoord = (value: number) => value * 10; // 0-10 -> 0-100
    const getValue = (coord: number) => Math.max(0, Math.min(10, Math.round(coord / 10)));

    const handlePointerDown = (e: React.PointerEvent, id: string) => {
        setDraggingId(id);
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggingId || !svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Invert Y because SVG 0 is top
        const rawScoreX = x / 10;
        const rawScoreY = (100 - y) / 10;

        // Clamp 0-10
        const scoreX = Math.max(0, Math.min(10, Math.round(rawScoreX * 10) / 10));
        const scoreY = Math.max(0, Math.min(10, Math.round(rawScoreY * 10) / 10));

        if (draggingId === 'mySolution') {
            updateMySolution({
                radarScores: {
                    ...(mySolution.radarScores || {}),
                    [xAxis]: scoreX,
                    [yAxis]: scoreY,
                }
            });
        } else {
            const competitor = competitors.find(c => c.id === draggingId);
            if (competitor) {
                updateCompetitor(draggingId, {
                    radarScores: {
                        ...competitor.radarScores,
                        [xAxis]: scoreX,
                        [yAxis]: scoreY,
                    }
                });
            }
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setDraggingId(null);
        (e.target as Element).releasePointerCapture(e.pointerId);
    };

    const renderNode = (id: string, name: string, xVal: number, yVal: number, color: string, isMe = false) => {
        const cx = getCoord(xVal);
        const cy = 100 - getCoord(yVal); // Invert Y

        return (
            <g
                key={id}
                className="cursor-pointer transition-transform duration-75 ease-out"
                style={{ transform: `translate(${cx}px, ${cy}px)` }} // Using transform for better perfs if feasible, but here we work in SVG units
            // Actually in SVG we use cx/cy. But for dragging smoothness, updating state re-renders.
            // For 'transform', we need to wrap in a group and use 0,0 for circle.
            // Let's use direct x/y props for simplicity as React handles updates fast enough for this amount of nodes.
            >
                <circle
                    cx={cx}
                    cy={cy}
                    r={isMe ? 8 : 6}
                    fill={color}
                    fillOpacity={0.8}
                    stroke={isMe ? '#fff' : color}
                    strokeWidth={2}
                    onPointerDown={(e) => handlePointerDown(e, id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="hover:scale-125 transition-transform"
                />
                <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    fill={color}
                    fontSize={10}
                    fontWeight="bold"
                    pointerEvents="none"
                    className="select-none"
                    style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.8)' }}
                >
                    {name}
                </text>
            </g>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">{t.title}</h2>
                    <p className="text-muted-foreground text-sm">{t.subtitle}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground uppercase font-mono">{t.xAxis}</span>
                        <Select value={xAxis} onValueChange={(v) => setXAxis(v as AxisKey)}>
                            <SelectTrigger className="w-[140px] bg-card border-border text-foreground h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground">
                                {axesKeys.map(k => (
                                    <SelectItem key={k} value={k} disabled={k === yAxis}>
                                        {t.axes[k]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground uppercase font-mono">{t.yAxis}</span>
                        <Select value={yAxis} onValueChange={(v) => setYAxis(v as AxisKey)}>
                            <SelectTrigger className="w-[140px] bg-card border-border text-foreground h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground">
                                {axesKeys.map(k => (
                                    <SelectItem key={k} value={k} disabled={k === xAxis}>
                                        {t.axes[k]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Card className="bg-card border-border overflow-hidden select-none">
                <CardContent className="p-6">
                    <div className="relative w-full pb-[60%] md:pb-[40%] bg-background rounded-lg border border-border">
                        <div className="absolute inset-0 p-8">
                            {/* Grid Labels */}
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-primary font-bold tracking-widest origin-center whitespace-nowrap">
                                {t.axes[yAxis].toUpperCase()}
                            </div>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-primary font-bold tracking-widest whitespace-nowrap">
                                {t.axes[xAxis].toUpperCase()}
                            </div>

                            {/* Chart Area */}
                            <svg
                                ref={svgRef}
                                className="w-full h-full overflow-visible touch-none"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                            >
                                {/* Grid Lines */}
                                {[0, 2, 4, 6, 8, 10].map(val => (
                                    <g key={val}>
                                        {/* Vertical */}
                                        <line
                                            x1={val * 10} y1={0}
                                            x2={val * 10} y2={100}
                                            stroke="#282c3a"
                                            strokeWidth="0.5"
                                            strokeDasharray={val === 5 ? "0" : "4 2"}
                                        />
                                        {/* Horizontal */}
                                        <line
                                            x1={0} y1={100 - val * 10}
                                            x2={100} y2={100 - val * 10}
                                            stroke="#282c3a"
                                            strokeWidth="0.5"
                                            strokeDasharray={val === 5 ? "0" : "4 2"}
                                        />
                                        {/* Labels */}
                                        {val > 0 && val < 10 && (
                                            <>
                                                <text x={val * 10} y={104} textAnchor="middle" fontSize="3" fill="#4b5563">{val}</text>
                                                <text x={-2} y={100 - val * 10 + 1} textAnchor="end" fontSize="3" fill="#4b5563">{val}</text>
                                            </>
                                        )}
                                    </g>
                                ))}

                                {/* Quadrant Labels (Optional) */}
                                <text x={95} y={5} textAnchor="end" fontSize="3" fill="#282c3a" fontWeight="bold">HIGH / HIGH</text>
                                <text x={5} y={95} textAnchor="start" fontSize="3" fill="#282c3a" fontWeight="bold">LOW / LOW</text>

                                {/* Nodes */}
                                {competitors.map((c, i) => (
                                    renderNode(
                                        c.id,
                                        c.name,
                                        c.radarScores?.[xAxis] ?? 5,
                                        c.radarScores?.[yAxis] ?? 5,
                                        ['#00cec9', '#fd79a8', '#fdcb6e', '#e17055', '#0984e3'][i % 5]
                                    )
                                ))}

                                {/* My Solution */}
                                {renderNode(
                                    'mySolution',
                                    mySolution.name || t.mySolution,
                                    mySolution.radarScores?.[xAxis] ?? 5,
                                    mySolution.radarScores?.[yAxis] ?? 5,
                                    '#6c5ce7',
                                    true
                                )}
                            </svg>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Move className="h-3 w-3" />
                            <span>
                                {language === 'fr'
                                    ? 'Déplacez les points pour ajuster les scores.'
                                    : 'Drag points to adjust scores.'}
                            </span>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-primary border border-white"></span>
                                <span>{mySolution.name || t.mySolution}</span>
                            </div>
                            {competitors.map((c, i) => (
                                <div key={c.id} className="flex items-center gap-1.5">
                                    <span
                                        className="w-2 h-2 rounded-full opacity-80"
                                        style={{ backgroundColor: ['#00cec9', '#fd79a8', '#fdcb6e', '#e17055', '#0984e3'][i % 5] }}
                                    ></span>
                                    <span>{c.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
