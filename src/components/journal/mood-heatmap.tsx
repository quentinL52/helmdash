'use client';

import { JournalEntry, Mood } from '@/store/founder-store';
import { eachDayOfInterval, endOfYear, format, getDay, isSameDay, startOfYear, subYears } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MoodHeatmapProps {
    entries: JournalEntry[];
    year?: number; // Defaults to current year
}

const getMoodColor = (mood?: Mood) => {
    switch (mood) {
        case 'great': return 'bg-green-500';
        case 'good': return 'bg-emerald-400';
        case 'neutral': return 'bg-yellow-500';
        case 'bad': return 'bg-orange-500';
        case 'terrible': return 'bg-red-500';
        default: return 'bg-muted-foreground/10'; // Empty
    }
};

export function MoodHeatmap({ entries, year = new Date().getFullYear() }: MoodHeatmapProps) {
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
        <div className="p-6 border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Mood History ({year})</h3>
                <div className="flex gap-2 text-xs text-muted-foreground items-center">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-sm bg-muted-foreground/10"></div>
                    <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                    <div className="w-3 h-3 rounded-sm bg-orange-500"></div>
                    <div className="w-3 h-3 rounded-sm bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                    <span>More</span>
                </div>
            </div>

            <div className="inline-grid grid-rows-7 grid-flow-col gap-1">
                {/* Days labels (Mon, Wed, Fri) - simplified logic for grid */}
                {/* We generally just plot the grid. 7 rows = days of week. Columns = weeks. */}

                {days.map((day) => {
                    const entry = entries.find(e => isSameDay(new Date(e.date), day));
                    return (
                        <TooltipProvider key={day.toISOString()}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className={cn(
                                            "w-3 h-3 rounded-sm transition-colors hover:ring-1 hover:ring-ring cursor-pointer",
                                            getMoodColor(entry?.mood),
                                            !entry && "hover:bg-muted-foreground/20"
                                        )}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-semibold">{format(day, 'MMM d, yyyy')}</p>
                                    {entry ? (
                                        <div className="text-xs">
                                            <p>Mood: {entry.mood}</p>
                                            <p className="opacity-70 truncate max-w-[200px]">{entry.content}</p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">No entry</p>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </div>
        </div>
    );
}
