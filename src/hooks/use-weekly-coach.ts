import { useState, useCallback } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { generateWeeklyReport } from '@/ai/flows/weekly-coach-flow';
import { toast } from '@/hooks/use-toast';

export function useWeeklyCoach() {
    const weeklyReport = useFounderStore(s => s.weeklyReport);
    const setWeeklyReport = useFounderStore(s => s.setWeeklyReport);
    const [isGenerating, setIsGenerating] = useState(false);

    const getPreviousMonday = (date = new Date()) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const checkAndGenerateReport = useCallback(async (force = false) => {
        const today = new Date();
        const currentMonday = getPreviousMonday(today);
        const dateString = currentMonday.toISOString().split('T')[0];

        // Read fresh state inside the callback
        const state = useFounderStore.getState();

        // Check if report already exists for this week
        if (!force && state.weeklyReport && state.weeklyReport.date === dateString && state.weeklyReport.status === 'generated') {
            return;
        }

        // Only auto-generate on Mondays (or if forced)
        const isMonday = today.getDay() === 1;
        if (!force && !isMonday && !state.weeklyReport) {
            return;
        }

        setIsGenerating(true);
        try {
            // Gather Data
            // Filter Journal Entries for the last 7 days
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 7);

            const recentJournal = state.journalEntries.filter(entry => new Date(entry.date) >= oneWeekAgo);

            // Calculate Routine Consistency (simple mock logic for now)
            const routineConsistency = "Not tracked yet"; // Placeholder until routine history is robust

            const input = {
                mondayDate: dateString,
                hypotheses: state.hypotheses.map(h => ({ hypothesis: h.statement, status: h.status })),
                objectives: state.objectives.map(o => ({ title: o.title, progress: o.progress, status: o.progress >= 100 ? 'Completed' : 'In Progress' })),
                journalEntries: recentJournal.map(j => ({ content: j.content, mood: j.mood, date: j.date, tags: j.tags })),
                routineConsistency,
                weeklyFocus: state.weeklyReport?.date === dateString ? undefined : "Focus on growth",
                language: state.language,
            };

            const result = await generateWeeklyReport(input);

            setWeeklyReport({
                id: crypto.randomUUID(),
                date: dateString,
                content: result.report,
                status: 'generated',
                createdAt: new Date().toISOString(),
            });

            toast({
                title: "Weekly Report Ready",
                description: "Your AI coach has generated your weekly strategy.",
            });
        } catch (error) {
            console.error('Failed to generate report:', error);
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: "Could not generate weekly report. Please try again.",
            });
            setWeeklyReport({
                id: crypto.randomUUID(),
                date: dateString,
                content: '',
                status: 'failed',
                createdAt: new Date().toISOString(),
            });
        } finally {
            setIsGenerating(false);
        }
    }, [setWeeklyReport]);

    return {
        weeklyReport,
        isGenerating,
        generateReport: () => checkAndGenerateReport(true),
    };
}
