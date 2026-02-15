'use client';

import { useState } from 'react';
import { useFounderStore, FeatureStatus } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    Plus,
    Trash2,
    MoreHorizontal,
    HelpCircle
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
    // const t = (translations[language] as any).competitiveWatch; // Assuming translations exist, or hardcode for now if missing

    // Temporary translations until added to translations.ts
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
        }
    };

    const [newFeature, setNewFeature] = useState('');

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
        // Cycle: unknown -> yes -> no -> partial -> planned -> unknown (undefined)
        const nextStatus = currentIndex === -1 ? 'yes' :
            currentIndex === 3 ? undefined :
                statuses[currentIndex + 1];

        // However, cycling back to undefined is tricky for the UI if we want a clear "unknown" state.
        // Let's cycle: yes -> no -> partial -> planned -> yes
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
            case 'yes':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'no':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'partial':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'planned':
                return <Clock className="h-5 w-5 text-blue-500" />;
            default:
                return <HelpCircle className="h-5 w-5 text-[#3a3f52]" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-[#e8e9ed]">{t.title}</h2>
                    <p className="text-[#8b8fa3] text-sm">{t.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
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

            <div className="rounded-lg border border-[#282c3a] overflow-hidden">
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
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {comparisonCriteria.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={competitors.length + 3} className="h-32 text-center text-[#8b8fa3]">
                                    {t.noFeatures} <br /> {t.addPrompt}
                                </TableCell>
                            </TableRow>
                        ) : (
                            comparisonCriteria.map((feature) => (
                                <TableRow key={feature} className="border-[#282c3a] hover:bg-[#282c3a]/50">
                                    <TableCell className="font-medium text-[#e8e9ed]">
                                        {feature}
                                    </TableCell>

                                    {/* My Solution Status */}
                                    <TableCell className="text-center bg-[#6c5ce7]/5 p-2">
                                        <button
                                            onClick={() => toggleStatus('mySolution', null, feature, mySolution.featureAnalysis?.[feature])}
                                            className="p-1 rounded-full hover:bg-[#282c3a] transition-colors"
                                        >
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
                                        </button>
                                    </TableCell>

                                    {/* Competitors Status */}
                                    {competitors.map((c) => (
                                        <TableCell key={c.id} className="text-center p-2">
                                            <button
                                                onClick={() => toggleStatus('competitor', c.id, feature, c.featureAnalysis?.[feature])}
                                                className="p-1 rounded-full hover:bg-[#282c3a] transition-colors"
                                            >
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
                                            </button>
                                        </TableCell>
                                    ))}

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
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex gap-4 text-xs text-[#8b8fa3] justify-center pt-2">
                <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> {t.status.yes}</div>
                <div className="flex items-center gap-1"><XCircle className="h-3 w-3 text-red-500" /> {t.status.no}</div>
                <div className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-yellow-500" /> {t.status.partial}</div>
                <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-blue-500" /> {t.status.planned}</div>
            </div>
        </div>
    );
}
