'use client';

import { useWeeklyCoach } from '@/hooks/use-weekly-coach';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Paywall } from '@/components/paywall';
import { Download } from 'lucide-react';

export function WeeklyCoachWidget() {
    const { weeklyReport, isGenerating, generateReport } = useWeeklyCoach();
    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-expand when a new report is generated in this session
    useEffect(() => {
        if (isGenerating) setIsExpanded(false);
    }, [isGenerating]);

    const handleDownloadPDF = async () => {
        const element = document.getElementById('weekly-report-content');
        if (!element) return;

        const html2pdf = (await import('html2pdf.js')).default;
        const opt = {
            margin: 1,
            filename: `weekly-report-${weeklyReport?.date || 'latest'}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
        };

        html2pdf().set(opt).from(element).save();
    };

    if (!weeklyReport && !isGenerating) {
        return (
            <Paywall requiredTier="growth" title="Weekly AI Coach" description="Passez au plan Growth pour débloquer votre coach stratégique hebdomadaire.">
                <Card className="col-span-full border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Weekly AI Coach
                        </CardTitle>
                        <CardDescription>
                            Get your personalized strategy and motivation for the week.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                            <p className="mb-4 text-sm">
                                Ready to kick off the week? I'll analyze your progress and help you focus.
                            </p>
                            <Button onClick={generateReport} className="w-full sm:w-auto">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Weekly Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </Paywall>
        );
    }

    return (
        <Paywall requiredTier="growth" title="Weekly AI Coach">
            <Card className="col-span-full border-primary/20 transition-all duration-300">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Weekly AI Coach
                        </CardTitle>
                        {weeklyReport && (
                            <Badge variant="outline" className="ml-2">
                                {weeklyReport.date}
                            </Badge>
                        )}
                    </div>
                    <CardDescription>
                        {isGenerating ? "Analyzing your data..." : "Your strategic roadmap for the week."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground animate-pulse">
                                Reviewing your journal...<br />
                                Checking key results...<br />
                                Formulating strategy...
                            </p>
                        </div>
                    ) : weeklyReport ? (
                        <div className={`relative transition-all duration-500 ${isExpanded ? 'h-auto' : 'h-40 overflow-hidden'}`}>
                            <ScrollArea className={isExpanded ? "h-[500px] w-full pr-4" : "h-full w-full"}>
                                <div id="weekly-report-content" className="prose prose-sm dark:prose-invert max-w-none p-4 bg-background">
                                    <ReactMarkdown>{weeklyReport.content}</ReactMarkdown>
                                </div>
                            </ScrollArea>
                            {!isExpanded && (
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent flex items-end justify-center pb-2">
                                    <Button variant="secondary" size="sm" onClick={() => setIsExpanded(true)}>
                                        Read Full Report
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            <p>Unable to load report.</p>
                        </div>
                    )}
                </CardContent>
                {weeklyReport && !isGenerating && (
                    <CardFooter className="flex justify-between pt-0">
                        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? "Collapse" : "Expand"}
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleDownloadPDF} title="Download PDF">
                                <Download className="h-4 w-4 mr-2" /> PDF
                            </Button>
                            <Button variant="ghost" size="icon" onClick={generateReport} title="Regenerate">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </Paywall>
    );
}
