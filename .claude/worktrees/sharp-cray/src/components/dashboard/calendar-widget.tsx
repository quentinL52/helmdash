'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { useRouter } from 'next/navigation';
import {
    format, addDays, addWeeks, addMonths, addYears,
    subDays, subWeeks, subMonths, subYears,
    startOfWeek, endOfWeek, startOfMonth, endOfMonth,
    isSameDay, isSameMonth, isWithinInterval,
    eachDayOfInterval,
    setQuarter, startOfQuarter, endOfQuarter,
    parseISO, isValid,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X, MapPin, FileText, Target, Clock, Calendar, ExternalLink, Users } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewType = 'day' | 'week' | 'month' | 'semester' | 'year';

interface CalendarEvent {
    id: string;
    type: 'roadmap' | 'content' | 'okr' | 'routine' | 'crm';
    title: string;
    date: Date;
    startDate?: Date;
    endDate?: Date;
    color: string;
    /** For routine events: JS day-of-week (1=Mon … 5=Fri), used for recurring matching */
    recurringDow?: number;
    data: Record<string, unknown>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = {
    bg: '#12141c',
    surface: '#181a24',
    surfaceHover: '#1e2130',
    border: '#282c3a',
    text: '#e8e9ed',
    textMuted: '#8b8fa3',
    textDim: '#5c6078',
    accent: '#6c5ce7',
    accentLight: '#a29bfe',
};

const TYPE_CONFIG: Record<CalendarEvent['type'], { color: string; label: string; icon: React.ReactNode; route: string }> = {
    roadmap: { color: '#a29bfe', label: 'Roadmap', icon: <MapPin size={12} />, route: '/roadmap' },
    content: { color: '#00cec9', label: 'Contenu', icon: <FileText size={12} />, route: '/content' },
    okr: { color: '#fdcb6e', label: 'OKR', icon: <Target size={12} />, route: '/okr' },
    routine: { color: '#00b894', label: 'Routine', icon: <Clock size={12} />, route: '/routine' },
    crm: { color: '#e84393', label: 'CRM', icon: <Users size={12} />, route: '/crm' },
};

const VIEWS: { key: ViewType; label: string }[] = [
    { key: 'day', label: 'Jour' },
    { key: 'week', label: 'Semaine' },
    { key: 'month', label: 'Mois' },
    { key: 'semester', label: 'Semestre' },
    { key: 'year', label: 'Année' },
];

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// ─── Routine day-of-week mapping ──────────────────────────────────────────────
// Routine store IDs → JS getDay() value (0=Sun, 1=Mon … 6=Sat)
const ROUTINE_DOW: Record<string, number> = {
    mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0,
};

// ─── Quarter parsing ──────────────────────────────────────────────────────────

function parseQuarter(quarterStr: string): { start: Date; end: Date } | null {
    // e.g. "Q1 2026", "Q2 2026"
    const match = quarterStr.match(/Q(\d)\s+(\d{4})/i);
    if (!match) return null;
    const q = parseInt(match[1]);
    const year = parseInt(match[2]);
    if (q < 1 || q > 4) return null;
    const ref = setQuarter(new Date(year, 0, 1), q);
    return { start: startOfQuarter(ref), end: endOfQuarter(ref) };
}

// ─── Event aggregation ────────────────────────────────────────────────────────

function useAllEvents(): CalendarEvent[] {
    const roadmap = useFounderStore(s => s.roadmap);
    const contentIdeas = useFounderStore(s => s.contentIdeas);
    const objectives = useFounderStore(s => s.objectives);
    const routineDays = useFounderStore(s => s.routine);
    const contacts = useFounderStore(s => s.contacts);
    const today = useMemo(() => new Date(), []);

    return useMemo(() => {
        const events: CalendarEvent[] = [];

        // Roadmap items with dueDate
        roadmap.forEach(item => {
            if (item.dueDate) {
                const due = parseISO(item.dueDate);
                if (isValid(due)) {
                    const start = item.startDate ? parseISO(item.startDate) : undefined;
                    events.push({
                        id: `roadmap-${item.id}`,
                        type: 'roadmap',
                        title: item.title,
                        date: due,
                        startDate: start && isValid(start) ? start : undefined,
                        endDate: due,
                        color: TYPE_CONFIG.roadmap.color,
                        data: item as unknown as Record<string, unknown>,
                    });
                }
            }
        });

        // Content — scheduled items with a date
        contentIdeas.forEach(idea => {
            if (idea.status === 'scheduled' && idea.date) {
                const d = parseISO(idea.date);
                if (isValid(d)) {
                    events.push({
                        id: `content-${idea.id}`,
                        type: 'content',
                        title: idea.title,
                        date: d,
                        color: TYPE_CONFIG.content.color,
                        data: idea as unknown as Record<string, unknown>,
                    });
                }
            }
        });

        // OKRs — sur la date d'échéance si définie, sinon fin de trimestre
        objectives.forEach(obj => {
            let eventDate: Date | null = null;

            if (obj.endDate) {
                const d = parseISO(obj.endDate);
                if (isValid(d)) eventDate = d;
            }

            if (!eventDate) {
                // Fallback : dernier jour du trimestre
                const range = parseQuarter(obj.quarter);
                if (range) eventDate = range.end;
            }

            if (eventDate) {
                events.push({
                    id: `okr-${obj.id}`,
                    type: 'okr',
                    title: obj.title,
                    date: eventDate,
                    color: TYPE_CONFIG.okr.color,
                    data: obj as unknown as Record<string, unknown>,
                });
            }
        });

        // Routine — recurring weekly events, matched by day-of-week
        routineDays.forEach((day: { id: string; day: string; tasks: { id: string; text: string; done: boolean }[] }) => {
            const dow = ROUTINE_DOW[day.id];
            if (dow === undefined) return;
            day.tasks.forEach((task: { id: string; text: string; done: boolean }) => {
                events.push({
                    id: `routine-${day.id}-${task.id}`,
                    type: 'routine',
                    title: task.text,
                    date: today, // fallback date (not used for matching)
                    recurringDow: dow,
                    color: TYPE_CONFIG.routine.color,
                    data: { ...task, day: day.day, dow } as unknown as Record<string, unknown>,
                });
            });
        });

        // CRM — contacts avec nextFollowUpDate
        contacts.forEach(contact => {
            if (contact.nextFollowUpDate) {
                const d = parseISO(contact.nextFollowUpDate);
                if (isValid(d)) {
                    events.push({
                        id: `crm-${contact.id}`,
                        type: 'crm',
                        title: contact.name,
                        date: d,
                        color: TYPE_CONFIG.crm.color,
                        data: contact as unknown as Record<string, unknown>,
                    });
                }
            }
        });

        return events;
    }, [roadmap, contentIdeas, objectives, routineDays, contacts, today]);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
    const dow = day.getDay(); // 0=Sun … 6=Sat
    return events.filter(ev => {
        // Recurring routine: match by day-of-week, Mon–Fri only
        if (ev.recurringDow !== undefined) {
            return ev.recurringDow === dow;
        }
        // Range events (OKR, roadmap with startDate+endDate)
        if (ev.startDate && ev.endDate) {
            return isWithinInterval(day, { start: ev.startDate, end: ev.endDate });
        }
        // Punctual events
        return isSameDay(ev.date, day);
    });
}

// ─── Priority sorting ─────────────────────────────────────────────────────────

/**
 * Lower score = higher priority (shown first).
 * Roadmap:  high=0, medium=1, low=2
 * OKR:      behind=0, risk=1, on-track=2, completed=3
 * Content:  scheduled=0, draft=1, idea=2, published=3
 * Routine:  always last = 10
 */
function getPriorityScore(ev: CalendarEvent): number {
    switch (ev.type) {
        case 'roadmap': {
            const p = (ev.data.priority as string) ?? 'medium';
            return p === 'high' ? 0 : p === 'medium' ? 1 : 2;
        }
        case 'okr': {
            const s = (ev.data.status as string) ?? 'on-track';
            return s === 'behind' ? 0 : s === 'risk' ? 1 : s === 'on-track' ? 2 : 3;
        }
        case 'content': {
            const s = (ev.data.status as string) ?? 'idea';
            return s === 'scheduled' ? 0 : s === 'draft' ? 1 : s === 'idea' ? 2 : 3;
        }
        case 'routine':
            return 10;
        case 'crm':
            return 5;
    }
}

function sortByPriority(evs: CalendarEvent[]): CalendarEvent[] {
    return [...evs].sort((a, b) => getPriorityScore(a) - getPriorityScore(b));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OverflowPopover({
    hiddenEvents,
    onEventClick,
    label,
}: {
    hiddenEvents: CalendarEvent[];
    onEventClick: (ev: CalendarEvent) => void;
    label: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    return (
        <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    fontSize: '10px', color: COLORS.accentLight,
                    background: `${COLORS.accent}15`, border: `1px solid ${COLORS.accent}30`,
                    borderRadius: '3px', padding: '1px 5px',
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                    transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${COLORS.accent}25`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${COLORS.accent}15`; }}
            >
                {label}
            </button>
            {open && (
                <div style={{
                    position: 'absolute', bottom: '100%', left: 0,
                    marginBottom: '4px', zIndex: 50,
                    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px', padding: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    minWidth: '160px', maxWidth: '220px',
                    display: 'flex', flexDirection: 'column', gap: '3px',
                }}>
                    {hiddenEvents.map(ev => (
                        <button
                            key={ev.id}
                            onClick={() => { onEventClick(ev); setOpen(false); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                padding: '4px 6px', borderRadius: '4px',
                                background: `${ev.color}15`, border: `1px solid ${ev.color}30`,
                                cursor: 'pointer', textAlign: 'left', width: '100%',
                                fontSize: '11px', color: COLORS.text,
                                overflow: 'hidden', whiteSpace: 'nowrap',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${ev.color}30`; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${ev.color}15`; }}
                        >
                            <span style={{ color: ev.color, flexShrink: 0, display: 'flex' }}>
                                {TYPE_CONFIG[ev.type].icon}
                            </span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ev.title}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function EventBadge({ event, onClick }: { event: CalendarEvent; onClick: (e: CalendarEvent) => void }) {
    return (
        <button
            onClick={() => onClick(event)}
            title={event.title}
            style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                padding: '1px 4px', borderRadius: '3px',
                fontSize: '10px', lineHeight: '14px',
                background: `${event.color}20`, color: event.color,
                border: `1px solid ${event.color}40`,
                cursor: 'pointer', width: '100%', textAlign: 'left',
                overflow: 'hidden', whiteSpace: 'nowrap',
                transition: 'background 0.15s',
                flexShrink: 0,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${event.color}35`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${event.color}20`; }}
        >
            <span style={{ flexShrink: 0, display: 'flex' }}>{TYPE_CONFIG[event.type].icon}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{event.title}</span>
        </button>
    );
}

// ─── Views ────────────────────────────────────────────────────────────────────

function DayView({ current, events, onEventClick }: { current: Date; events: CalendarEvent[]; onEventClick: (e: CalendarEvent) => void }) {
    const dayEvents = getEventsForDay(events, current);
    return (
        <div style={{ padding: '16px', minHeight: '320px' }}>
            <div style={{ fontSize: '14px', color: COLORS.textMuted, marginBottom: '16px' }}>
                {format(current, 'EEEE d MMMM yyyy', { locale: fr })}
            </div>
            {dayEvents.length === 0 ? (
                <div style={{ color: COLORS.textDim, fontSize: '13px', textAlign: 'center', paddingTop: '60px' }}>
                    Aucun événement ce jour
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dayEvents.map(ev => (
                        <button
                            key={ev.id}
                            onClick={() => onEventClick(ev)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 16px', borderRadius: '8px',
                                background: `${ev.color}15`, border: `1px solid ${ev.color}35`,
                                cursor: 'pointer', textAlign: 'left', width: '100%',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${ev.color}25`; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${ev.color}15`; }}
                        >
                            <span style={{ color: ev.color, flexShrink: 0 }}>{TYPE_CONFIG[ev.type].icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', color: COLORS.text, fontWeight: 500 }}>{ev.title}</div>
                                <div style={{ fontSize: '11px', color: ev.color, marginTop: '2px' }}>{TYPE_CONFIG[ev.type].label}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function WeekView({ current, events, onEventClick }: { current: Date; events: CalendarEvent[]; onEventClick: (e: CalendarEvent) => void }) {
    const weekStart = startOfWeek(current, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const today = new Date();

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', padding: '16px' }}>
            {days.map((day, i) => {
                const dayEvents = sortByPriority(getEventsForDay(events, day));
                const isToday = isSameDay(day, today);
                return (
                    <div key={i} style={{
                        height: '160px',          /* ← hauteur fixe */
                        display: 'flex', flexDirection: 'column',
                        padding: '8px 6px', borderRadius: '8px',
                        background: isToday ? `${COLORS.accent}10` : COLORS.surfaceHover,
                        border: `1px solid ${isToday ? COLORS.accent + '50' : COLORS.border}`,
                        overflow: 'hidden',
                    }}>
                        {/* Header jour fixe */}
                        <div style={{ flexShrink: 0, textAlign: 'center', marginBottom: '6px' }}>
                            <div style={{ fontSize: '11px', color: isToday ? COLORS.accent : COLORS.textMuted, fontWeight: 600 }}>
                                {DAYS_FR[i]}
                            </div>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: '24px', height: '24px', borderRadius: '50%', fontSize: '13px',
                                fontWeight: isToday ? 700 : 400,
                                background: isToday ? COLORS.accent : 'transparent',
                                color: isToday ? '#fff' : COLORS.text,
                                margin: '2px auto 0',
                            }}>
                                {format(day, 'd')}
                            </div>
                        </div>
                        {/* Events — zone scrollable masquée */}
                        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {dayEvents.slice(0, 4).map(ev => (
                                <EventBadge key={ev.id} event={ev} onClick={onEventClick} />
                            ))}
                            {dayEvents.length > 4 && (
                                <OverflowPopover
                                    hiddenEvents={dayEvents.slice(4)}
                                    onEventClick={onEventClick}
                                    label={`+${dayEvents.length - 4} autres`}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function MonthView({ current, events, onEventClick }: { current: Date; events: CalendarEvent[]; onEventClick: (e: CalendarEvent) => void }) {
    const today = new Date();
    const monthStart = startOfMonth(current);
    const monthEnd = endOfMonth(current);

    // Build explicit weeks: each week is an array of 7 days Mon→Sun
    const firstMonday = startOfWeek(monthStart, { weekStartsOn: 1 });
    const lastSunday = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const allDays = eachDayOfInterval({ start: firstMonday, end: lastSunday });
    // Chunk into weeks of 7
    const weeks: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
        weeks.push(allDays.slice(i, i + 7));
    }

    return (
        <div style={{ padding: '16px' }}>
            {/* Day-of-week header */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '2px', marginBottom: '4px',
            }}>
                {DAYS_FR.map(d => (
                    <div key={d} style={{
                        textAlign: 'center', fontSize: '11px',
                        color: COLORS.textMuted, fontWeight: 600, padding: '4px 0',
                    }}>{d}</div>
                ))}
            </div>

            {/* Weeks rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {weeks.map((week, wi) => (
                    <div key={wi} style={{
                        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px',
                    }}>
                        {week.map((day, di) => {
                            const dayEvents = sortByPriority(getEventsForDay(events, day));
                            const isToday = isSameDay(day, today);
                            const inMonth = isSameMonth(day, current);
                            // Calcul du nombre max d'events affichables dans la hauteur fixe
                            // Hauteur cellule = 110px, header = 26px, gap = 3px, chaque badge = 16px
                            const CELL_H = 110;
                            const HEADER_H = 26;
                            const GAP = 1;
                            const BADGE_H = 16;
                            const availableH = CELL_H - HEADER_H - 4; // 4px padding bas
                            const maxVisible = Math.max(1, Math.floor(availableH / (BADGE_H + GAP)));
                            const visible = dayEvents.slice(0, maxVisible);
                            const overflow = dayEvents.length - maxVisible;

                            return (
                                <div key={di} style={{
                                    height: `${CELL_H}px`,   /* hauteur strictement fixe */
                                    display: 'flex', flexDirection: 'column',
                                    padding: '4px',
                                    borderRadius: '6px',
                                    background: isToday
                                        ? `${COLORS.accent}15`
                                        : inMonth ? COLORS.surfaceHover : 'transparent',
                                    border: `1px solid ${isToday
                                        ? COLORS.accent + '50'
                                        : inMonth ? COLORS.border : 'transparent'}`,
                                    opacity: inMonth ? 1 : 0.35,
                                    overflow: 'hidden',
                                    boxSizing: 'border-box',
                                }}>
                                    {/* Numéro du jour — hauteur fixe */}
                                    <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', marginBottom: '3px' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                            width: '20px', height: '20px', borderRadius: '50%', fontSize: '11px',
                                            fontWeight: isToday ? 700 : 400,
                                            background: isToday ? COLORS.accent : 'transparent',
                                            color: isToday ? '#fff' : inMonth ? COLORS.text : COLORS.textDim,
                                        }}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>

                                    {/* Événements visibles */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px`, flex: 1, overflow: 'hidden' }}>
                                        {visible.map(ev => (
                                            <EventBadge key={ev.id} event={ev} onClick={onEventClick} />
                                        ))}
                                        {overflow > 0 && (
                                            <OverflowPopover
                                                hiddenEvents={dayEvents.slice(maxVisible)}
                                                onEventClick={onEventClick}
                                                label={`+${overflow} autre${overflow > 1 ? 's' : ''}`}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

function SemesterView({ current, events, onEventClick }: { current: Date; events: CalendarEvent[]; onEventClick: (e: CalendarEvent) => void }) {
    // Show 6 months starting from current month
    const months = Array.from({ length: 6 }, (_, i) => addMonths(startOfMonth(current), i));

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '16px' }}>
            {months.map((month, mi) => {
                // Collect all events in this month
                const monthStart = startOfMonth(month);
                const monthEnd = endOfMonth(month);
                const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
                const monthEventsRaw: CalendarEvent[] = [];
                const seen = new Set<string>();
                monthDays.forEach(day => {
                    getEventsForDay(events, day).forEach(ev => {
                        if (!seen.has(ev.id)) {
                            seen.add(ev.id);
                            monthEventsRaw.push(ev);
                        }
                    });
                });
                const monthEvents = sortByPriority(monthEventsRaw);

                return (
                    <div key={mi} style={{
                        padding: '12px', borderRadius: '8px',
                        background: COLORS.surfaceHover, border: `1px solid ${COLORS.border}`,
                    }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: COLORS.text, marginBottom: '8px', textTransform: 'capitalize' }}>
                            {format(month, 'MMMM yyyy', { locale: fr })}
                        </div>
                        {monthEvents.length === 0 ? (
                            <div style={{ fontSize: '11px', color: COLORS.textDim, fontStyle: 'italic' }}>Aucun événement</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {monthEvents.slice(0, 5).map(ev => (
                                    <button
                                        key={ev.id}
                                        onClick={() => onEventClick(ev)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '4px 6px', borderRadius: '4px',
                                            background: `${ev.color}15`, border: `1px solid ${ev.color}30`,
                                            cursor: 'pointer', textAlign: 'left', width: '100%',
                                        }}
                                    >
                                        <span style={{ color: ev.color, flexShrink: 0 }}>{TYPE_CONFIG[ev.type].icon}</span>
                                        <span style={{ fontSize: '11px', color: COLORS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {ev.title}
                                        </span>
                                    </button>
                                ))}
                                {monthEvents.length > 5 && (
                                    <OverflowPopover
                                        hiddenEvents={monthEvents.slice(5)}
                                        onEventClick={onEventClick}
                                        label={`+${monthEvents.length - 5} autres`}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function YearView({ current, events, onEventClick }: { current: Date; events: CalendarEvent[]; onEventClick: (e: CalendarEvent) => void }) {
    const year = current.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '16px' }}>
            {months.map((month, mi) => {
                const monthStart = startOfMonth(month);
                const monthEnd = endOfMonth(month);
                const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
                const seen = new Set<string>();
                const monthEventsRaw: CalendarEvent[] = [];
                monthDays.forEach(day => {
                    getEventsForDay(events, day).forEach(ev => {
                        if (!seen.has(ev.id)) { seen.add(ev.id); monthEventsRaw.push(ev); }
                    });
                });
                const monthEvents = sortByPriority(monthEventsRaw);
                const byType = monthEvents.reduce<Record<string, number>>((acc, ev) => {
                    acc[ev.type] = (acc[ev.type] || 0) + 1;
                    return acc;
                }, {});

                return (
                    <div key={mi} style={{
                        padding: '10px', borderRadius: '8px',
                        background: COLORS.surfaceHover, border: `1px solid ${COLORS.border}`,
                    }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: COLORS.text, marginBottom: '6px', textTransform: 'capitalize' }}>
                            {format(month, 'MMMM', { locale: fr })}
                        </div>
                        {monthEvents.length === 0 ? (
                            <div style={{ fontSize: '10px', color: COLORS.textDim }}>—</div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                    {(Object.entries(byType) as [CalendarEvent['type'], number][]).map(([type, count]) => (
                                        <span key={type} style={{
                                            fontSize: '10px', padding: '1px 5px', borderRadius: '3px',
                                            background: `${TYPE_CONFIG[type].color}20`, color: TYPE_CONFIG[type].color,
                                        }}>
                                            {count} {TYPE_CONFIG[type].label}
                                        </span>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {monthEvents.slice(0, 3).map(ev => (
                                        <button
                                            key={ev.id}
                                            onClick={() => onEventClick(ev)}
                                            style={{
                                                fontSize: '10px', color: ev.color,
                                                background: 'none', border: 'none',
                                                cursor: 'pointer', textAlign: 'left', padding: '0',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}
                                        >
                                            · {ev.title}
                                        </button>
                                    ))}
                                    {monthEvents.length > 3 && (
                                        <OverflowPopover
                                            hiddenEvents={monthEvents.slice(3)}
                                            onEventClick={onEventClick}
                                            label={`+${monthEvents.length - 3}`}
                                        />
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function EventDetailPanel({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
    const router = useRouter();
    const cfg = TYPE_CONFIG[event.type];
    const data = event.data;

    return (
        <div style={{
            position: 'absolute', right: '0', top: '0', bottom: '0',
            width: '320px', background: COLORS.surface,
            border: `1px solid ${COLORS.border}`, borderRadius: '12px',
            padding: '20px', zIndex: 10,
            boxShadow: '-4px 0 24px rgba(0,0,0,0.4)',
            display: 'flex', flexDirection: 'column', gap: '16px',
            overflowY: 'auto',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                    background: `${cfg.color}20`, color: cfg.color, fontWeight: 600,
                }}>
                    {cfg.icon} {cfg.label}
                </span>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textMuted, padding: '4px' }}
                >
                    <X size={16} />
                </button>
            </div>

            {/* Title */}
            <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: COLORS.text, margin: 0 }}>{event.title}</h3>
                {(data.description as string) && (
                    <p style={{ fontSize: '12px', color: COLORS.textMuted, marginTop: '6px', lineHeight: 1.5 }}>
                        {data.description as string}
                    </p>
                )}
            </div>

            {/* Dates */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {event.startDate && (
                    <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                        <span style={{ color: COLORS.textDim }}>Début : </span>
                        {format(event.startDate, 'd MMM yyyy', { locale: fr })}
                    </div>
                )}
                {event.endDate && (
                    <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                        <span style={{ color: COLORS.textDim }}>{event.startDate ? 'Fin : ' : 'Date : '}</span>
                        {format(event.endDate, 'd MMM yyyy', { locale: fr })}
                    </div>
                )}
                {!event.startDate && !event.endDate && (
                    <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                        <span style={{ color: COLORS.textDim }}>Date : </span>
                        {format(event.date, 'd MMM yyyy', { locale: fr })}
                    </div>
                )}
            </div>

            {/* Status / extra info */}
            {(data.company as string) && (
                <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                    <span style={{ color: COLORS.textDim }}>Entreprise : </span>
                    <span style={{ color: COLORS.text }}>{data.company as string}</span>
                </div>
            )}
            {(data.role as string) && (
                <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                    <span style={{ color: COLORS.textDim }}>Rôle : </span>
                    <span style={{ color: COLORS.text }}>{data.role as string}</span>
                </div>
            )}
            {(data.status as string) && (
                <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                    <span style={{ color: COLORS.textDim }}>Statut : </span>
                    <span style={{ color: COLORS.text }}>{data.status as string}</span>
                </div>
            )}
            {(data.priority as string) && (
                <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                    <span style={{ color: COLORS.textDim }}>Priorité : </span>
                    <span style={{ color: COLORS.text }}>{data.priority as string}</span>
                </div>
            )}
            {(data.platform as string) && (
                <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                    <span style={{ color: COLORS.textDim }}>Plateforme : </span>
                    <span style={{ color: COLORS.text }}>{data.platform as string}</span>
                </div>
            )}
            {(data.quarter as string) && (
                <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                    <span style={{ color: COLORS.textDim }}>Trimestre : </span>
                    <span style={{ color: COLORS.text }}>{data.quarter as string}</span>
                </div>
            )}
            {(data.day as string) && (
                <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                    <span style={{ color: COLORS.textDim }}>Jour : </span>
                    <span style={{ color: COLORS.text }}>{data.day as string}</span>
                </div>
            )}

            {/* Navigation link */}
            {event.type !== 'routine' && (
                <button
                    onClick={() => router.push(cfg.route)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 14px', borderRadius: '8px', fontSize: '12px',
                        background: `${cfg.color}15`, color: cfg.color,
                        border: `1px solid ${cfg.color}35`, cursor: 'pointer',
                        marginTop: 'auto',
                    }}
                >
                    <ExternalLink size={12} />
                    Voir dans {cfg.label}
                </button>
            )}
        </div>
    );
}

// ─── Navigation helpers ───────────────────────────────────────────────────────

function formatPeriodLabel(view: ViewType, current: Date): string {
    switch (view) {
        case 'day':
            return format(current, 'd MMMM yyyy', { locale: fr });
        case 'week': {
            const ws = startOfWeek(current, { weekStartsOn: 1 });
            const we = endOfWeek(current, { weekStartsOn: 1 });
            return `${format(ws, 'd MMM', { locale: fr })} – ${format(we, 'd MMM yyyy', { locale: fr })}`;
        }
        case 'month':
            return format(current, 'MMMM yyyy', { locale: fr });
        case 'semester': {
            const end = addMonths(current, 5);
            return `${format(current, 'MMM', { locale: fr })} – ${format(end, 'MMM yyyy', { locale: fr })}`;
        }
        case 'year':
            return current.getFullYear().toString();
    }
}

function navigate(view: ViewType, current: Date, dir: 1 | -1): Date {
    switch (view) {
        case 'day': return dir === 1 ? addDays(current, 1) : subDays(current, 1);
        case 'week': return dir === 1 ? addWeeks(current, 1) : subWeeks(current, 1);
        case 'month': return dir === 1 ? addMonths(current, 1) : subMonths(current, 1);
        case 'semester': return dir === 1 ? addMonths(current, 6) : subMonths(current, 6);
        case 'year': return dir === 1 ? addYears(current, 1) : subYears(current, 1);
    }
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export function CalendarWidget() {
    const [view, setView] = useState<ViewType>('month');
    const [current, setCurrent] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const events = useAllEvents();

    const handlePrev = useCallback(() => setCurrent(d => navigate(view, d, -1)), [view]);
    const handleNext = useCallback(() => setCurrent(d => navigate(view, d, 1)), [view]);
    const handleToday = useCallback(() => setCurrent(new Date()), []);

    const label = formatPeriodLabel(view, current);

    return (
        <div style={{
            background: COLORS.surface, border: `1px solid ${COLORS.border}`,
            borderRadius: '12px', overflow: 'hidden', position: 'relative',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderBottom: `1px solid ${COLORS.border}`,
                flexWrap: 'wrap', gap: '12px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} style={{ color: COLORS.accentLight }} />
                    <span style={{ fontSize: '15px', fontWeight: 600, color: COLORS.text }}>Calendrier</span>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={handlePrev}
                        style={{
                            background: COLORS.surfaceHover, border: `1px solid ${COLORS.border}`,
                            borderRadius: '6px', padding: '4px 8px', color: COLORS.textMuted,
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                        }}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={handleToday}
                        style={{
                            background: COLORS.surfaceHover, border: `1px solid ${COLORS.border}`,
                            borderRadius: '6px', padding: '4px 12px', color: COLORS.text,
                            cursor: 'pointer', fontSize: '13px', minWidth: '180px', textAlign: 'center',
                            fontWeight: 500, textTransform: 'capitalize',
                        }}
                    >
                        {label}
                    </button>
                    <button
                        onClick={handleNext}
                        style={{
                            background: COLORS.surfaceHover, border: `1px solid ${COLORS.border}`,
                            borderRadius: '6px', padding: '4px 8px', color: COLORS.textMuted,
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                        }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* View tabs */}
                <div style={{ display: 'flex', gap: '4px', background: COLORS.bg, borderRadius: '8px', padding: '3px' }}>
                    {VIEWS.map(v => (
                        <button
                            key={v.key}
                            onClick={() => setView(v.key)}
                            style={{
                                padding: '5px 12px', borderRadius: '6px', fontSize: '12px',
                                fontWeight: 500, cursor: 'pointer', border: 'none',
                                background: view === v.key ? COLORS.accent : 'transparent',
                                color: view === v.key ? '#fff' : COLORS.textMuted,
                                transition: 'all 0.15s',
                            }}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex', gap: '16px', padding: '10px 20px',
                borderBottom: `1px solid ${COLORS.border}`, flexWrap: 'wrap',
            }}>
                {(Object.entries(TYPE_CONFIG) as [CalendarEvent['type'], typeof TYPE_CONFIG['roadmap']][]).map(([type, cfg]) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.color }} />
                        <span style={{ fontSize: '11px', color: COLORS.textMuted }}>{cfg.label}</span>
                    </div>
                ))}
            </div>

            {/* Calendar body */}
            <div style={{ position: 'relative', minHeight: '320px' }}>
                {view === 'day' && <DayView current={current} events={events} onEventClick={setSelectedEvent} />}
                {view === 'week' && <WeekView current={current} events={events} onEventClick={setSelectedEvent} />}
                {view === 'month' && <MonthView current={current} events={events} onEventClick={setSelectedEvent} />}
                {view === 'semester' && <SemesterView current={current} events={events} onEventClick={setSelectedEvent} />}
                {view === 'year' && <YearView current={current} events={events} onEventClick={setSelectedEvent} />}

                {selectedEvent && (
                    <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
                )}
            </div>
        </div>
    );
}
