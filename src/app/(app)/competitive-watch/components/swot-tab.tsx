'use client';

import { useState, useCallback } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Eye, Sparkles, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function SwotTab() {
    const competitors = useFounderStore(s => s.competitors);
    const updateCompetitor = useFounderStore(s => s.updateCompetitor);
    const mySolution = useFounderStore(s => s.mySolution);
    const marketSignals = useFounderStore(s => s.marketSignals);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const [selectedId, setSelectedId] = useState<string>(competitors[0]?.id || '');
    const [isGenerating, setIsGenerating] = useState(false);

    const selectedCompetitor = competitors.find((c) => c.id === selectedId);

    const handleSwotChange = useCallback(
        (field: 'strengths' | 'weaknesses' | 'opportunities' | 'threats', value: string) => {
            if (!selectedId) return;
            const competitor = competitors.find((c) => c.id === selectedId);
            if (!competitor) return;
            updateCompetitor(selectedId, {
                swot: {
                    ...competitor.swot,
                    [field]: value,
                },
            });
        },
        [selectedId, competitors, updateCompetitor]
    );

    const handleAutoGenerate = async () => {
        if (!selectedCompetitor) return;
        setIsGenerating(true);

        try {
            const competitorSignals = marketSignals
                .filter(s => s.competitorId === selectedId)
                .slice(0, 5)
                .map(s => `${s.title} (${s.impact})`);

            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'swot-generation',
                    data: {
                        competitor: {
                            name: selectedCompetitor.name,
                            description: selectedCompetitor.description,
                            website: selectedCompetitor.website,
                            positioning: selectedCompetitor.positioning,
                            strengths: selectedCompetitor.strengths,
                            weaknesses: selectedCompetitor.weaknesses,
                            pricing: selectedCompetitor.pricing,
                            radarScores: selectedCompetitor.radarScores,
                            keyFeatures: selectedCompetitor.keyFeatures,
                            differentiators: selectedCompetitor.differentiators,
                            fundingStage: selectedCompetitor.fundingStage,
                            teamSize: selectedCompetitor.teamSize,
                        },
                        mySolution: {
                            name: mySolution.name,
                            positioning: mySolution.positioning,
                            differentiators: mySolution.differentiators,
                        },
                        recentSignals: competitorSignals,
                        language,
                    },
                }),
            });

            if (!response.ok) throw new Error('Failed');

            const result = await response.json();

            if (result.result) {
                // Parse the AI result - expecting structured SWOT text
                try {
                    const parsed = JSON.parse(result.result);
                    updateCompetitor(selectedId, {
                        swot: {
                            strengths: parsed.strengths || selectedCompetitor.swot?.strengths || '',
                            weaknesses: parsed.weaknesses || selectedCompetitor.swot?.weaknesses || '',
                            opportunities: parsed.opportunities || selectedCompetitor.swot?.opportunities || '',
                            threats: parsed.threats || selectedCompetitor.swot?.threats || '',
                        },
                    });
                } catch {
                    // If not JSON, try splitting by sections
                    const text = result.result;
                    updateCompetitor(selectedId, {
                        swot: {
                            strengths: text,
                            weaknesses: selectedCompetitor.swot?.weaknesses || '',
                            opportunities: selectedCompetitor.swot?.opportunities || '',
                            threats: selectedCompetitor.swot?.threats || '',
                        },
                    });
                }
            }

            toast({
                title: language === 'fr' ? 'SWOT généré' : 'SWOT generated',
                description: language === 'fr'
                    ? `Analyse SWOT générée pour ${selectedCompetitor.name}`
                    : `SWOT analysis generated for ${selectedCompetitor.name}`,
            });
        } catch {
            // Fallback: generate SWOT directly via the competitor-intelligence route
            try {
                const res = await fetch('/api/ai/competitor-profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: selectedCompetitor.website || selectedCompetitor.name,
                        language,
                    }),
                });

                if (res.ok) {
                    const profile = await res.json();
                    if (profile.strengths || profile.weaknesses) {
                        updateCompetitor(selectedId, {
                            swot: {
                                strengths: profile.strengths || selectedCompetitor.swot?.strengths || '',
                                weaknesses: profile.weaknesses || selectedCompetitor.swot?.weaknesses || '',
                                opportunities: selectedCompetitor.swot?.opportunities || '',
                                threats: selectedCompetitor.swot?.threats || '',
                            },
                        });
                        toast({
                            title: language === 'fr' ? 'SWOT mis à jour' : 'SWOT updated',
                            description: language === 'fr'
                                ? 'Forces et faiblesses extraites du profil concurrent.'
                                : 'Strengths and weaknesses extracted from competitor profile.',
                        });
                        return;
                    }
                }

                toast({
                    title: language === 'fr' ? 'Erreur' : 'Error',
                    description: language === 'fr'
                        ? 'Impossible de générer le SWOT automatiquement.'
                        : 'Could not auto-generate SWOT.',
                    variant: 'destructive',
                });
            } catch {
                toast({
                    title: language === 'fr' ? 'Erreur' : 'Error',
                    description: language === 'fr'
                        ? 'Impossible de générer le SWOT automatiquement.'
                        : 'Could not auto-generate SWOT.',
                    variant: 'destructive',
                });
            }
        } finally {
            setIsGenerating(false);
        }
    };

    if (competitors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-[#8b8fa3] space-y-2">
                <Eye className="h-12 w-12 opacity-40" />
                <p>{t.noCompetitors}</p>
                <p className="text-sm">
                    {language === 'fr'
                        ? 'Ajoutez des concurrents dans le Dashboard pour l\'analyse SWOT.'
                        : 'Add competitors in the Dashboard for SWOT analysis.'}
                </p>
            </div>
        );
    }

    const swotQuadrants = [
        {
            key: 'strengths' as const,
            label: t.swot.strengths,
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30',
            headerColor: 'text-green-400',
        },
        {
            key: 'weaknesses' as const,
            label: t.swot.weaknesses,
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            headerColor: 'text-red-400',
        },
        {
            key: 'opportunities' as const,
            label: t.swot.opportunities,
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            headerColor: 'text-blue-400',
        },
        {
            key: 'threats' as const,
            label: t.swot.threats,
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/30',
            headerColor: 'text-orange-400',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-[#e8e9ed]">
                        {language === 'fr' ? 'Analyse SWOT' : 'SWOT Analysis'}
                    </h2>
                    <p className="text-[#8b8fa3] text-sm">{t.selectCompetitor}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAutoGenerate}
                        disabled={!selectedCompetitor || isGenerating}
                        className="border-[#6c5ce7]/30 text-[#a29bfe] hover:bg-[#6c5ce7]/10"
                    >
                        {isGenerating ? (
                            <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> {language === 'fr' ? 'Génération...' : 'Generating...'}</>
                        ) : (
                            <><Sparkles className="h-4 w-4 mr-1" /> {language === 'fr' ? 'Auto-générer' : 'Auto-generate'}</>
                        )}
                    </Button>
                    <Select value={selectedId} onValueChange={setSelectedId}>
                        <SelectTrigger className="w-[250px] bg-[#181a24] border-[#282c3a] text-[#e8e9ed]">
                            <SelectValue placeholder={t.selectCompetitor} />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1d2d] border-[#282c3a] text-[#e8e9ed]">
                            {competitors.map((c) => (
                                <SelectItem key={c.id} value={c.id} className="hover:bg-[#282c3a]">
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedCompetitor && (
                <div className="grid grid-cols-2 gap-4">
                    {swotQuadrants.map((quadrant) => (
                        <Card
                            key={quadrant.key}
                            className={`${quadrant.bgColor} border ${quadrant.borderColor}`}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className={`text-base ${quadrant.headerColor}`}>
                                    {quadrant.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={selectedCompetitor.swot?.[quadrant.key] || ''}
                                    onChange={(e) => handleSwotChange(quadrant.key, e.target.value)}
                                    placeholder={
                                        language === 'fr'
                                            ? `Listez les ${quadrant.label.toLowerCase()}...`
                                            : `List ${quadrant.label.toLowerCase()}...`
                                    }
                                    className="bg-transparent border-none text-[#e8e9ed] placeholder:text-[#8b8fa3]/50 min-h-[150px] resize-none focus-visible:ring-0 p-0"
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
