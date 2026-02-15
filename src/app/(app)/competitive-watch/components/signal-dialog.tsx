'use client';

import { useState, useEffect } from 'react';
import { useFounderStore, MarketSignalImpact } from '@/store/founder-store';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SignalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SignalDialog({
    open,
    onOpenChange,
}: SignalDialogProps) {
    const addMarketSignal = useFounderStore(s => s.addMarketSignal);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [source, setSource] = useState('');
    const [impact, setImpact] = useState<MarketSignalImpact>('neutral');

    // Reset form whenever the dialog opens (covers both programmatic and user-initiated opens)
    useEffect(() => {
        if (open) {
            setTitle('');
            setDate(new Date().toISOString().split('T')[0]);
            setDescription('');
            setSource('');
            setImpact('neutral');
        }
    }, [open]);

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
        <Dialog open={open} onOpenChange={onOpenChange}>
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
