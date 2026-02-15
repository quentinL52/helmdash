'use client';

import { useState, useMemo } from 'react';
import { useFounderStore, MarketSignalImpact } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Signal, TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react';
import { SignalDialog } from './signal-dialog';

export function MarketSignalsTab() {
    const marketSignals = useFounderStore(s => s.marketSignals);
    const deleteMarketSignal = useFounderStore(s => s.deleteMarketSignal);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const sortedSignals = useMemo(
        () => [...marketSignals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [marketSignals]
    );

    const impactConfig: Record<MarketSignalImpact, { color: string; icon: React.ReactNode; label: string }> = {
        positive: {
            color: 'bg-green-500/20 text-green-400 border-green-500/30',
            icon: <TrendingUp className="h-4 w-4" />,
            label: t.signals.impact.positive,
        },
        negative: {
            color: 'bg-red-500/20 text-red-400 border-red-500/30',
            icon: <TrendingDown className="h-4 w-4" />,
            label: t.signals.impact.negative,
        },
        neutral: {
            color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
            icon: <Minus className="h-4 w-4" />,
            label: t.signals.impact.neutral,
        },
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-[#e8e9ed]">{t.signals.title}</h2>
                    <p className="text-[#8b8fa3] text-sm">
                        {language === 'fr'
                            ? 'Suivez les signaux importants de votre marche.'
                            : 'Track important signals from your market.'}
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-[#6c5ce7] hover:bg-[#5a4bd6] text-white">
                    <Plus className="mr-2 h-4 w-4" /> {t.signals.addSignal}
                </Button>
            </div>

            {sortedSignals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-[#8b8fa3] space-y-2">
                    <Signal className="h-12 w-12 opacity-40" />
                    <p>{t.noSignals}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedSignals.map((signal) => {
                        const config = impactConfig[signal.impact];
                        return (
                            <Card key={signal.id} className="bg-[#181a24] border-[#282c3a] hover:border-[#3a3f52] transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            {/* Impact indicator */}
                                            <div className={`mt-1 p-1.5 rounded-md border ${config.color}`}>
                                                {config.icon}
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-[#e8e9ed] font-medium">{signal.title}</h3>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs border ${config.color}`}
                                                    >
                                                        {config.label}
                                                    </Badge>
                                                </div>
                                                {signal.description && (
                                                    <p className="text-[#8b8fa3] text-sm">{signal.description}</p>
                                                )}
                                                <div className="flex items-center gap-3 text-xs text-[#8b8fa3]">
                                                    <span>{new Date(signal.date).toLocaleDateString()}</span>
                                                    {signal.source && (
                                                        <>
                                                            <span className="text-[#282c3a]">|</span>
                                                            <span>{signal.source}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-[#8b8fa3] hover:text-red-400 shrink-0"
                                            onClick={() => deleteMarketSignal(signal.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <SignalDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </div>
    );
}
