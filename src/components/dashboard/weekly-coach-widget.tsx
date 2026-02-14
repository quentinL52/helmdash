'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, RefreshCcw } from 'lucide-react';
import { useFounderStore } from '@/store/founder-store';
import { generateWeeklyReport } from '@/lib/ai-service';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

export function WeeklyCoachWidget() {
    const store = useFounderStore();
    const [report, setReport] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const data = await generateWeeklyReport(store);
            setReport(data);
        } catch (error) {
            console.error("Failed to generate report", error);
            setReport("Sorry, I couldn't generate a report right now.");
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate on first load if empty (optional, or just manual)
    useEffect(() => {
        if (!report) {
            handleGenerate();
        }
    }, []);

    return (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100 col-span-full shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center">
                    <Sparkles className="h-5 w-5 text-indigo-600 mr-2" />
                    <CardTitle className="text-lg font-semibold text-indigo-900">
                        Weekly AI Coach
                    </CardTitle>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100/50"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                </Button>
            </CardHeader>
            <CardContent>
                {loading && !report ? (
                    <div className="flex items-center justify-center py-8 text-indigo-400">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Analyzing your startup data...
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none text-indigo-900/90 prose-headings:text-indigo-900 prose-strong:text-indigo-800">
                        <ReactMarkdown>{report || "No report available."}</ReactMarkdown>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
