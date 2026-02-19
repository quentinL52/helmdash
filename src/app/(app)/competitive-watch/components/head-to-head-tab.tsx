'use client';

import { useState, useMemo } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Shield, Zap, CheckCircle2, XCircle } from 'lucide-react';

/** Resolves effective feature status: explicit featureAnalysis first, then keyFeatures → 'yes' */
function getEffectiveStatus(
    featureAnalysis: Record<string, import('@/store/founder-store').FeatureStatus> | undefined,
    keyFeats: string[] | undefined,
    feature: string
): import('@/store/founder-store').FeatureStatus | undefined {
    if (featureAnalysis?.[feature]) return featureAnalysis[feature];
    if (keyFeats?.some(kf => kf.toLowerCase() === feature.toLowerCase())) return 'yes';
    return undefined;
}

export function HeadToHeadTab() {
    const language = useFounderStore(s => s.language);
    const mySolution = useFounderStore(s => s.mySolution);
    const competitors = useFounderStore(s => s.competitors);

    const [selectedId, setSelectedId] = useState<string>(competitors[0]?.id ?? '');

    const competitor = useMemo(
        () => competitors.find(c => c.id === selectedId),
        [competitors, selectedId]
    );

    const fr = language === 'fr';

    if (competitors.length === 0) {
        return (
            <div className="text-center py-16 text-[#8b8fa3]">
                {fr
                    ? 'Ajoutez des concurrents dans le Dashboard pour comparer les avantages.'
                    : 'Add competitors in the Dashboard to compare advantages.'}
            </div>
        );
    }

    // ── Avantages déclarés ─────────────────────────────────────
    const myClaims = [
        ...(mySolution.competitiveAdvantages ?? []),
        ...(mySolution.differentiators ?? []),
    ].filter(Boolean);

    const theirClaims = competitor?.differentiators ?? [];

    // ── Feature gaps ───────────────────────────────────────────
    // Combine criteria the same way the feature matrix does
    const allFeatures = useMemo(() => {
        const set = new Set<string>();
        const result: string[] = [];
        const push = (f: string) => {
            if (!set.has(f.toLowerCase())) { set.add(f.toLowerCase()); result.push(f); }
        };
        (mySolution.comparisonCriteria ?? []).forEach(push);
        (mySolution.keyFeatures ?? []).forEach(push);
        competitors.forEach(c => (c.keyFeatures ?? []).forEach(push));
        return result;
    }, [mySolution, competitors]);

    const myOnly: string[] = [];
    const theirOnly: string[] = [];

    if (competitor) {
        allFeatures.forEach(f => {
            const mine = getEffectiveStatus(mySolution.featureAnalysis, mySolution.keyFeatures, f);
            const theirs = getEffectiveStatus(competitor.featureAnalysis, competitor.keyFeatures, f);
            const myScore = mine === 'yes' ? 2 : mine === 'partial' ? 1 : 0;
            const theirScore = theirs === 'yes' ? 2 : theirs === 'partial' ? 1 : 0;
            if (myScore > theirScore) myOnly.push(f);
            if (theirScore > myScore) theirOnly.push(f);
        });
    }

    return (
        <div className="space-y-4">
            {/* Competitor selector */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-[#8b8fa3]">
                    {fr ? 'Comparer avec :' : 'Compare with:'}
                </span>
                <Select value={selectedId} onValueChange={setSelectedId}>
                    <SelectTrigger className="w-52 bg-[#181a24] border-[#282c3a] text-[#e8e9ed]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed]">
                        {competitors.map(c => (
                            <SelectItem key={c.id} value={c.id} className="hover:bg-[#282c3a]">
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {competitor && (
                <>
                    {/* ── Avantages déclarés ── */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="border-emerald-500/20 bg-[#181a24]">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-emerald-400 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    {fr ? 'Nos avantages' : 'Our advantages'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {myClaims.length > 0 ? (
                                    <ul className="space-y-2">
                                        {myClaims.map((a, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-[#dfe1e6]">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                                {a}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-[#8b8fa3]">
                                        {fr
                                            ? 'Renseignez vos différenciateurs dans "Ma Solution".'
                                            : 'Fill in your differentiators in "My Solution".'}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-orange-500/20 bg-[#181a24]">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-orange-400 flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    {fr
                                        ? `Avantages de ${competitor.name}`
                                        : `${competitor.name}'s advantages`}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {theirClaims.length > 0 ? (
                                    <ul className="space-y-2">
                                        {theirClaims.map((a, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-[#dfe1e6]">
                                                <Zap className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                                                {a}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-[#8b8fa3]">
                                        {fr
                                            ? `Renseignez les différenciateurs de ${competitor.name} dans sa fiche.`
                                            : `Fill in ${competitor.name}'s differentiators in their profile.`}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Feature gaps (uniquement si des critères existent) ── */}
                    {allFeatures.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="border-blue-500/20 bg-[#181a24]">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        {fr
                                            ? `Ce que j'ai, pas ${competitor.name}`
                                            : `What I have, not ${competitor.name}`}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {myOnly.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {myOnly.map(f => (
                                                <Badge
                                                    key={f}
                                                    variant="outline"
                                                    className="text-xs border-blue-500/30 text-blue-300 bg-blue-500/5"
                                                >
                                                    {f}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-[#8b8fa3]">
                                            {fr
                                                ? 'Aucun avantage feature détecté sur la matrice.'
                                                : 'No feature advantage detected in the matrix.'}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-red-500/20 bg-[#181a24]">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-red-400 flex items-center gap-2">
                                        <XCircle className="h-4 w-4" />
                                        {fr
                                            ? `Ce que ${competitor.name} a, pas moi`
                                            : `What ${competitor.name} has, not me`}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {theirOnly.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {theirOnly.map(f => (
                                                <Badge
                                                    key={f}
                                                    variant="outline"
                                                    className="text-xs border-red-500/30 text-red-300 bg-red-500/5"
                                                >
                                                    {f}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-[#8b8fa3]">
                                            {fr
                                                ? 'Aucun gap feature détecté sur la matrice.'
                                                : 'No feature gap detected in the matrix.'}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
