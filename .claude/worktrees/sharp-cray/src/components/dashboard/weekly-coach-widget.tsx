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
                <Card className="col-span-full border border-primary/20 bg-gradient-to-br from-background to-primary/5">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <div>
                                <CardTitle className="text-base">Weekly AI Coach</CardTitle>
                                <CardDescription className="text-xs">Your personalized strategy for the week.</CardDescription>
                            </div>
                        </div>
                        <Button onClick={generateReport} size="sm">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Report
                        </Button>
                    </div>
                </Card>
            </Paywall>
        );
    }

    return (
        <Paywall requiredTier="growth" title="Weekly AI Coach">
            <Card className="col-span-full border-primary/20 transition-all duration-300">
                <div className="flex items-center justify-between px-6 pt-4 pb-2">
                    <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <div>
                            <CardTitle className="text-base">Weekly AI Coach</CardTitle>
                            <CardDescription className="text-xs">
                                {isGenerating ? "Analyzing your data..." : "Your strategic roadmap for the week."}
                            </CardDescription>
                        </div>
                        {weeklyReport && (
                            <Badge variant="outline" className="ml-2 text-xs">
                                {weeklyReport.date}
                            </Badge>
                        )}
                    </div>
                    {weeklyReport && !isGenerating && (
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                                {isExpanded ? "Collapse" : "Expand"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownloadPDF} title="Download PDF">
                                <Download className="h-3.5 w-3.5 mr-1" /> PDF
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={generateReport} title="Regenerate">
                                <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}
                </div>
                <CardContent className="pt-0 pb-4">
                    {isGenerating ? (
                        <div className="flex items-center justify-center py-4 gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground animate-pulse">
                                Generating your weekly report...
                            </p>
                        </div>
                    ) : weeklyReport ? (
                        <div className={`relative transition-all duration-500 ${isExpanded ? 'h-auto' : 'max-h-24 overflow-hidden'}`}>
                            <ScrollArea className={isExpanded ? "h-[400px] w-full pr-4" : "h-full w-full"}>
                                <div id="weekly-report-content" className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>{weeklyReport.content}</ReactMarkdown>
                                </div>
                            </ScrollArea>
                            {!isExpanded && (
                                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
                            )}
                        </div>
                    ) : (
                        <div className="py-2 text-center text-muted-foreground">
                            <p className="text-sm">Unable to load report.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Paywall>
    );
}
