'use client';

import { useWeeklyCoach } from '@/hooks/use-weekly-coach';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

export function WeeklyCoachWidget() {
    const { weeklyReport, isGenerating, generateReport } = useWeeklyCoach();
    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-expand when a new report is generated in this session
    useEffect(() => {
        if (isGenerating) setIsExpanded(false);
    }, [isGenerating]);

    if (!weeklyReport && !isGenerating) {
        return (
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
        );
    }

    return (
        <Card className="col-span-full border-primary/20 transition-all duration-300">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Weekly AI Coach
                        </CardTitle>
                        <CardDescription className="mt-0">
                            {isGenerating ? "Analyzing your data..." : "Your strategic roadmap for the week."}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {weeklyReport && (
                            <Badge variant="outline">
                                {weeklyReport.date}
                            </Badge>
                        )}
                        {weeklyReport && !isGenerating && (
                            <>
                                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                                    {isExpanded ? "Collapse" : "Expand"}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={generateReport} title="Regenerate">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent className="pt-0 pb-3">
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
                        <ScrollArea className="h-[500px] w-full pr-4">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{weeklyReport.content}</ReactMarkdown>
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            <p>Unable to load report.</p>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
