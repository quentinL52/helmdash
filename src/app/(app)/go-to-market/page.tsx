'use client';

import { useState, useEffect } from 'react';
import { useFounderStore, GoToMarketStrategy } from '@/store/founder-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Target, BookOpen, Map, Zap, PenTool, Save } from 'lucide-react';
import { useGamification } from '@/hooks/use-gamification';

export default function GoToMarketPage() {
    const { goToMarket, updateGoToMarket } = useFounderStore();
    const [localData, setLocalData] = useState<GoToMarketStrategy>(goToMarket);
    const [mounted, setMounted] = useState(false);
    const { awardXP } = useGamification();

    useEffect(() => {
        setLocalData(goToMarket);
        setMounted(true);
    }, [goToMarket]);

    const handleSave = () => {
        updateGoToMarket(localData);
        awardXP('gtm_milestone');
        toast({
            title: "Stratégie GTM sauvegardée",
            description: "Vos modifications ont été enregistrées avec succès.",
        });
    };

    if (!mounted) return null;

    const handleChange = (field: keyof GoToMarketStrategy, value: string) => {
        setLocalData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-pixel text-primary flex items-center gap-3">
                        <Target className="w-8 h-8" />
                        Go-To-Market Strategy
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Centralisez votre positionnement et votre distribution via les frameworks les plus efficaces de l'industrie.
                    </p>
                </div>
                <Button onClick={handleSave} className="flex items-center gap-2 font-pixel tracking-wide">
                    <Save className="w-4 h-4" />
                    SAUVEGARDER
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                
                {/* 1-Page Marketing Plan */}
                <Card className="border-t-4 border-t-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-pixel">
                            <Map className="w-5 h-5 text-primary" />
                            1-Page Marketing Plan
                        </CardTitle>
                        <CardDescription>
                            Phase d'acquisition : cible, message et média de diffusion.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Cible (Target Market)</Label>
                            <Input 
                                placeholder="Ex: Fondateurs B2B en phase de seed" 
                                value={localData.ompTarget}
                                onChange={(e) => handleChange('ompTarget', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Message to Market</Label>
                            <Textarea 
                                placeholder="L'offre irrésistible..." 
                                value={localData.ompMessage}
                                onChange={(e) => handleChange('ompMessage', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Média (Canaux)</Label>
                            <Input 
                                placeholder="Ex: LinkedIn Ads, SEO, Cold Email" 
                                value={localData.ompMedia}
                                onChange={(e) => handleChange('ompMedia', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Building a StoryBrand */}
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-pixel text-blue-500">
                            <BookOpen className="w-5 h-5" />
                            Building a StoryBrand
                        </CardTitle>
                        <CardDescription>
                            Clarifiez votre message : le client est le Héros, vous êtes le Guide.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Le Héros (One-liner / The Hook)</Label>
                            <Input 
                                placeholder="L'outil qui s'occupe de..." 
                                value={localData.sbHero}
                                onChange={(e) => handleChange('sbHero', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Le Problème (Vilain)</Label>
                            <Textarea 
                                placeholder="Quel problème frustre votre client ?" 
                                value={localData.sbProblem}
                                onChange={(e) => handleChange('sbProblem', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Le Guide (Votre autorité)</Label>
                            <Input 
                                placeholder="Comment montrez-vous votre empathie/compétence ?" 
                                value={localData.sbGuide}
                                onChange={(e) => handleChange('sbGuide', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Obviously Awesome */}
                <Card className="border-t-4 border-t-purple-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-pixel text-purple-500">
                            <Zap className="w-5 h-5" />
                            Obviously Awesome
                        </CardTitle>
                        <CardDescription>
                            Positionnement stratégique et attributs uniques.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Alternatives Compétitives</Label>
                            <Textarea 
                                placeholder="Que font les clients s'ils ne vous utilisent pas ? (ex: Excel, stagiaires)" 
                                value={localData.oaAlternatives}
                                onChange={(e) => handleChange('oaAlternatives', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Attributs Uniques</Label>
                            <Textarea 
                                placeholder="Quelles features/capabilities sont impossibles pour les alternatives ?" 
                                value={localData.oaUniqueAttributes}
                                onChange={(e) => handleChange('oaUniqueAttributes', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Valeur Démontrée</Label>
                            <Input 
                                placeholder="Quelle valeur exacte vos attributs génèrent-ils ?" 
                                value={localData.oaValue}
                                onChange={(e) => handleChange('oaValue', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {/* The Cold Start Problem */}
                    <Card className="border-t-4 border-t-orange-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-pixel text-orange-500">
                                <Target className="w-5 h-5" />
                                The Cold Start Problem
                            </CardTitle>
                            <CardDescription>
                                Amorçage des effets de réseau.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Le Réseau Atomique (The Atomic Network)</Label>
                                <Textarea 
                                    placeholder="Quel est le réseau minimum viable autonome ? (ex: un campus de 100 étudiants)" 
                                    value={localData.csAtomicNetwork}
                                    onChange={(e) => handleChange('csAtomicNetwork', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Compound Effect / Online Writing */}
                    <Card className="border-t-4 border-t-emerald-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-pixel text-emerald-500">
                                <PenTool className="w-5 h-5" />
                                Build in Public (Consistance)
                            </CardTitle>
                            <CardDescription>
                                Rythme de publication et écriture en ligne.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Cadence de Publication (L'effet cumulé)</Label>
                                <Input 
                                    placeholder="Ex: 1 post LinkedIn par jour, 1 newsletter le dimanche" 
                                    value={localData.owCadence}
                                    onChange={(e) => handleChange('owCadence', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
