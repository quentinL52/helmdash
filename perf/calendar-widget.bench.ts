import { isWithinInterval, isSameDay } from 'date-fns';

interface CalendarEvent {
    id: string;
    type: 'roadmap' | 'content' | 'okr' | 'routine' | 'crm' | 'google';
    title: string;
    date: Date;
    startDate?: Date;
    endDate?: Date;
    color: string;
    recurringDow?: number;
    data: Record<string, unknown>;
}

function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
    const dow = day.getDay();
    return events.filter(ev => {
        if (ev.recurringDow !== undefined) {
            return ev.recurringDow === dow;
        }
        if (ev.startDate && ev.endDate) {
            return isWithinInterval(day, { start: ev.startDate, end: ev.endDate });
        }
        return isSameDay(ev.date, day);
    });
}

function runOldLogic(events: CalendarEvent[], monthDays: Date[]) {
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
    return monthEventsRaw;
}

function runNewLogic(events: CalendarEvent[], monthDays: Date[]) {
    if (monthDays.length === 0) return [];

    const start = monthDays[0];
    const end = monthDays[monthDays.length - 1];

    // Instead of filtering the whole events array for EACH day (O(N * M)),
    // we filter events ONCE that fall within the month's interval.
    // For a month view or year view, we can just do one pass over events
    // and check if they intersect the month interval.

    return events.filter(ev => {
        if (ev.recurringDow !== undefined) {
            // A recurring event occurs if there's any day in monthDays matching the DoW
            return monthDays.some(day => day.getDay() === ev.recurringDow);
        }
        if (ev.startDate && ev.endDate) {
             // Intersects with [start, end]
             return ev.startDate <= end && ev.endDate >= start;
        }
        return ev.date >= start && ev.date <= end;
    });
}

// generate test data
const events: CalendarEvent[] = [];
for (let i = 0; i < 1000; i++) {
    const isRecurring = i % 5 === 0;
    const isRange = i % 7 === 0;
    events.push({
        id: `ev-${i}`,
        type: 'roadmap',
        title: `Event ${i}`,
        date: new Date(2023, 5, 15 + (i % 30)),
        recurringDow: isRecurring ? (i % 5) + 1 : undefined,
        startDate: isRange ? new Date(2023, 5, 10 + (i % 10)) : undefined,
        endDate: isRange ? new Date(2023, 5, 20 + (i % 10)) : undefined,
        color: '#fff',
        data: {}
    });
}

const monthDays: Date[] = [];
for (let i = 1; i <= 31; i++) {
    monthDays.push(new Date(2023, 5, i));
}

const startOld = performance.now();
for (let i = 0; i < 100; i++) {
    runOldLogic(events, monthDays);
}
const endOld = performance.now();
console.log(`Old logic: ${endOld - startOld}ms`);

const startNew = performance.now();
for (let i = 0; i < 100; i++) {
    runNewLogic(events, monthDays);
}
const endNew = performance.now();
console.log(`New logic: ${endNew - startNew}ms`);
