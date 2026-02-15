'use client';

import { useState } from 'react';
import { useFounderStore, FeatureStatus } from '@/store/founder-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    Plus,
    Trash2,
    HelpCircle,
    Grid2x2,
    Palette,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function FeatureMatrixTab() {
    const competitors = useFounderStore(s => s.competitors);
    const mySolution = useFounderStore(s => s.mySolution);
    const updateCompetitor = useFounderStore(s => s.updateCompetitor);
    const updateMySolution = useFounderStore(s => s.updateMySolution);
    const comparisonCriteria = mySolution.comparisonCriteria || [];
    const addComparisonCriterion = useFounderStore(s => s.addComparisonCriterion);
    const deleteComparisonCriterion = useFounderStore(s => s.deleteComparisonCriterion);
    const language = useFounderStore(s => s.language);

    const t = {
        title: language === 'fr' ? 'Matrice de Fonctionnalités' : 'Feature Matrix',
        subtitle: language === 'fr'
            ? 'Comparez la présence de fonctionnalités chez vos concurrents.'
            : 'Compare feature presence across competitors.',
        addFeature: language === 'fr' ? 'Ajouter une fonctionnalité' : 'Add Feature',
        featureName: language === 'fr' ? 'Fonctionnalité' : 'Feature',
        mySolution: language === 'fr' ? 'Ma Solution' : 'My Solution',
        noFeatures: language === 'fr'
            ? 'Aucune fonctionnalité définie.'
            : 'No features defined.',
        addPrompt: language === 'fr'
            ? 'Ajoutez des critères pour commencer la comparaison.'
            : 'Add criteria to start comparing.',
        status: {
            yes: language === 'fr' ? 'Oui' : 'Yes',
            no: language === 'fr' ? 'Non' : 'No',
            partial: language === 'fr' ? 'Partiel' : 'Partial',
            planned: language === 'fr' ? 'Prévu' : 'Planned',
            unknown: language === 'fr' ? 'Inconnu' : 'Unknown',
        },
        coverage: language === 'fr' ? 'Couverture' : 'Coverage',
        yourGap: language === 'fr' ? 'Votre Gap' : 'Your Gap',
        heatmapMode: language === 'fr' ? 'Mode Heatmap' : 'Heatmap Mode',
        iconMode: language === 'fr' ? 'Mode Icônes' : 'Icon Mode',
        advantage: language === 'fr' ? 'Avantage' : 'Advantage',
        disadvantage: language === 'fr' ? 'Désavantage' : 'Disadvantage',
        parity: language === 'fr' ? 'Parité' : 'Parity',
    };

    const [newFeature, setNewFeature] = useState('');
    const [heatmapMode, setHeatmapMode] = useState(false);

    const handleAddFeature = () => {
        if (!newFeature.trim()) return;
        addComparisonCriterion(newFeature.trim());
        setNewFeature('');
    };

    const toggleStatus = (
        type: 'mySolution' | 'competitor',
        id: string | null,
        feature: string,
        currentStatus?: FeatureStatus
    ) => {
        const statuses: FeatureStatus[] = ['yes', 'no', 'partial', 'planned'];
        const currentIndex = currentStatus ? statuses.indexOf(currentStatus) : -1;
        const nextStatusCyclic = currentIndex === -1 ? 'yes' : statuses[(currentIndex + 1) % 4];

        if (type === 'mySolution') {
            updateMySolution({
                featureAnalysis: {
                    ...mySolution.featureAnalysis,
                    [feature]: nextStatusCyclic
                }
            });
        } else if (id) {
            const competitor = competitors.find(c => c.id === id);
            if (competitor) {
                updateCompetitor(id, {
                    featureAnalysis: {
                        ...competitor.featureAnalysis,
                        [feature]: nextStatusCyclic
                    }
                });
            }
        }
    };

    const getStatusIcon = (status?: FeatureStatus) => {
        switch (status) {
            case 'yes': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'no': return <XCircle className="h-5 w-5 text-red-500" />;
            case 'partial': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'planned': return <Clock className="h-5 w-5 text-blue-500" />;
            default: return <HelpCircle className="h-5 w-5 text-[#3a3f52]" />;
        }
    };

    const getHeatmapColor = (status?: FeatureStatus) => {
        switch (status) {
            case 'yes': return 'bg-green-500/30 border-green-500/20';
            case 'no': return 'bg-red-500/30 border-red-500/20';
            case 'partial': return 'bg-yellow-500/30 border-yellow-500/20';
            case 'planned': return 'bg-blue-500/30 border-blue-500/20';
            default: return 'bg-[#282c3a]/30 border-[#282c3a]/20';
        }
    };

    const getHeatmapLabel = (status?: FeatureStatus) => {
        switch (status) {
            case 'yes': return t.status.yes;
            case 'no': return t.status.no;
            case 'partial': return t.status.partial;
            case 'planned': return t.status.planned;
            default: return '?';
        }
    };

    // Calculate coverage per entity (% of features marked as "yes")
    const calcCoverage = (featureAnalysis: Record<string, FeatureStatus> | undefined) => {
        if (!comparisonCriteria.length) return 0;
        const yesCount = comparisonCriteria.filter(f => featureAnalysis?.[f] === 'yes').length;
        const partialCount = comparisonCriteria.filter(f => featureAnalysis?.[f] === 'partial').length;
        return Math.round(((yesCount + partialCount * 0.5) / comparisonCriteria.length) * 100);
    };

    // Determine gap per feature: "advantage" | "parity" | "disadvantage"
    const getFeatureGap = (feature: string) => {
        const myStatus = mySolution.featureAnalysis?.[feature];
        const myScore = myStatus === 'yes' ? 2 : myStatus === 'partial' ? 1 : myStatus === 'planned' ? 0.5 : 0;

        let competitorsBetter = 0;
        let competitorsWorse = 0;
        competitors.forEach(c => {
            const cStatus = c.featureAnalysis?.[feature];
            const cScore = cStatus === 'yes' ? 2 : cStatus === 'partial' ? 1 : cStatus === 'planned' ? 0.5 : 0;
            if (cScore > myScore) competitorsBetter++;
            if (cScore < myScore) competitorsWorse++;
        });

        if (competitors.length === 0) return 'parity';
        if (competitorsBetter > competitorsWorse) return 'disadvantage';
        if (competitorsWorse > competitorsBetter) return 'advantage';
        return 'parity';
    };

    const gapColors = {
        advantage: 'text-green-400',
        parity: 'text-[#8b8fa3]',
        disadvantage: 'text-red-400',
    };

    const gapBg = {
        advantage: 'bg-green-500/5',
        parity: '',
        disadvantage: 'bg-red-500/5',
    };

    const myCoverage = calcCoverage(mySolution.featureAnalysis);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-[#e8e9ed]">{t.title}</h2>
                    <p className="text-[#8b8fa3] text-sm">{t.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setHeatmapMode(!heatmapMode)}
                        className={`border-[#282c3a] ${heatmapMode ? 'bg-[#6c5ce7]/20 text-[#a29bfe]' : 'text-[#8b8fa3] hover:text-[#e8e9ed]'}`}
                    >
                        {heatmapMode ? <Grid2x2 className="h-4 w-4 mr-1" /> : <Palette className="h-4 w-4 mr-1" />}
                        {heatmapMode ? t.iconMode : t.heatmapMode}
                    </Button>
                    <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder={t.addFeature}
                        className="w-64 bg-[#181a24] border-[#282c3a] text-[#e8e9ed]"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                    />
                    <Button onClick={handleAddFeature} disabled={!newFeature.trim()} className="bg-[#6c5ce7] hover:bg-[#5a4bd6] text-white">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border border-[#282c3a] overflow-x-auto">
                <Table>
                    <TableHeader className="bg-[#1a1d2d]">
                        <TableRow className="border-[#282c3a] hover:bg-[#1a1d2d]">
                            <TableHead className="text-[#8b8fa3] w-[200px]">{t.featureName}</TableHead>
                            <TableHead className="text-center text-[#6c5ce7] font-semibold bg-[#6c5ce7]/5 w-[120px]">
                                {t.mySolution}
                            </TableHead>
                            {competitors.map((c) => (
                                <TableHead key={c.id} className="text-center text-[#e8e9ed] min-w-[120px]">
                                    {c.name}
                                </TableHead>
                            ))}
                            <TableHead className="text-center text-[#8b8fa3] w-[100px]">{t.yourGap}</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {comparisonCriteria.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={competitors.length + 4} className="h-32 text-center text-[#8b8fa3]">
                                    {t.noFeatures} <br /> {t.addPrompt}
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {comparisonCriteria.map((feature) => {
                                    const gap = getFeatureGap(feature);
                                    return (
                                        <TableRow
                                            key={feature}
                                            className={`border-[#282c3a] hover:bg-[#282c3a]/50 ${gapBg[gap]}`}
                                        >
                                            <TableCell className="font-medium text-[#e8e9ed]">
                                                {feature}
                                            </TableCell>

                                            {/* My Solution Status */}
                                            <TableCell className={`text-center p-2 ${heatmapMode ? '' : 'bg-[#6c5ce7]/5'}`}>
                                                <button
                                                    onClick={() => toggleStatus('mySolution', null, feature, mySolution.featureAnalysis?.[feature])}
                                                    className={`p-1 rounded transition-colors ${
                                                        heatmapMode
                                                            ? `${getHeatmapColor(mySolution.featureAnalysis?.[feature])} w-full py-1.5 text-xs font-medium text-[#e8e9ed]`
                                                            : 'rounded-full hover:bg-[#282c3a]'
                                                    }`}
                                                >
                                                    {heatmapMode ? (
                                                        getHeatmapLabel(mySolution.featureAnalysis?.[feature])
                                                    ) : (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    {getStatusIcon(mySolution.featureAnalysis?.[feature])}
                                                                </TooltipTrigger>
                                                                <TooltipContent className="bg-[#1a1d2d] border-[#282c3a] text-[#e8e9ed]">
                                                                    <p>{t.status[mySolution.featureAnalysis?.[feature] || 'unknown']}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </button>
                                            </TableCell>

                                            {/* Competitors Status */}
                                            {competitors.map((c) => (
                                                <TableCell key={c.id} className="text-center p-2">
                                                    <button
                                                        onClick={() => toggleStatus('competitor', c.id, feature, c.featureAnalysis?.[feature])}
                                                        className={`p-1 rounded transition-colors ${
                                                            heatmapMode
                                                                ? `${getHeatmapColor(c.featureAnalysis?.[feature])} w-full py-1.5 text-xs font-medium text-[#e8e9ed]`
                                                                : 'rounded-full hover:bg-[#282c3a]'
                                                        }`}
                                                    >
                                                        {heatmapMode ? (
                                                            getHeatmapLabel(c.featureAnalysis?.[feature])
                                                        ) : (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        {getStatusIcon(c.featureAnalysis?.[feature])}
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="bg-[#1a1d2d] border-[#282c3a] text-[#e8e9ed]">
                                                                        <p>{t.status[c.featureAnalysis?.[feature] || 'unknown']}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </button>
                                                </TableCell>
                                            ))}

                                            {/* Gap indicator */}
                                            <TableCell className="text-center">
                                                <span className={`text-xs font-medium ${gapColors[gap]}`}>
                                                    {gap === 'advantage' ? '▲' : gap === 'disadvantage' ? '▼' : '='}
                                                    {' '}
                                                    {t[gap]}
                                                </span>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteComparisonCriterion(feature)}
                                                    className="h-8 w-8 text-[#8b8fa3] hover:text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {/* Coverage Summary Row */}
                                <TableRow className="border-[#282c3a] bg-[#1a1d2d]/50 font-semibold">
                                    <TableCell className="text-[#8b8fa3] text-sm">{t.coverage}</TableCell>
                                    <TableCell className="text-center bg-[#6c5ce7]/5">
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${
                                                myCoverage >= 70 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                myCoverage >= 40 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                                'bg-red-500/20 text-red-400 border-red-500/30'
                                            }`}
                                        >
                                            {myCoverage}%
                                        </Badge>
                                    </TableCell>
                                    {competitors.map((c) => {
                                        const cov = calcCoverage(c.featureAnalysis);
                                        return (
                                            <TableCell key={c.id} className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${
                                                        cov >= 70 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                        cov >= 40 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                                        'bg-red-500/20 text-red-400 border-red-500/30'
                                                    }`}
                                                >
                                                    {cov}%
                                                </Badge>
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex gap-4 text-xs text-[#8b8fa3] justify-center pt-2">
                <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> {t.status.yes}</div>
                <div className="flex items-center gap-1"><XCircle className="h-3 w-3 text-red-500" /> {t.status.no}</div>
                <div className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-yellow-500" /> {t.status.partial}</div>
                <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-blue-500" /> {t.status.planned}</div>
                <span className="border-l border-[#282c3a] pl-4 flex items-center gap-1">
                    <span className="text-green-400">▲</span> {t.advantage}
                </span>
                <span className="flex items-center gap-1">
                    <span className="text-red-400">▼</span> {t.disadvantage}
                </span>
            </div>
        </div>
    );
}
