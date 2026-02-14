
import { useFounderStore } from '@/store/founder-store';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ContentCalendar() {
    const { contentIdeas } = useFounderStore();
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
        <div className="flex h-full gap-8 p-4">
            {/* Calendar Section - Focused and Centered */}
            <div className="flex-1 flex flex-col items-center">
                <div className="bg-[#181a24] border border-[#282c3a] rounded-xl p-8 shadow-sm">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md placeholder:text-[#8b8fa3]"
                        modifiers={{ hasContent: (d) => hasContent(d) }}
                        modifiersStyles={{
                            hasContent: {
                                fontWeight: 'bold',
                                textDecoration: 'underline',
                                textDecorationColor: '#6c5ce7',
                                textDecorationThickness: '2px',
                                textUnderlineOffset: '4px'
                            }
                        }}
                    />
                </div>
                <p className="text-[#8b8fa3] text-sm mt-4 italic">
                    Select a date to view or schedule content. Days with content are underlined.
                </p>
            </div>

            {/* Selected Date Details - Side Panel */}
            <div className="w-[400px] bg-[#181a24]/50 rounded-xl border border-[#282c3a] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-[#282c3a] bg-[#181a24]">
                    <h3 className="text-xl font-semibold text-[#e8e9ed]">
                        {date ? date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
                    </h3>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {selectedDateIdeas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-[#8b8fa3] text-sm italic">
                            <Calendar className="w-8 h-8 mb-2 opacity-50" />
                            No content scheduled.
                        </div>
                    ) : (
                        selectedDateIdeas.map(idea => (
                            <Card key={idea.id} className="bg-[#181a24] border-[#282c3a] hover:border-[#6c5ce7]/50 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-[#e8e9ed] text-sm">{idea.title}</h4>
                                        <Badge variant="outline" className="text-[10px] border-[#282c3a] text-[#8b8fa3]">
                                            {idea.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-[10px] bg-[#282c3a] text-[#8b8fa3] hover:bg-[#282c3a]">
                                            {idea.platform}
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
