'use client';

import { useState, useRef } from 'react';
import { JournalEntry, Mood } from '@/store/founder-store';
import { eachDayOfInterval, endOfYear, format, isSameDay, startOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MoodHeatmapProps {
    entries: JournalEntry[];
    year?: number;
}

const getMoodColor = (mood?: Mood) => {
    switch (mood) {
        case 'great': return 'bg-green-500';
        case 'good': return 'bg-emerald-400';
        case 'neutral': return 'bg-yellow-500';
        case 'bad': return 'bg-orange-500';
        case 'terrible': return 'bg-red-500';
        default: return 'bg-muted-foreground/10';
    }
};

const getMoodTextColor = (mood: Mood): string => {
    switch (mood) {
        case 'great': return '#22c55e';
        case 'good': return '#34d399';
        case 'neutral': return '#eab308';
        case 'bad': return '#f97316';
        case 'terrible': return '#ef4444';
    }
};

const MOOD_LABELS: Record<Mood, string> = {
    great: 'Excellent',
    good: 'Bien',
    neutral: 'Neutre',
    bad: 'Difficile',
    terrible: 'Très difficile',
};

export function MoodHeatmap({ entries, year = new Date().getFullYear() }: MoodHeatmapProps) {
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const [hoveredDay, setHoveredDay] = useState<string | null>(null);
    const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="p-6 border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Humeur ({year})</h3>
                <div className="flex gap-2 text-xs text-muted-foreground items-center">
                    <span>Difficile</span>
                    <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                    <div className="w-3 h-3 rounded-sm bg-orange-500"></div>
                    <div className="w-3 h-3 rounded-sm bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                    <span>Excellent</span>
                </div>
            </div>

            {/* Container relatif pour le positionnement absolu de la carte */}
            <div ref={containerRef} style={{ position: 'relative' }}>
                <div className="inline-grid grid-rows-7 grid-flow-col gap-1">
                    {days.map((day) => {
                        const entry = entries.find(e => isSameDay(new Date(e.date), day));
                        const dayKey = day.toISOString();

                        return (
                            <div
                                key={dayKey}
                                className={cn(
                                    "w-3 h-3 rounded-sm transition-colors cursor-pointer hover:ring-1 hover:ring-ring",
                                    getMoodColor(entry?.mood),
                                    !entry && "hover:bg-muted-foreground/20"
                                )}
                                onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const containerRect = containerRef.current?.getBoundingClientRect();
                                    if (!containerRect) return;
                                    setHoverPos({
                                        x: rect.left - containerRect.left,
                                        y: rect.top - containerRect.top,
                                    });
                                    setHoveredDay(dayKey);
                                }}
                                onMouseLeave={() => setHoveredDay(null)}
                            />
                        );
                    })}
                </div>

                {/* Carte de détail au survol */}
                {hoveredDay && (() => {
                    const day = new Date(hoveredDay);
                    const entry = entries.find(e => isSameDay(new Date(e.date), day));
                    const CARD_W = 240;
                    const containerW = containerRef.current?.offsetWidth ?? 9999;
                    const leftPos = hoverPos.x + 20 + CARD_W > containerW
                        ? hoverPos.x - CARD_W - 8
                        : hoverPos.x + 20;

                    return (
                        <div
                            style={{
                                position: 'absolute',
                                left: leftPos,
                                top: hoverPos.y - 8,
                                zIndex: 100,
                                background: '#181a24',
                                border: '1px solid #282c3a',
                                borderRadius: '10px',
                                padding: '12px',
                                width: `${CARD_W}px`,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                pointerEvents: 'none',
                            }}
                        >
                            {/* Date */}
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#e8e9ed', marginBottom: '6px' }}>
                                {format(day, 'd MMMM yyyy', { locale: fr })}
                            </div>

                            {entry ? (
                                <>
                                    {/* Humeur */}
                                    <div style={{
                                        fontSize: '11px', fontWeight: 500,
                                        color: getMoodTextColor(entry.mood),
                                        marginBottom: '8px',
                                    }}>
                                        {MOOD_LABELS[entry.mood]}
                                    </div>

                                    {/* Contenu */}
                                    {entry.content && (
                                        <div style={{
                                            fontSize: '11px', color: '#8b8fa3',
                                            lineHeight: 1.5, marginBottom: '8px',
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical' as const,
                                        }}>
                                            {entry.content}
                                        </div>
                                    )}

                                    {/* Blocages */}
                                    {entry.blockers && (
                                        <div style={{
                                            fontSize: '10px', color: '#e17055',
                                            background: '#e1705518',
                                            borderRadius: '4px', padding: '4px 6px',
                                            marginBottom: '6px',
                                        }}>
                                            ⚠ {entry.blockers}
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {entry.tags.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                                            {entry.tags.map(tag => (
                                                <span key={tag} style={{
                                                    fontSize: '9px', padding: '1px 5px',
                                                    borderRadius: '3px',
                                                    background: '#6c5ce720', color: '#a29bfe',
                                                }}>
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ fontSize: '11px', color: '#5c6078', fontStyle: 'italic' }}>
                                    Aucune entrée
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
