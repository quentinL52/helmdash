'use client';

import dynamic from 'next/dynamic';
import { useFounderStore } from '@/store/founder-store';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, AlertCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardSkeleton, ChartSkeleton } from '@/components/ui/loading-skeleton';

// Lazy load heavy components
const JournalEditor = dynamic(
    () => import('@/components/journal/journal-editor').then(m => m.JournalEditor),
    { loading: () => <CardSkeleton /> }
);
const MoodHeatmap = dynamic(
    () => import('@/components/journal/mood-heatmap').then(m => m.MoodHeatmap),
    { loading: () => <ChartSkeleton /> }
);

export default function JournalPage() {
    const journalEntries = useFounderStore(s => s.journalEntries);
    const addJournalEntry = useFounderStore(s => s.addJournalEntry);
    const deleteJournalEntry = useFounderStore(s => s.deleteJournalEntry);

    // Filtrer : uniquement les entrées de la semaine en cours (lundi → dimanche)
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const sortedEntries = [...journalEntries]
        .filter(entry => isWithinInterval(new Date(entry.date), { start: weekStart, end: weekEnd }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Journal de Bord</h1>
                <p className="text-muted-foreground">
                    Suivez votre progression, célébrez vos victoires et documentez vos blocages pour votre Coach IA.
                </p>
            </div>

            {/* Heatmap Section */}
            <MoodHeatmap entries={journalEntries} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Editor (New Entry) */}
                <div className="lg:col-span-7 space-y-6">
                    <JournalEditor
                        onSave={(entry) => addJournalEntry(entry)}
                    />
                </div>

                {/* Right Column: Recent Entries Stream */}
                <div className="lg:col-span-5 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        Entrées de la semaine
                    </h2>

                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                            {sortedEntries.length === 0 ? (
                                <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                                    <p>Aucune entrée cette semaine.</p>
                                </div>
                            ) : (
                                sortedEntries.map((entry) => (
                                    <Card key={entry.id} className="bg-card/50 backdrop-blur-sm">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col">
                                                    <CardTitle className="text-base font-medium">
                                                        {format(new Date(entry.date), 'd MMMM yyyy', { locale: fr })}
                                                    </CardTitle>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(entry.date), 'EEEE', { locale: fr })}
                                                    </span>
                                                </div>
                                                <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                                                    {entry.mood}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors -mr-2 -mt-1"
                                                    onClick={() => deleteJournalEntry(entry.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                                {entry.content}
                                            </p>

                                            {entry.blockers && (
                                                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md text-sm text-destructive-foreground">
                                                    <div className="flex items-center gap-2 font-semibold mb-1">
                                                        <AlertCircle className="w-4 h-4" />
                                                        Blocage :
                                                    </div>
                                                    {entry.blockers}
                                                </div>
                                            )}

                                            {entry.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 pt-2">
                                                    {entry.tags.map(tag => (
                                                        <Badge key={tag} variant="secondary" className="text-xs">
                                                            #{tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
