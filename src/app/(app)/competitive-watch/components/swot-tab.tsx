'use client';

import { useState, useCallback } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Eye } from 'lucide-react';

export function SwotTab() {
    const competitors = useFounderStore(s => s.competitors);
    const updateCompetitor = useFounderStore(s => s.updateCompetitor);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const [selectedId, setSelectedId] = useState<string>(competitors[0]?.id || '');

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

    if (competitors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-[#8b8fa3] space-y-2">
                <Eye className="h-12 w-12 opacity-40" />
                <p>{t.noCompetitors}</p>
                <p className="text-sm">
                    {language === 'fr'
                        ? 'Ajoutez des concurrents dans l\'onglet Vue d\'ensemble pour l\'analyse SWOT.'
                        : 'Add competitors in the Overview tab for SWOT analysis.'}
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
