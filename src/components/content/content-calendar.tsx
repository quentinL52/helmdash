
import { useFounderStore } from '@/store/founder-store';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ContentCalendar() {
    const { contentIdeas } = useFounderStore();
    const [date, setDate] = useState<Date | undefined>(new Date());

    // Get ideas for the selected date
    const selectedDateIdeas = contentIdeas.filter(idea => {
        if (!idea.date || !date) return false;
        const ideaDate = new Date(idea.date);
        return ideaDate.getDate() === date.getDate() &&
            ideaDate.getMonth() === date.getMonth() &&
            ideaDate.getFullYear() === date.getFullYear();
    });

    return (
        <div className="flex h-full gap-6">
            <div className="w-[350px] shrink-0">
                <div className="bg-[#181a24] border border-[#282c3a] rounded-xl p-4">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md placeholder:text-[#8b8fa3]"
                    />
                </div>
            </div>

            <div className="flex-1 bg-[#181a24]/30 rounded-xl border border-[#282c3a] p-6">
                <h3 className="text-xl font-semibold text-[#e8e9ed] mb-4">
                    {date ? date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select a date'}
                </h3>

                {selectedDateIdeas.length === 0 ? (
                    <div className="text-[#8b8fa3] text-sm italic">
                        No content scheduled for this day.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {selectedDateIdeas.map(idea => (
                            <Card key={idea.id} className="bg-[#181a24] border-[#282c3a]">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-[#e8e9ed]">{idea.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs border-[#282c3a] text-[#8b8fa3]">
                                                {idea.platform}
                                            </Badge>
                                            <span className="text-xs text-[#8b8fa3] capitalize">
                                                Status: {idea.status}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Actions could go here */}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
