
import { useFounderStore } from '@/store/founder-store';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ContentCalendar() {
    const contentIdeas = useFounderStore(s => s.contentIdeas);
    const [date, setDate] = useState<Date | undefined>(new Date());

    // Get ideas for the selected date
    const getIdeasForDate = (d: Date) => {
        return contentIdeas.filter(idea => {
            if (!idea.date) return false;
            const ideaDate = new Date(idea.date);
            return ideaDate.getDate() === d.getDate() &&
                ideaDate.getMonth() === d.getMonth() &&
                ideaDate.getFullYear() === d.getFullYear();
        });
    };

    const selectedDateIdeas = date ? getIdeasForDate(date) : [];

    // Function to determine if a day has content (for styling)
    const hasContent = (d: Date) => getIdeasForDate(d).length > 0;

    return (
        <div className="flex flex-col lg:flex-row h-full gap-8 p-4">
            {/* Calendar Section */}
            <div className="flex-1 flex flex-col items-start">
                <div className="bg-card border border-border rounded-xl p-8 shadow-sm w-full max-w-[560px] flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md placeholder:text-muted-foreground"
                        modifiers={{ hasContent: (d) => hasContent(d) }}
                        modifiersStyles={{
                            hasContent: {
                                fontWeight: 'bold',
                                textDecoration: 'underline',
                                textDecorationColor: 'hsl(var(--primary))',
                                textDecorationThickness: '2px',
                                textUnderlineOffset: '4px'
                            }
                        }}
                    />
                </div>
                <p className="text-muted-foreground text-sm mt-4 italic">
                    Select a date to view or schedule content. Days with content are underlined.
                </p>
            </div>

            {/* Selected Date Details - Side Panel */}
            <div className="w-full lg:w-[450px] xl:w-[500px] shrink-0 bg-card/50 rounded-xl border border-border flex flex-col overflow-hidden h-auto lg:min-h-[500px]">
                <div className="p-6 border-b border-border bg-card">
                    <h3 className="text-xl font-semibold text-foreground">
                        {date ? date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
                    </h3>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {selectedDateIdeas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm italic">
                            <Calendar className="w-8 h-8 mb-2 opacity-50" />
                            No content scheduled.
                        </div>
                    ) : (
                        selectedDateIdeas.map(idea => (
                            <Card key={idea.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-foreground text-sm">{idea.title}</h4>
                                        <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                                            {idea.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground hover:bg-muted">
                                            {idea.channel}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
