'use client';

import { useMemo, useState } from 'react';
import { useFounderStore, Competitor } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import {
    computeHealthBreakdown,
    computeHealthScore,
    computeCompetitiveRank,
    countActiveThreats,
} from '@/lib/competitive-intelligence';
import { LeanHealthPanel } from './lean-health-panel';
import { CompetitorDialog } from './competitor-dialog';
import { CompetitorInlineForm } from './competitor-inline-form';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Minus,
    Trophy,
    Zap,
    Plus,
    ArrowRight,
    ExternalLink,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    Globe,
} from 'lucide-react';

interface LeanDashboardTabProps {
    onTabChange?: (tab: string) => void;
}

/**
 * Lean Dashboard: Competitor list + Health panel + KPI cards + Signals + Actions.
 *
 * Answers: "Who am I competing against?", "Am I winning?", "What should I do next?"
 */
export function LeanDashboardTab({ onTabChange }: LeanDashboardTabProps) {
    const language = useFounderStore((s) => s.language);
    const t = (translations[language] as any).competitiveWatch;
    const mySolution = useFounderStore((s) => s.mySolution);
    const competitors = useFounderStore((s) => s.competitors);
    const deleteCompetitor = useFounderStore((s) => s.deleteCompetitor);
    const marketSignals = useFounderStore((s) => s.marketSignals);
    const competitiveIntelligence = useFounderStore((s) => s.competitiveIntelligence);
    const addRoadmapItem = useFounderStore((s) => s.addRoadmapItem);
    const addHypothesis = useFounderStore((s) => s.addHypothesis);

    // --- Competitor Dialog state ---
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isInlineFormOpen, setIsInlineFormOpen] = useState(false);
    const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);

    const filteredCompetitors = useMemo(
        () =>
            competitors.filter(
                (c) =>
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.positioning?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.pricing?.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [competitors, searchTerm]
    );

    const handleEdit = (competitor: Competitor) => {
        setSelectedCompetitor(competitor);
        setIsDialogOpen(true);
    };

    const handleNew = () => {
        setIsInlineFormOpen(!isInlineFormOpen);
    };

    // --- Computed KPIs ---
    const { healthScore, rank, activeThreats } = useMemo(() => {
        const bd = computeHealthBreakdown(mySolution, competitors, marketSignals);
        const score = computeHealthScore(bd);
        const { rank: r, total } = computeCompetitiveRank(mySolution, competitors);
        const alerts = competitiveIntelligence?.alerts || [];
        return {
            healthScore: score,
            rank: { rank: r, total },
            activeThreats: countActiveThreats(alerts),
        };
    }, [mySolution, competitors, marketSignals, competitiveIntelligence]);



    const handleAddToRoadmap = (title: string, priority: 'high' | 'medium' | 'low') => {
        addRoadmapItem({
            title,
            description: language === 'fr'
                ? 'Généré depuis la veille concurrentielle'
                : 'Generated from competitive intelligence',
            status: 'todo',
            priority,
        });
        toast({ title: t.leanDashboard.addToRoadmap, description: title });
    };

    const handleCreateHypothesis = (statement: string) => {
        addHypothesis({
            statement,
            category: 'solution',
            riskLevel: 'medium',
            testMethod: '',
            successCriteria: '',
            status: 'draft',
        });
        toast({ title: t.leanDashboard.createHypothesis, description: statement.slice(0, 80) });
    };

    const impactIcon = (impact: string) => {
        switch (impact) {
            case 'negative': return <TrendingDown className="h-4 w-4 text-red-400" />;
            case 'positive': return <TrendingUp className="h-4 w-4 text-emerald-400" />;
            default: return <Minus className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const severityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6">
            {/* ───────────── Competitor Management Section ───────────── */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                            {t.tabs.overview || (language === 'fr' ? 'Solutions similaires' : 'Competitors')}
                            {competitors.length > 0 && (
                                <Badge variant="outline" className="ml-2 text-xs">{competitors.length}</Badge>
                            )}
                        </CardTitle>
                        <Button
                            onClick={handleNew}
                            size="sm"
                            className="bg-[#6c5ce7] hover:bg-[#5a4bd6] text-white"
                        >
                            <Plus className="mr-1.5 h-4 w-4" /> {language === 'fr' ? 'Ajouter un compétiteur' : t.addCompetitor}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isInlineFormOpen && (
                        <CompetitorInlineForm
                            onCancel={() => setIsInlineFormOpen(false)}
                            onSuccess={() => setIsInlineFormOpen(false)}
                        />
                    )}
                    {competitors.length === 0 && !isInlineFormOpen ? (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground mb-4">{t.noCompetitors}</p>
                            <Button onClick={handleNew} variant="outline">
                                <Plus className="h-4 w-4 mr-2" /> {language === 'fr' ? 'Ajouter un compétiteur' : t.addCompetitor}
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Search bar */}
                            {competitors.length > 3 && (
                                <div className="relative max-w-sm mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b8fa3]" />
                                    <Input
                                        placeholder={t.searchPlaceholder}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 bg-[#181a24] border-[#282c3a] text-[#e8e9ed] focus:ring-[#6c5ce7]"
                                    />
                                </div>
                            )}
                            {/* Competitor table */}
                            <div className="rounded-xl border border-[#282c3a] bg-[#181a24]/50 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-[#181a24]">
                                        <TableRow className="border-[#282c3a] hover:bg-[#181a24]">
                                            <TableHead className="text-[#8b8fa3]">{t.competitor.name}</TableHead>
                                            <TableHead className="text-[#8b8fa3]">{t.competitor.website}</TableHead>
                                            <TableHead className="text-[#8b8fa3]">{t.competitor.pricing}</TableHead>
                                            <TableHead className="text-[#8b8fa3]">{language === 'fr' ? 'Différenciateurs' : 'Differentiators'}</TableHead>
                                            <TableHead className="text-right text-[#8b8fa3]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCompetitors.map((competitor) => (
                                            <TableRow key={competitor.id} className="border-[#282c3a] hover:bg-[#282c3a]/50 group">
                                                <TableCell className="font-medium text-[#e8e9ed]">
                                                    <div className="flex flex-col">
                                                        <span>{competitor.name}</span>
                                                        {competitor.description && (
                                                            <span className="text-xs text-[#8b8fa3] line-clamp-1">
                                                                {competitor.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-[#dfe1e6]">
                                                    {competitor.website ? (
                                                        <a
                                                            href={competitor.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-[#6c5ce7] hover:underline text-sm"
                                                        >
                                                            <Globe className="h-3 w-3" />
                                                            {competitor.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                                        </a>
                                                    ) : (
                                                        <span className="text-[#8b8fa3]">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-[#dfe1e6] text-sm">
                                                    {competitor.pricing || <span className="text-[#8b8fa3]">-</span>}
                                                </TableCell>
                                                <TableCell className="max-w-[220px]">
                                                    {competitor.differentiators && competitor.differentiators.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {competitor.differentiators.slice(0, 3).map((d, i) => (
                                                                <Badge
                                                                    key={i}
                                                                    variant="outline"
                                                                    className="text-[10px] px-1.5 py-0 border-[#6c5ce7]/30 text-[#a29bfe] bg-[#6c5ce7]/5"
                                                                >
                                                                    {d}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#5c6078] text-xs italic">
                                                            {language === 'fr' ? 'Non renseigné' : 'Not set'}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-[#8b8fa3] hover:text-[#6c5ce7]"
                                                            onClick={() => handleEdit(competitor)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-[#8b8fa3]">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="bg-[#1a1d2d] border-[#282c3a] text-[#e8e9ed]">
                                                                <DropdownMenuItem
                                                                    onClick={() => handleEdit(competitor)}
                                                                    className="hover:bg-[#282c3a]"
                                                                >
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    {language === 'fr' ? 'Modifier' : 'Edit'}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => deleteCompetitor(competitor.id)}
                                                                    className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    {language === 'fr' ? 'Supprimer' : 'Delete'}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* ───────────── Health Panel (score + sub-scores) ───────────── */}
            <LeanHealthPanel />

            {/* ───────────── 3 KPI Cards Row ───────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Health Score */}
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="text-3xl font-bold">{healthScore}</div>
                        <div className="text-sm text-muted-foreground">{t.intelligence.healthScore}</div>
                    </CardContent>
                </Card>

                {/* Competitive Rank */}
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-400" />
                            <span className="text-3xl font-bold">#{rank.rank}</span>
                            <span className="text-sm text-muted-foreground">/ {rank.total}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{t.intelligence.competitiveRank}</div>
                    </CardContent>
                </Card>

                {/* Active Threats */}
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <AlertTriangle className={`h-5 w-5 ${activeThreats > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
                            <span className="text-3xl font-bold">{activeThreats}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{t.intelligence.activeThreats}</div>
                    </CardContent>
                </Card>
            </div>



            {/* ───────────── Competitor Dialog ───────────── */}
            <CompetitorDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                competitorToEdit={selectedCompetitor}
            />
        </div>
    );
}
