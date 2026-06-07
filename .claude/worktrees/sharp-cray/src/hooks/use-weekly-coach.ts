import { useState, useCallback } from 'react';
import { useFounderStore } from '@/store/founder-store';

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
            const response = await fetch('/api/ai/weekly-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dateString })
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de la génération');
            }

            setWeeklyReport(result.report);

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
