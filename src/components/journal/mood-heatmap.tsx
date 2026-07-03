'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
        case 'great': return 'bg-primary';
        case 'good': return 'bg-primary/80';
        case 'neutral': return 'bg-primary/60';
        case 'bad': return 'bg-primary/40';
        case 'terrible': return 'bg-primary/20';
        default: return 'bg-muted-foreground/10';
    }
};

const getMoodTextColor = (mood: Mood): string => {
    switch (mood) {
        case 'great': return 'hsl(var(--primary))';
        case 'good': return 'hsl(var(--primary) / 0.8)';
        case 'neutral': return 'hsl(var(--primary) / 0.6)';
        case 'bad': return 'hsl(var(--primary) / 0.4)';
        case 'terrible': return 'hsl(var(--primary) / 0.2)';
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
    // Sécurité SSR : createPortal ne fonctionne que côté client
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // Calcul de la position de la carte (coordonnées viewport)
    const CARD_W = 240;
    const viewportW = typeof window !== 'undefined' ? window.innerWidth : 9999;
    const cardLeft = hoverPos.x + 20 + CARD_W > viewportW
        ? hoverPos.x - CARD_W - 8
        : hoverPos.x + 20;
    const cardTop = hoverPos.y - 8;

    // Carte de détail — rendue via portal dans document.body pour échapper
    // au stacking context créé par backdrop-filter sur le container parent
    const hoverCard = hoveredDay ? (() => {
        const day = new Date(hoveredDay);
        const entry = entries.find(e => isSameDay(new Date(e.date), day));

        return (
            <div
                style={{
                    position: 'fixed',
                    left: cardLeft,
                    top: cardTop,
                    zIndex: 9999,
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '10px',
                    padding: '12px',
                    width: `${CARD_W}px`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    pointerEvents: 'none',
                }}
            >
                {/* Date */}
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '6px' }}>
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
                                fontSize: '11px', color: 'hsl(var(--muted-foreground))',
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
                                fontSize: '10px', color: 'hsl(var(--danger))',
                                background: 'hsl(var(--danger) / 0.1)',
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
                                        background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))',
                                    }}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontStyle: 'italic' }}>
                        Aucune entrée
                    </div>
                )}
            </div>
        );
    })() : null;

    return (
        <>
            <div className="p-6 border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm overflow-x-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Humeur ({year})</h3>
                    <div className="flex gap-2 text-xs text-muted-foreground items-center">
                        <span>Difficile</span>
                        <div className="w-3 h-3 rounded-sm bg-primary/20"></div>
                        <div className="w-3 h-3 rounded-sm bg-primary/40"></div>
                        <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
                        <div className="w-3 h-3 rounded-sm bg-primary/80"></div>
                        <div className="w-3 h-3 rounded-sm bg-primary"></div>
                        <span>Excellent</span>
                    </div>
                </div>

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
                                    setHoverPos({ x: rect.left, y: rect.top });
                                    setHoveredDay(dayKey);
                                }}
                                onMouseLeave={() => setHoveredDay(null)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Portal : rendu directement dans document.body, hors de tout
                ancêtre avec backdrop-filter/overflow/transform */}
            {mounted && hoverCard && createPortal(hoverCard, document.body)}
        </>
    );
}
