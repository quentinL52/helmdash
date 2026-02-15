'use client';

import { useState, useMemo, useCallback } from 'react';
import { useFounderStore, Competitor, MarketSignal, MarketSignalImpact, CompetitorRadarScores } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from 'recharts';
import {
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    Globe,
    TrendingUp,
    TrendingDown,
    Minus,
    Signal,
    Eye,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// --- Color palette for radar chart lines ---
const RADAR_COLORS = [
    '#6c5ce7',
    '#00cec9',
    '#fd79a8',
    '#fdcb6e',
    '#e17055',
    '#0984e3',
    '#55efc4',
    '#fab1a0',
    '#74b9ff',
    '#a29bfe',
];

const DEFAULT_RADAR_SCORES: CompetitorRadarScores = {
    price: 5,
    features: 5,
    ux: 5,
    market: 5,
    innovation: 5,
    support: 5,
};

const DEFAULT_SWOT = {
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: '',
};

// ========================================
// Competitor Dialog (Add/Edit)
// ========================================
function CompetitorDialog({
    open,
    onOpenChange,
    competitorToEdit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    competitorToEdit: Competitor | null;
}) {
    const addCompetitor = useFounderStore(s => s.addCompetitor);
    const updateCompetitor = useFounderStore(s => s.updateCompetitor);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');
    const [strengths, setStrengths] = useState('');
    const [weaknesses, setWeaknesses] = useState('');
    const [pricing, setPricing] = useState('');
    const [positioning, setPositioning] = useState('');
    const [radarScores, setRadarScores] = useState<CompetitorRadarScores>(DEFAULT_RADAR_SCORES);

    // Reset form when dialog opens
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen && competitorToEdit) {
            setName(competitorToEdit.name);
            setWebsite(competitorToEdit.website || '');
            setDescription(competitorToEdit.description || '');
            setStrengths(competitorToEdit.strengths || '');
            setWeaknesses(competitorToEdit.weaknesses || '');
            setPricing(competitorToEdit.pricing || '');
            setPositioning(competitorToEdit.positioning || '');
            setRadarScores(competitorToEdit.radarScores || DEFAULT_RADAR_SCORES);
        } else if (isOpen) {
            setName('');
            setWebsite('');
            setDescription('');
            setStrengths('');
            setWeaknesses('');
            setPricing('');
            setPositioning('');
            setRadarScores(DEFAULT_RADAR_SCORES);
        }
        onOpenChange(isOpen);
    };

    const handleSubmit = () => {
        if (!name.trim()) return;
        const data = {
            name: name.trim(),
            website: website.trim() || undefined,
            description: description.trim() || undefined,
            strengths: strengths.trim() || undefined,
            weaknesses: weaknesses.trim() || undefined,
            pricing: pricing.trim() || undefined,
            positioning: positioning.trim() || undefined,
            radarScores,
            swot: competitorToEdit?.swot || DEFAULT_SWOT,
        };

        if (competitorToEdit) {
            updateCompetitor(competitorToEdit.id, data);
        } else {
            addCompetitor(data);
        }
        onOpenChange(false);
    };

    const radarAxesKeys = ['price', 'features', 'ux', 'market', 'innovation', 'support'] as const;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="bg-[#1a1d2d] border-[#282c3a] text-[#e8e9ed] sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {competitorToEdit ? (language === 'fr' ? 'Modifier Concurrent' : 'Edit Competitor') : t.addCompetitor}
                    </DialogTitle>
                    <DialogDescription className="text-[#8b8fa3]">
                        {competitorToEdit
                            ? (language === 'fr' ? 'Mettez a jour les informations du concurrent.' : 'Update competitor details.')
                            : (language === 'fr' ? 'Ajoutez un nouveau concurrent a surveiller.' : 'Add a new competitor to watch.')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label className="text-[#e8e9ed]">{t.competitor.name} *</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.competitor.name}
                            className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed]"
                        />
                    </div>
                    {/* Website */}
                    <div className="space-y-2">
                        <Label className="text-[#e8e9ed]">{t.competitor.website}</Label>
                        <Input
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://..."
                            className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed]"
                        />
                    </div>
                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-[#e8e9ed]">{t.competitor.description}</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t.competitor.description}
                            className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed] min-h-[60px]"
                        />
                    </div>
                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[#e8e9ed]">{t.competitor.strengths}</Label>
                            <Textarea
                                value={strengths}
                                onChange={(e) => setStrengths(e.target.value)}
                                className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed] min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#e8e9ed]">{t.competitor.weaknesses}</Label>
                            <Textarea
                                value={weaknesses}
                                onChange={(e) => setWeaknesses(e.target.value)}
                                className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed] min-h-[80px]"
                            />
                        </div>
                    </div>
                    {/* Pricing & Positioning */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[#e8e9ed]">{t.competitor.pricing}</Label>
                            <Input
                                value={pricing}
                                onChange={(e) => setPricing(e.target.value)}
                                className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#e8e9ed]">{t.competitor.positioning}</Label>
                            <Input
                                value={positioning}
                                onChange={(e) => setPositioning(e.target.value)}
                                className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed]"
                            />
                        </div>
                    </div>

                    {/* Radar Scores */}
                    <div className="space-y-3 pt-2">
                        <Label className="text-[#e8e9ed] text-sm font-semibold">
                            {language === 'fr' ? 'Scores Radar (1-10)' : 'Radar Scores (1-10)'}
                        </Label>
                        {radarAxesKeys.map((axis) => (
                            <div key={axis} className="flex items-center gap-3">
                                <span className="text-[#8b8fa3] text-sm w-24 shrink-0">{t.radarAxes[axis]}</span>
                                <Slider
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={[radarScores[axis]]}
                                    onValueChange={(val) =>
                                        setRadarScores((prev) => ({ ...prev, [axis]: val[0] }))
                                    }
                                    className="flex-1"
                                />
                                <span className="text-[#e8e9ed] text-sm w-6 text-right font-mono">
                                    {radarScores[axis]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[#8b8fa3]">
                        {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                        className="bg-[#6c5ce7] hover:bg-[#5a4bd6] text-white"
                    >
                        {competitorToEdit
                            ? (language === 'fr' ? 'Enregistrer' : 'Save')
                            : t.addCompetitor}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ========================================
// Signal Dialog (Add)
// ========================================
function SignalDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const addMarketSignal = useFounderStore(s => s.addMarketSignal);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [source, setSource] = useState('');
    const [impact, setImpact] = useState<MarketSignalImpact>('neutral');

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setTitle('');
            setDate(new Date().toISOString().split('T')[0]);
            setDescription('');
            setSource('');
            setImpact('neutral');
        }
        onOpenChange(isOpen);
    };

    const handleSubmit = () => {
        if (!title.trim()) return;
        addMarketSignal({
            title: title.trim(),
            date,
            description: description.trim() || undefined,
            source: source.trim() || undefined,
            impact,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="bg-[#1a1d2d] border-[#282c3a] text-[#e8e9ed] sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t.signals.addSignal}</DialogTitle>
                    <DialogDescription className="text-[#8b8fa3]">
                        {language === 'fr' ? 'Enregistrez un nouveau signal de marche.' : 'Record a new market signal.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-[#e8e9ed]">{t.signals.date}</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#e8e9ed]">{t.competitor.name} *</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={language === 'fr' ? 'Titre du signal' : 'Signal title'}
                            className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#e8e9ed]">{t.signals.description}</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed] min-h-[80px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#e8e9ed]">{t.signals.source}</Label>
                        <Input
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            placeholder={language === 'fr' ? 'Ex: TechCrunch, blog concurrent...' : 'E.g. TechCrunch, competitor blog...'}
                            className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#e8e9ed]">{language === 'fr' ? 'Impact' : 'Impact'}</Label>
                        <RadioGroup
                            value={impact}
                            onValueChange={(val) => setImpact(val as MarketSignalImpact)}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="positive" id="positive" className="border-green-500 text-green-500" />
                                <Label htmlFor="positive" className="text-green-400 cursor-pointer">{t.signals.impact.positive}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="negative" id="negative" className="border-red-500 text-red-500" />
                                <Label htmlFor="negative" className="text-red-400 cursor-pointer">{t.signals.impact.negative}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="neutral" id="neutral" className="border-gray-500 text-gray-500" />
                                <Label htmlFor="neutral" className="text-gray-400 cursor-pointer">{t.signals.impact.neutral}</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[#8b8fa3]">
                        {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!title.trim()}
                        className="bg-[#6c5ce7] hover:bg-[#5a4bd6] text-white"
                    >
                        {t.signals.addSignal}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ========================================
// Tab 1: Overview
// ========================================
function OverviewTab() {
    const competitors = useFounderStore(s => s.competitors);
    const deleteCompetitor = useFounderStore(s => s.deleteCompetitor);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        setSelectedCompetitor(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-[#e8e9ed]">{t.title}</h2>
                    <p className="text-[#8b8fa3] text-sm">{t.subtitle}</p>
                </div>
                <Button onClick={handleNew} className="bg-[#6c5ce7] hover:bg-[#5a4bd6] text-white">
                    <Plus className="mr-2 h-4 w-4" /> {t.addCompetitor}
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b8fa3]" />
                    <Input
                        placeholder={t.searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-[#181a24] border-[#282c3a] text-[#e8e9ed] focus:ring-[#6c5ce7]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-[#282c3a] bg-[#181a24]/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#181a24]">
                        <TableRow className="border-[#282c3a] hover:bg-[#181a24]">
                            <TableHead className="text-[#8b8fa3]">{t.competitor.name}</TableHead>
                            <TableHead className="text-[#8b8fa3]">{t.competitor.website}</TableHead>
                            <TableHead className="text-[#8b8fa3]">{t.competitor.pricing}</TableHead>
                            <TableHead className="text-[#8b8fa3]">{t.competitor.positioning}</TableHead>
                            <TableHead className="text-right text-[#8b8fa3]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCompetitors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-[#8b8fa3]">
                                    {t.noCompetitors}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCompetitors.map((competitor) => (
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
                                    <TableCell className="text-[#dfe1e6] text-sm max-w-[200px]">
                                        <span className="line-clamp-1">
                                            {competitor.positioning || <span className="text-[#8b8fa3]">-</span>}
                                        </span>
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
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CompetitorDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                competitorToEdit={selectedCompetitor}
            />
        </div>
    );
}

// ========================================
// Tab 2: Radar Chart
// ========================================
function RadarTab() {
    const competitors = useFounderStore(s => s.competitors);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const radarAxesKeys = ['price', 'features', 'ux', 'market', 'innovation', 'support'] as const;

    const radarData = useMemo(() => {
        return radarAxesKeys.map((axis) => {
            const entry: Record<string, string | number> = {
                axis: t.radarAxes[axis],
            };
            competitors.forEach((c) => {
                entry[c.name] = c.radarScores?.[axis] ?? 5;
            });
            return entry;
        });
    }, [competitors, language]);

    if (competitors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-[#8b8fa3] space-y-2">
                <Eye className="h-12 w-12 opacity-40" />
                <p>{t.noCompetitors}</p>
                <p className="text-sm">
                    {language === 'fr'
                        ? 'Ajoutez des concurrents dans l\'onglet Vue d\'ensemble pour voir le radar.'
                        : 'Add competitors in the Overview tab to see the radar chart.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-[#e8e9ed]">
                    {language === 'fr' ? 'Carte Radar des Concurrents' : 'Competitor Radar Chart'}
                </h2>
                <p className="text-[#8b8fa3] text-sm">
                    {language === 'fr'
                        ? 'Comparez visuellement les forces de vos concurrents.'
                        : 'Visually compare your competitors strengths.'}
                </p>
            </div>
            <Card className="bg-[#181a24] border-[#282c3a]">
                <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={500}>
                        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
                            <PolarGrid stroke="#282c3a" />
                            <PolarAngleAxis
                                dataKey="axis"
                                tick={{ fill: '#8b8fa3', fontSize: 13 }}
                            />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 10]}
                                tick={{ fill: '#8b8fa3', fontSize: 11 }}
                                tickCount={6}
                            />
                            {competitors.map((c, idx) => (
                                <Radar
                                    key={c.id}
                                    name={c.name}
                                    dataKey={c.name}
                                    stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
                                    fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
                                    fillOpacity={0.15}
                                    strokeWidth={2}
                                />
                            ))}
                            <Legend
                                wrapperStyle={{ color: '#e8e9ed', paddingTop: '20px' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1d2d',
                                    border: '1px solid #282c3a',
                                    borderRadius: '8px',
                                    color: '#e8e9ed',
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

// ========================================
// Tab 3: SWOT Analysis
// ========================================
function SwotTab() {
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

// ========================================
// Tab 4: Market Signals
// ========================================
function SignalsTab() {
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

// ========================================
// Main Page
// ========================================
export default function CompetitiveWatchPage() {
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    return (
        <div className="h-full flex flex-col p-8 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#e8e9ed]">{t.title}</h1>
                <p className="text-[#8b8fa3]">{t.subtitle}</p>
            </div>

            <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                <TabsList className="grid w-full max-w-[600px] grid-cols-4 bg-[#181a24] text-[#8b8fa3] mb-6">
                    <TabsTrigger
                        value="overview"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        {t.tabs.overview}
                    </TabsTrigger>
                    <TabsTrigger
                        value="radar"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        {t.tabs.radar}
                    </TabsTrigger>
                    <TabsTrigger
                        value="swot"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        {t.tabs.swot}
                    </TabsTrigger>
                    <TabsTrigger
                        value="signals"
                        className="data-[state=active]:bg-[#6c5ce7] data-[state=active]:text-white"
                    >
                        {t.tabs.signals}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="flex-1 mt-0">
                    <OverviewTab />
                </TabsContent>
                <TabsContent value="radar" className="flex-1 mt-0">
                    <RadarTab />
                </TabsContent>
                <TabsContent value="swot" className="flex-1 mt-0">
                    <SwotTab />
                </TabsContent>
                <TabsContent value="signals" className="flex-1 mt-0">
                    <SignalsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
