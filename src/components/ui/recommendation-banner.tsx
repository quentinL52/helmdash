'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, X, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';

interface RecommendationBannerProps {
    title?: string;
    description?: string;
    recommendations: any[]; // Flexible data
    type: 'lean-canvas' | 'roadmap' | 'hypotheses' | 'routine';
    onApply?: (item: any) => void;
    onDismiss?: () => void;
    className?: string;
}

export function RecommendationBanner({
    title,
    description,
    recommendations,
    type,
    onApply,
    onDismiss,
    className
}: RecommendationBannerProps) {
    const language = useFounderStore(s => s.language) || 'fr';
    const t = translations[language] || translations['fr'];

    if (!t || !t.strategicRecommendations) return null;

    const typeKeyMap: Record<string, keyof typeof t.strategicRecommendations.bannerTitle> = {
        'lean-canvas': 'leanCanvas',
        'roadmap': 'roadmap',
        'hypotheses': 'hypotheses',
        'routine': 'routine'
    };
    const transKey = typeKeyMap[type];

    const displayTitle = title || (t.strategicRecommendations.bannerTitle ? t.strategicRecommendations.bannerTitle[transKey] : title);
    const displayDescription = description || (t.strategicRecommendations.bannerDesc ? t.strategicRecommendations.bannerDesc[transKey] : description);

    const [isVisible, setIsVisible] = useState(true);
    const [appliedItems, setAppliedItems] = useState<Set<number>>(new Set());

    if (!isVisible || !recommendations || recommendations.length === 0) return null;

    const handleApply = (item: any, index: number) => {
        if (onApply) {
            onApply(item);
            const newSet = new Set(appliedItems);
            newSet.add(index);
            setAppliedItems(newSet);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
    };

    return (
        <div className={cn("mb-6 animate-in fade-in slide-in-from-top-4 duration-500", className)}>
            <Card className="border-info/30 bg-info/5 overflow-hidden">
                <div className="p-4">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-info/20 text-info">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-info">{displayTitle}</h3>
                                {displayDescription && <p className="text-sm text-info/80">{displayDescription}</p>}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDismiss}
                            className="h-8 w-8 text-info hover:text-info hover:bg-info/20"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid gap-3">
                        {recommendations.map((item, index) => {
                            const isApplied = appliedItems.has(index);

                            // Renderer based on type
                            let content = null;
                            if (type === 'lean-canvas') {
                                content = (
                                    <div className="flex-1">
                                        <div className="text-xs font-mono text-info mb-1 uppercase tracking-wider">{item.section}</div>
                                        <p className="text-sm text-info">{item.suggestion}</p>
                                    </div>
                                );
                            } else if (type === 'roadmap') {
                                content = (
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-info">{item.title}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${item.priority === 'high' ? 'bg-danger/20 text-danger' :
                                                item.priority === 'medium' ? 'bg-primary/20 text-primary' :
                                                    'bg-info/20 text-info'
                                                }`}>{item.priority}</span>
                                        </div>
                                        <p className="text-xs text-info/80">{item.timeframe}</p>
                                    </div>
                                );
                            } else if (type === 'hypotheses') {
                                content = (
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-info uppercase tracking-wider">{item.category}</span>
                                        </div>
                                        <p className="text-sm text-info font-medium mb-1">{item.statement}</p>
                                        <p className="text-xs text-info/80">Test: {item.testMethod}</p>
                                    </div>
                                );
                            } else if (type === 'routine') {
                                content = (
                                    <div className="flex-1">
                                        <p className="text-sm text-info mb-1">{item.suggestion}</p>
                                        <p className="text-xs text-success/80 flex items-center gap-1">
                                            <ArrowRight className="h-3 w-3" /> {t.strategicRecommendations.benefit} {item.benefit}
                                        </p>
                                    </div>
                                );
                            } else {
                                // Default fallback
                                content = <p className="text-sm text-info">{JSON.stringify(item)}</p>;
                            }

                            return (
                                <div key={index} className="flex items-center gap-3 bg-indigo-950/30 p-3 rounded-lg border border-info/10">
                                    {content}
                                    {onApply && (
                                        <Button
                                            size="sm"
                                            variant={isApplied ? "ghost" : "secondary"}
                                            className={cn(
                                                "shrink-0 h-8",
                                                isApplied
                                                    ? "bg-success/10 text-success hover:bg-success/20"
                                                    : "bg-info/20 text-info hover:bg-info/30 hover:text-foreground"
                                            )}
                                            onClick={() => !isApplied && handleApply(item, index)}
                                            disabled={isApplied}
                                        >
                                            {isApplied ? (
                                                <>
                                                    <Check className="h-3.5 w-3.5 mr-1.5" /> {t.strategicRecommendations.applied}
                                                </>
                                            ) : (
                                                <>{t.strategicRecommendations.apply}</>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>
        </div>
    );
}
