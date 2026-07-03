'use client';

import { useState, useEffect } from 'react';
import { useFounderStore, MarketSignalImpact, MarketSignalCategory, MarketSignalUrgency } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SignalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SIGNAL_CATEGORIES: MarketSignalCategory[] = [
    'funding', 'product_launch', 'pricing_change', 'partnership',
    'hiring', 'acquisition', 'market_entry', 'regulation',
    'technology', 'leadership', 'other',
];

const URGENCY_LEVELS: MarketSignalUrgency[] = ['low', 'medium', 'high', 'critical'];

export function SignalDialog({
    open,
    onOpenChange,
}: SignalDialogProps) {
    const addMarketSignal = useFounderStore(s => s.addMarketSignal);
    const competitors = useFounderStore(s => s.competitors);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [source, setSource] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [impact, setImpact] = useState<MarketSignalImpact>('neutral');
    const [category, setCategory] = useState<MarketSignalCategory>('other');
    const [urgency, setUrgency] = useState<MarketSignalUrgency>('medium');
    const [competitorId, setCompetitorId] = useState<string>('');

    useEffect(() => {
        if (open) {
            setTitle('');
            setDate(new Date().toISOString().split('T')[0]);
            setDescription('');
            setSource('');
            setSourceUrl('');
            setImpact('neutral');
            setCategory('other');
            setUrgency('medium');
            setCompetitorId('');
        }
    }, [open]);

    const handleSubmit = () => {
        if (!title.trim()) return;
        addMarketSignal({
            title: title.trim(),
            date,
            description: description.trim() || undefined,
            source: source.trim() || undefined,
            sourceUrl: sourceUrl.trim() || undefined,
            impact,
            category,
            urgency,
            competitorId: competitorId || undefined,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border text-foreground sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t.signals.addSignal}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {language === 'fr' ? 'Enregistrez un nouveau signal de marché.' : 'Record a new market signal.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label className="text-foreground">
                            {language === 'fr' ? 'Titre' : 'Title'} *
                        </Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={language === 'fr' ? 'Titre du signal' : 'Signal title'}
                            className="bg-card border-border text-foreground"
                        />
                    </div>

                    {/* Date + Competitor */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground">{t.signals.date}</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-card border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">
                                {language === 'fr' ? 'Concurrent lié' : 'Related Competitor'}
                            </Label>
                            <Select value={competitorId} onValueChange={setCompetitorId}>
                                <SelectTrigger className="bg-card border-border text-foreground">
                                    <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    <SelectItem value="none" className="hover:bg-muted">—</SelectItem>
                                    {competitors.map((c) => (
                                        <SelectItem key={c.id} value={c.id} className="hover:bg-muted">
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Category + Urgency */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground">
                                {language === 'fr' ? 'Catégorie' : 'Category'}
                            </Label>
                            <Select value={category} onValueChange={(v) => setCategory(v as MarketSignalCategory)}>
                                <SelectTrigger className="bg-card border-border text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    {SIGNAL_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat} className="hover:bg-muted">
                                            {t.signals.categories?.[cat] || cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">
                                {language === 'fr' ? 'Urgence' : 'Urgency'}
                            </Label>
                            <Select value={urgency} onValueChange={(v) => setUrgency(v as MarketSignalUrgency)}>
                                <SelectTrigger className="bg-card border-border text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    {URGENCY_LEVELS.map((u) => (
                                        <SelectItem key={u} value={u} className="hover:bg-muted">
                                            {t.signals.urgency?.[u] || u}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-foreground">{t.signals.description}</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-card border-border text-foreground min-h-[80px]"
                        />
                    </div>

                    {/* Source + Source URL */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground">{t.signals.source}</Label>
                            <Input
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                placeholder={language === 'fr' ? 'Ex: TechCrunch' : 'E.g. TechCrunch'}
                                className="bg-card border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">URL</Label>
                            <Input
                                value={sourceUrl}
                                onChange={(e) => setSourceUrl(e.target.value)}
                                placeholder="https://..."
                                className="bg-card border-border text-foreground"
                            />
                        </div>
                    </div>

                    {/* Impact */}
                    <div className="space-y-2">
                        <Label className="text-foreground">Impact</Label>
                        <RadioGroup
                            value={impact}
                            onValueChange={(val) => setImpact(val as MarketSignalImpact)}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="positive" id="sig-positive" className="border-success text-success" />
                                <Label htmlFor="sig-positive" className="text-success cursor-pointer">{t.signals.impact.positive}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="negative" id="sig-negative" className="border-danger text-danger" />
                                <Label htmlFor="sig-negative" className="text-danger cursor-pointer">{t.signals.impact.negative}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="neutral" id="sig-neutral" className="border-gray-500 text-gray-500" />
                                <Label htmlFor="sig-neutral" className="text-gray-400 cursor-pointer">{t.signals.impact.neutral}</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground">
                        {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!title.trim()}
                        className="bg-primary hover:bg-primary/90 text-foreground"
                    >
                        {t.signals.addSignal}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
