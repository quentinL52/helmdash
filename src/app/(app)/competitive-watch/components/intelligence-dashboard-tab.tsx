'use client';

import { useState, useMemo } from 'react';
import { useFounderStore, Competitor, CompetitiveAlert } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import {
    computeHealthBreakdown,
    computeHealthScore,
    computeCompetitiveRank,
    computeFeatureCoverage,
    countActiveThreats,
} from '@/lib/competitive-intelligence';
import { HealthScoreGauge } from './health-score-gauge';
import { AlertFeed } from './alert-feed';
import { CompetitorDialog } from './competitor-dialog';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
    Brain,
    Scan,
    Camera,
    Eye,
    Shield,
    TrendingUp,
    TrendingDown,
    Minus,
    Search,
    Plus,
    Edit,
    Trash,
    ExternalLink,
} from 'lucide-react';

interface IntelligenceDashboardTabProps {
    onTabChange?: (tab: string) => void;
}

export function IntelligenceDashboardTab({ onTabChange }: IntelligenceDashboardTabProps) {
    // --- Store selectors ---
    const competitors = useFounderStore(s => s.competitors);
    const mySolution = useFounderStore(s => s.mySolution);
    const marketSignals = useFounderStore(s => s.marketSignals);
    const competitiveIntelligence = useFounderStore(s => s.competitiveIntelligence);
    const deleteCompetitor = useFounderStore(s => s.deleteCompetitor);
    const acknowledgeAlert = useFounderStore(s => s.acknowledgeAlert);
    const addCompetitiveSnapshot = useFounderStore(s => s.addCompetitiveSnapshot);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    // --- Local state ---
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [competitorToEdit, setCompetitorToEdit] = useState<Competitor | null>(null);

    // --- Computed values ---
    const healthBreakdown = useMemo(
        () => computeHealthBreakdown(mySolution, competitors, marketSignals),
        [mySolution, competitors, marketSignals]
    );

    const healthScore = useMemo(() => {
        if (competitiveIntelligence) {
            return competitiveIntelligence.healthScore;
        }
        return computeHealthScore(healthBreakdown);
    }, [competitiveIntelligence, healthBreakdown]);

    const activeThreatsCount = useMemo(
        () => countActiveThreats(competitiveIntelligence?.alerts || []),
        [competitiveIntelligence]
    );

    const featureCoverage = useMemo(
        () => computeFeatureCoverage(mySolution),
        [mySolution]
    );

    const competitiveRank = useMemo(
        () => computeCompetitiveRank(mySolution, competitors),
        [mySolution, competitors]
    );

    const alerts: CompetitiveAlert[] = competitiveIntelligence?.alerts || [];

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

    // --- Handlers ---
    const handleTakeSnapshot = () => {
        const now = new Date().toISOString();
        competitors.forEach((competitor) => {
            addCompetitiveSnapshot({
                date: now,
                competitorId: competitor.id,
                radarScores: { ...competitor.radarScores },
                overallThreatLevel: competitor.threatLevel ?? 0,
            });
        });
        toast({
            title: language === 'fr' ? 'Snapshot enregistré' : 'Snapshot saved',
            description: language === 'fr'
                ? 'Les positions actuelles ont été sauvegardées dans l\'historique.'
                : 'Current positions have been saved to history.',
        });
    };

    const handleEditCompetitor = (competitor: Competitor) => {
        setCompetitorToEdit(competitor);
        setDialogOpen(true);
    };

    const handleAddCompetitor = () => {
        setCompetitorToEdit(null);
        setDialogOpen(true);
    };

    const getThreatLevelBadge = (threatLevel?: number) => {
        const level = threatLevel ?? 0;
        if (level > 60) {
            return (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">
                    {language === 'fr' ? 'Haute' : 'High'}
                </Badge>
            );
        }
        if (level > 30) {
            return (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30">
                    {language === 'fr' ? 'Moyenne' : 'Medium'}
                </Badge>
            );
        }
        return (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
                {language === 'fr' ? 'Faible' : 'Low'}
            </Badge>
        );
    };

    const getMomentumIcon = (momentum?: string) => {
        switch (momentum) {
            case 'rising':
                return <TrendingUp className="h-4 w-4 text-red-400" />;
            case 'declining':
                return <TrendingDown className="h-4 w-4 text-green-400" />;
            default:
                return <Minus className="h-4 w-4 text-[#8b8fa3]" />;
        }
    };

    const getMomentumText = (momentum?: string) => {
        switch (momentum) {
            case 'rising':
                return t.momentum?.rising || 'Rising';
            case 'declining':
                return t.momentum?.declining || 'Declining';
            default:
                return t.momentum?.stable || 'Stable';
        }
    };

    const getLastSignalForCompetitor = (competitor: Competitor) => {
        // Check by competitorId first, then fallback to name match in title
        const byId = marketSignals
            .filter((s) => s.competitorId === competitor.id)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        if (byId.length > 0) return byId[0].title;

        const byName = marketSignals
            .filter((s) => s.title.toLowerCase().includes(competitor.name.toLowerCase()))
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        if (byName.length > 0) return byName[0].title;

        return null;
    };

    const getThreatDotColor = (threatLevel?: number) => {
        const level = threatLevel ?? 0;
        if (level > 60) return 'bg-red-400';
        if (level > 30) return 'bg-yellow-400';
        return 'bg-green-400';
    };

    return (
        <div className="space-y-6">
            {/* ============================================================ */}
            {/* ROW 1 - KPI Cards                                            */}
            {/* ============================================================ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Health Score */}
                <Card className="bg-[#1e2029] border-[#2b2d36]">
                    <CardContent className="flex flex-col items-center justify-center pt-6 pb-4">
                        <HealthScoreGauge
                            score={healthScore}
                            size={100}
                            label={t.intelligence.healthScore}
                        />
                    </CardContent>
                </Card>

                {/* Active Threats */}
                <Card className="bg-[#1e2029] border-[#2b2d36]">
                    <CardContent className="flex flex-col items-center justify-center pt-6 pb-4 gap-2">
                        <div className="flex items-center gap-2">
                            <Shield
                                className={`h-6 w-6 ${activeThreatsCount > 0 ? 'text-red-400' : 'text-[#8b8fa3]'
                                    }`}
                            />
                            <span
                                className={`text-3xl font-bold ${activeThreatsCount > 0 ? 'text-red-400' : 'text-[#e8e9ed]'
                                    }`}
                            >
                                {activeThreatsCount}
                            </span>
                        </div>
                        <span className="text-sm text-[#8b8fa3]">
                            {t.intelligence.activeThreats}
                        </span>
                    </CardContent>
                </Card>

                {/* Feature Coverage */}
                <Card className="bg-[#1e2029] border-[#2b2d36]">
                    <CardContent className="flex flex-col items-center justify-center pt-6 pb-4 gap-3">
                        <span className="text-3xl font-bold text-[#e8e9ed]">
                            {featureCoverage}%
                        </span>
                        <Progress
                            value={featureCoverage}
                            className="h-2 w-full max-w-[140px] bg-[#2b2d36]"
                            indicatorClassName="bg-[#6c5ce7]"
                        />
                        <span className="text-sm text-[#8b8fa3]">
                            {t.intelligence.featureCoverage}
                        </span>
                    </CardContent>
                </Card>

                {/* Competitive Rank */}
                <Card className="bg-[#1e2029] border-[#2b2d36]">
                    <CardContent className="flex flex-col items-center justify-center pt-6 pb-4 gap-2">
                        <span className="text-3xl font-bold text-[#e8e9ed]">
                            {competitiveRank.rank}{' '}
                            <span className="text-lg font-normal text-[#8b8fa3]">
                                / {competitiveRank.total}
                            </span>
                        </span>
                        <span className="text-sm text-[#8b8fa3]">
                            {t.intelligence.competitiveRank}
                        </span>
                    </CardContent>
                </Card>
            </div>

            {/* ============================================================ */}
            {/* ROW 2 - Alert Feed + Quick Actions                           */}
            {/* ============================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Alert Feed (3 cols) */}
                <div className="lg:col-span-3">
                    <Card className="bg-[#1e2029] border-[#2b2d36] h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-[#e8e9ed] text-lg">
                                {t.alerts.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {competitiveIntelligence ? (
                                <AlertFeed
                                    alerts={alerts}
                                    onAcknowledge={acknowledgeAlert}
                                    language={language}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Brain className="h-10 w-10 text-[#8b8fa3] mb-3 opacity-50" />
                                    <p className="text-[#8b8fa3] text-sm max-w-xs">
                                        {t.intelligence.noAnalysisYet}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions (2 cols) */}
                <div className="lg:col-span-2">
                    <Card className="bg-[#1e2029] border-[#2b2d36] h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-[#e8e9ed] text-lg">
                                {t.quickActions}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <Button
                                className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white hover:opacity-90 transition-opacity"
                                onClick={() => onTabChange?.('ai-strategy')}
                            >
                                <Brain className="mr-2 h-4 w-4" />
                                {t.intelligence.runAnalysis}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full border-[#2b2d36] text-[#e8e9ed] hover:bg-[#2b2d36]/50"
                                onClick={() => onTabChange?.('signals')}
                            >
                                <Scan className="mr-2 h-4 w-4" />
                                {t.intelligence.scanNews}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full border-[#2b2d36] text-[#e8e9ed] hover:bg-[#2b2d36]/50"
                                onClick={handleTakeSnapshot}
                            >
                                <Camera className="mr-2 h-4 w-4" />
                                {t.intelligence.takeSnapshot}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full border-[#2b2d36] text-[#e8e9ed] hover:bg-[#2b2d36]/50"
                                onClick={() => onTabChange?.('ai-strategy')}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                {t.intelligence.viewScenarios}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ============================================================ */}
            {/* ROW 3 - Competitor Mini-Cards (Horizontal Scroll)            */}
            {/* ============================================================ */}
            {competitors.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {competitors.map((competitor) => {
                        const lastSignal = getLastSignalForCompetitor(competitor);
                        return (
                            <div
                                key={competitor.id}
                                className="min-w-[220px] bg-[#1e2029] border border-[#2b2d36] rounded-lg p-4 flex flex-col gap-2 shrink-0"
                            >
                                {/* Name + Threat dot */}
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${getThreatDotColor(
                                            competitor.threatLevel
                                        )}`}
                                    />
                                    <span className="font-semibold text-[#e8e9ed] text-sm truncate">
                                        {competitor.name}
                                    </span>
                                </div>

                                {/* Momentum */}
                                <div className="flex items-center gap-1.5">
                                    {getMomentumIcon(competitor.momentum)}
                                    <span className="text-xs text-[#8b8fa3]">
                                        {getMomentumText(competitor.momentum)}
                                    </span>
                                </div>

                                {/* Last signal */}
                                {lastSignal && (
                                    <p className="text-xs text-[#8b8fa3] line-clamp-2 mt-1">
                                        {lastSignal}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ============================================================ */}
            {/* ROW 4 - Enhanced Competitor Table                            */}
            {/* ============================================================ */}
            <Card className="bg-[#1e2029] border-[#2b2d36]">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-[#e8e9ed] text-lg">
                            {language === 'fr' ? 'Concurrents' : 'Competitors'}
                        </CardTitle>
                        <Button
                            onClick={handleAddCompetitor}
                            className="bg-[#6c5ce7] hover:bg-[#5a4bd6] text-white"
                            size="sm"
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            {t.addCompetitor}
                        </Button>
                    </div>
                    {/* Search */}
                    <div className="relative max-w-sm pt-2">
                        <Search className="absolute left-3 top-1/2 mt-1 -translate-y-1/2 h-4 w-4 text-[#8b8fa3]" />
                        <Input
                            placeholder={t.searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-[#12141c] border-[#2b2d36] text-[#e8e9ed] focus:ring-[#6c5ce7]"
                        />
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="rounded-lg border border-[#2b2d36] overflow-hidden">
                        <Table>
                            <TableHeader className="bg-[#12141c]">
                                <TableRow className="border-[#2b2d36] hover:bg-[#12141c]">
                                    <TableHead className="text-[#8b8fa3]">
                                        {t.competitor.name}
                                    </TableHead>
                                    <TableHead className="text-[#8b8fa3]">
                                        {t.competitor.pricing}
                                    </TableHead>
                                    <TableHead className="text-[#8b8fa3]">
                                        {t.competitor.positioning}
                                    </TableHead>
                                    <TableHead className="text-[#8b8fa3]">
                                        {t.threatLevel}
                                    </TableHead>
                                    <TableHead className="text-[#8b8fa3]">
                                        {language === 'fr' ? 'Momentum' : 'Momentum'}
                                    </TableHead>
                                    <TableHead className="text-right text-[#8b8fa3]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCompetitors.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-[#8b8fa3]"
                                        >
                                            {t.noCompetitors}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCompetitors.map((competitor) => (
                                        <TableRow
                                            key={competitor.id}
                                            className="border-[#2b2d36] hover:bg-[#2b2d36]/30 group"
                                        >
                                            {/* Name */}
                                            <TableCell className="font-medium text-[#e8e9ed]">
                                                <div className="flex items-center gap-2">
                                                    <span>{competitor.name}</span>
                                                    {competitor.website && (
                                                        <a
                                                            href={competitor.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[#6c5ce7] hover:text-[#a29bfe] transition-colors"
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Pricing */}
                                            <TableCell className="text-[#e8e9ed] text-sm">
                                                {competitor.pricing || (
                                                    <span className="text-[#8b8fa3]">-</span>
                                                )}
                                            </TableCell>

                                            {/* Positioning */}
                                            <TableCell className="text-[#e8e9ed] text-sm max-w-[200px]">
                                                <span className="line-clamp-1">
                                                    {competitor.positioning || (
                                                        <span className="text-[#8b8fa3]">-</span>
                                                    )}
                                                </span>
                                            </TableCell>

                                            {/* Threat Level */}
                                            <TableCell>
                                                {getThreatLevelBadge(competitor.threatLevel)}
                                            </TableCell>

                                            {/* Momentum */}
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    {getMomentumIcon(competitor.momentum)}
                                                    <span className="text-sm text-[#8b8fa3]">
                                                        {getMomentumText(competitor.momentum)}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-[#8b8fa3] hover:text-[#6c5ce7]"
                                                        onClick={() =>
                                                            handleEditCompetitor(competitor)
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-[#8b8fa3] hover:text-red-400"
                                                        onClick={() =>
                                                            deleteCompetitor(competitor.id)
                                                        }
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Competitor Dialog */}
            <CompetitorDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                competitorToEdit={competitorToEdit}
            />
        </div>
    );
}
