'use client';

import { useState, useCallback, useEffect } from 'react';
import { useFounderStore, Competitor, CompetitorRadarScores, PricingModelType } from '@/store/founder-store';
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
import { Slider } from '@/components/ui/slider';
import { ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

interface CompetitorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    competitorToEdit: Competitor | null;
}

export function CompetitorDialog({
    open,
    onOpenChange,
    competitorToEdit,
}: CompetitorDialogProps) {
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
    // New structured fields
    const [targetSegment, setTargetSegment] = useState('');
    const [businessModel, setBusinessModel] = useState('');
    const [teamSize, setTeamSize] = useState('');
    const [fundingStage, setFundingStage] = useState('');
    const [fundingAmount, setFundingAmount] = useState('');
    const [keyFeatures, setKeyFeatures] = useState('');
    const [differentiators, setDifferentiators] = useState('');
    const [pricingModel, setPricingModel] = useState<PricingModelType | ''>('');
    const [pricingRange, setPricingRange] = useState('');
    const [yearFounded, setYearFounded] = useState('');
    const [geography, setGeography] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isAutoFilling, setIsAutoFilling] = useState(false);

    const handleAutoFill = async () => {
        if (!website.trim()) return;
        setIsAutoFilling(true);
        try {
            const response = await fetch('/api/ai/competitor-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: website.trim(), language }),
            });
            if (!response.ok) throw new Error('Failed');
            const profile = await response.json();

            if (profile.name && !name.trim()) setName(profile.name);
            if (profile.description) setDescription(profile.description);
            if (profile.strengths) setStrengths(profile.strengths);
            if (profile.weaknesses) setWeaknesses(profile.weaknesses);
            if (profile.pricing) setPricing(profile.pricing);
            if (profile.positioning) setPositioning(profile.positioning);
            if (profile.targetSegment) setTargetSegment(profile.targetSegment);
            if (profile.businessModel) setBusinessModel(profile.businessModel);
            if (profile.teamSize) setTeamSize(profile.teamSize);
            if (profile.fundingStage) setFundingStage(profile.fundingStage);
            if (profile.fundingAmount) setFundingAmount(profile.fundingAmount);
            if (profile.keyFeatures?.length) setKeyFeatures(profile.keyFeatures.join(', '));
            if (profile.differentiators?.length) setDifferentiators(profile.differentiators.join(', '));
            if (profile.pricingModel) setPricingModel(profile.pricingModel);
            if (profile.pricingRange) setPricingRange(profile.pricingRange);
            if (profile.yearFounded) setYearFounded(profile.yearFounded);
            if (profile.geography) setGeography(profile.geography);
            if (profile.radarScores) setRadarScores(profile.radarScores);

            setShowAdvanced(true);
            toast({
                title: t.autoFillSuccess || 'Data extracted successfully',
                duration: 3000,
            });
        } catch {
            toast({
                title: t.autoFillError || 'Could not extract data',
                variant: 'destructive',
                duration: 3000,
            });
        } finally {
            setIsAutoFilling(false);
        }
    };

    // Helper to populate form from a competitor (edit mode) or reset to empty (add mode)
    const populateForm = useCallback((competitor: Competitor | null) => {
        if (competitor) {
            setName(competitor.name);
            setWebsite(competitor.website || '');
            setDescription(competitor.description || '');
            setStrengths(competitor.strengths || '');
            setWeaknesses(competitor.weaknesses || '');
            setPricing(competitor.pricing || '');
            setPositioning(competitor.positioning || '');
            setRadarScores(competitor.radarScores || DEFAULT_RADAR_SCORES);
            setTargetSegment(competitor.targetSegment || '');
            setBusinessModel(competitor.businessModel || '');
            setTeamSize(competitor.teamSize || '');
            setFundingStage(competitor.fundingStage || '');
            setFundingAmount(competitor.fundingAmount || '');
            setKeyFeatures(competitor.keyFeatures?.join(', ') || '');
            setDifferentiators(competitor.differentiators?.join(', ') || '');
            setPricingModel(competitor.pricingModel || '');
            setPricingRange(competitor.pricingRange || '');
            setYearFounded(competitor.yearFounded || '');
            setGeography(competitor.geography || '');
            setShowAdvanced(true);
        } else {
            setName('');
            setWebsite('');
            setDescription('');
            setStrengths('');
            setWeaknesses('');
            setPricing('');
            setPositioning('');
            setRadarScores(DEFAULT_RADAR_SCORES);
            setTargetSegment('');
            setBusinessModel('');
            setTeamSize('');
            setFundingStage('');
            setFundingAmount('');
            setKeyFeatures('');
            setDifferentiators('');
            setPricingModel('');
            setPricingRange('');
            setYearFounded('');
            setGeography('');
            setShowAdvanced(false);
        }
    }, []);

    // Populate form when dialog opens programmatically (via open prop change)
    useEffect(() => {
        if (open) {
            populateForm(competitorToEdit);
        }
    }, [open, competitorToEdit, populateForm]);

    // Also handle user-initiated open/close (e.g. clicking outside the dialog)
    const handleOpenChange = useCallback((isOpen: boolean) => {
        if (isOpen) {
            populateForm(competitorToEdit);
        }
        onOpenChange(isOpen);
    }, [competitorToEdit, onOpenChange, populateForm]);

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
            targetSegment: targetSegment.trim() || undefined,
            businessModel: businessModel.trim() || undefined,
            teamSize: teamSize.trim() || undefined,
            fundingStage: fundingStage.trim() || undefined,
            fundingAmount: fundingAmount.trim() || undefined,
            keyFeatures: keyFeatures.trim() ? keyFeatures.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            differentiators: differentiators.trim() ? differentiators.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            pricingModel: (pricingModel as PricingModelType) || undefined,
            pricingRange: pricingRange.trim() || undefined,
            yearFounded: yearFounded.trim() || undefined,
            geography: geography.trim() || undefined,
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
            <DialogContent className="bg-card border-border text-foreground sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {competitorToEdit ? (language === 'fr' ? 'Modifier Concurrent' : 'Edit Competitor') : t.addCompetitor}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {competitorToEdit
                            ? (language === 'fr' ? 'Mettez a jour les informations du concurrent.' : 'Update competitor details.')
                            : (language === 'fr' ? 'Ajoutez un nouveau concurrent a surveiller.' : 'Add a new competitor to watch.')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label className="text-foreground">{t.competitor.name} *</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.competitor.name}
                            className="bg-card border-border text-foreground"
                        />
                    </div>
                    {/* Website + Auto-fill */}
                    <div className="space-y-2">
                        <Label className="text-foreground">{t.competitor.website}</Label>
                        <div className="flex gap-2">
                            <Input
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://..."
                                className="bg-card border-border text-foreground flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAutoFill}
                                disabled={!website.trim() || isAutoFilling}
                                className="border-primary/50 text-accent-foreground hover:bg-primary/10 shrink-0"
                            >
                                {isAutoFilling ? (
                                    <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> {t.autoFilling || 'Analyzing...'}</>
                                ) : (
                                    <><Sparkles className="mr-1.5 h-3.5 w-3.5" /> {t.autoFillFromUrl || 'Auto-fill'}</>
                                )}
                            </Button>
                        </div>
                    </div>
                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-foreground">{t.competitor.description}</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t.competitor.description}
                            className="bg-card border-border text-foreground min-h-[60px]"
                        />
                    </div>
                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground">{t.competitor.strengths}</Label>
                            <Textarea
                                value={strengths}
                                onChange={(e) => setStrengths(e.target.value)}
                                className="bg-card border-border text-foreground min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">{t.competitor.weaknesses}</Label>
                            <Textarea
                                value={weaknesses}
                                onChange={(e) => setWeaknesses(e.target.value)}
                                className="bg-card border-border text-foreground min-h-[80px]"
                            />
                        </div>
                    </div>
                    {/* Pricing & Positioning */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground">{t.competitor.pricing}</Label>
                            <Input
                                value={pricing}
                                onChange={(e) => setPricing(e.target.value)}
                                className="bg-card border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">{t.competitor.positioning}</Label>
                            <Input
                                value={positioning}
                                onChange={(e) => setPositioning(e.target.value)}
                                className="bg-card border-border text-foreground"
                            />
                        </div>
                    </div>

                    {/* Collapsible Strategic Data */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-2 text-sm text-primary hover:text-accent-foreground transition-colors w-full"
                        >
                            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {language === 'fr' ? 'Données stratégiques avancées' : 'Advanced strategic data'}
                        </button>
                        {showAdvanced && (
                            <div className="space-y-4 mt-3 pl-2 border-l-2 border-primary/30">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-foreground text-sm">{t.competitor.targetSegment}</Label>
                                        <Input value={targetSegment} onChange={(e) => setTargetSegment(e.target.value)} placeholder={language === 'fr' ? 'Ex: PME SaaS' : 'E.g. SMB SaaS'} className="bg-card border-border text-foreground" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-foreground text-sm">{t.competitor.businessModel}</Label>
                                        <Input value={businessModel} onChange={(e) => setBusinessModel(e.target.value)} placeholder={language === 'fr' ? 'Ex: SaaS B2B' : 'E.g. B2B SaaS'} className="bg-card border-border text-foreground" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-foreground text-sm">{t.competitor.teamSize}</Label>
                                        <Input value={teamSize} onChange={(e) => setTeamSize(e.target.value)} placeholder="1-10, 11-50..." className="bg-card border-border text-foreground" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-foreground text-sm">{t.competitor.yearFounded}</Label>
                                        <Input value={yearFounded} onChange={(e) => setYearFounded(e.target.value)} placeholder="2023" className="bg-card border-border text-foreground" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-foreground text-sm">{t.competitor.fundingStage}</Label>
                                        <Input value={fundingStage} onChange={(e) => setFundingStage(e.target.value)} placeholder={language === 'fr' ? 'Ex: Série A' : 'E.g. Series A'} className="bg-card border-border text-foreground" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-foreground text-sm">{t.competitor.fundingAmount}</Label>
                                        <Input value={fundingAmount} onChange={(e) => setFundingAmount(e.target.value)} placeholder="$5M" className="bg-card border-border text-foreground" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-foreground text-sm">{t.competitor.pricingModel}</Label>
                                        <Select value={pricingModel} onValueChange={(v) => setPricingModel(v as PricingModelType)}>
                                            <SelectTrigger className="bg-card border-border text-foreground">
                                                <SelectValue placeholder="—" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border text-foreground">
                                                {(['free', 'freemium', 'subscription', 'usage', 'enterprise', 'other'] as PricingModelType[]).map(pm => (
                                                    <SelectItem key={pm} value={pm} className="hover:bg-muted">{t.pricingModels[pm]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-foreground text-sm">{t.competitor.pricingRange}</Label>
                                        <Input value={pricingRange} onChange={(e) => setPricingRange(e.target.value)} placeholder="$0 - $99/mo" className="bg-card border-border text-foreground" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground text-sm">{t.competitor.geography}</Label>
                                    <Input value={geography} onChange={(e) => setGeography(e.target.value)} placeholder={language === 'fr' ? 'Ex: Europe, US' : 'E.g. Europe, US'} className="bg-card border-border text-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground text-sm">{t.competitor.keyFeatures}</Label>
                                    <Input value={keyFeatures} onChange={(e) => setKeyFeatures(e.target.value)} placeholder={language === 'fr' ? 'Séparées par des virgules' : 'Comma separated'} className="bg-card border-border text-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground text-sm">{t.competitor.differentiators}</Label>
                                    <Input value={differentiators} onChange={(e) => setDifferentiators(e.target.value)} placeholder={language === 'fr' ? 'Séparés par des virgules' : 'Comma separated'} className="bg-card border-border text-foreground" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Radar Scores */}
                    <div className="space-y-3 pt-2">
                        <Label className="text-foreground text-sm font-semibold">
                            {language === 'fr' ? 'Scores Radar (1-10)' : 'Radar Scores (1-10)'}
                        </Label>
                        {radarAxesKeys.map((axis) => (
                            <div key={axis} className="flex items-center gap-3">
                                <span className="text-muted-foreground text-sm w-24 shrink-0">{t.radarAxes[axis]}</span>
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
                                <span className="text-foreground text-sm w-6 text-right font-mono">
                                    {radarScores[axis]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground">
                        {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                        className="bg-primary hover:bg-primary/90 text-foreground"
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
