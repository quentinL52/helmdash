'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mood, useFounderStore } from '@/store/founder-store';
import { CalendarIcon, Save, Smile, Frown, Meh, Angry } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { translations } from '@/lib/translations';

interface JournalEditorProps {
    onSave: (entry: {
        date: string;
        content: string;
        mood: Mood;
        tags: string[];
        blockers?: string;
    }) => void;
    initialDate?: Date;
}

export function JournalEditor({ onSave, initialDate = new Date() }: JournalEditorProps) {
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).journal || {};
    const [date, setDate] = useState<Date>(initialDate || new Date());
    const [content, setContent] = useState('');
    const [mood, setMood] = useState<Mood>('neutral');
    const [tags, setTags] = useState('');
    const [blockers, setBlockers] = useState('');

    const locale = language === 'fr' ? fr : enUS;

    const moodOptions: { value: Mood; label: string; icon: React.ReactNode; color: string }[] = [
        { value: 'great', label: t.moods?.great || 'Great', icon: <Smile className="w-5 h-5" />, color: 'text-green-500' },
        { value: 'good', label: t.moods?.good || 'Good', icon: <Smile className="w-5 h-5" />, color: 'text-emerald-400' },
        { value: 'neutral', label: t.moods?.neutral || 'Neutral', icon: <Meh className="w-5 h-5" />, color: 'text-yellow-500' },
        { value: 'bad', label: t.moods?.bad || 'Bad', icon: <Frown className="w-5 h-5" />, color: 'text-orange-500' },
        { value: 'terrible', label: t.moods?.terrible || 'Terrible', icon: <Angry className="w-5 h-5" />, color: 'text-red-500' },
    ];

    const handleSave = () => {
        if (!date || !content.trim()) return;

        onSave({
            date: date.toISOString(),
            content,
            mood,
            tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
            blockers: blockers.trim() || undefined,
        });

        setContent('');
        setMood('neutral');
        setTags('');
        setBlockers('');
    };

    return (
        <div className="space-y-6 p-6 border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="bg-primary/10 p-2 rounded-lg text-primary">&#9997;&#65039;</span>
                    {t.newEntry || 'New Entry'}
                </h2>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale }) : (t.selectDate || 'Pick a date')}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#181a24] border-[#282c3a]" align="end">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => d && setDate(d)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid gap-6">
                {/* Mood Selector */}
                <div className="space-y-2">
                    <Label>{t.feelingToday || 'How are you feeling today?'}</Label>
                    <div className="flex gap-2 flex-wrap">
                        {moodOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setMood(option.value)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
                                    mood === option.value
                                        ? `border-primary bg-primary/10 ring-2 ring-primary/20 ${option.color}`
                                        : "border-border hover:bg-muted/50 opacity-70 hover:opacity-100"
                                )}
                            >
                                {option.icon}
                                <span className="text-sm font-medium">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <Label>{t.journalEntry || 'Journal Entry'}</Label>
                    <Textarea
                        placeholder={t.placeholder || "What happened today? Any wins? Any struggles?"}
                        className="min-h-[150px] resize-y bg-background/50 focus:bg-background transition-colors"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>

                {/* Blockers */}
                <div className="space-y-2">
                    <Label className="text-destructive/90">{t.blockers || 'Blockers / Frustrations (Optional)'}</Label>
                    <Input
                        placeholder={t.blockersPlaceholder || "What's stopping you from moving forward?"}
                        value={blockers}
                        onChange={(e) => setBlockers(e.target.value)}
                        className="border-destructive/20 focus:border-destructive/50"
                    />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                    <Label>{t.tags || 'Tags (comma separated)'}</Label>
                    <Input
                        placeholder={t.tagsPlaceholder || "product, sales, fundraising..."}
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={handleSave} size="lg" className="gap-2 accent-gradient text-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                    <Save className="w-4 h-4" />
                    {t.saveEntry || 'Save Entry'}
                </Button>
            </div>
        </div>
    );
}
