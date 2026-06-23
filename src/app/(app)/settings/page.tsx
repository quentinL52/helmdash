'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useFounderStore } from '@/store/founder-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Save, MonitorSmartphone, Palette, Calendar, User, Linkedin, PenLine } from 'lucide-react';
import { AISettingsPanel } from '@/components/dashboard/ai-settings-panel';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { mvpTargetDate, setMvpTargetDate, founderProfile, setFounderProfile } = useFounderStore();
    
    const [localMvpDate, setLocalMvpDate] = useState(mvpTargetDate || '');
    const [localProfile, setLocalProfile] = useState(founderProfile);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setLocalMvpDate(mvpTargetDate || '');
        setLocalProfile(founderProfile);
    }, [mvpTargetDate, founderProfile]);

    const handleSave = () => {
        setMvpTargetDate(localMvpDate);
        setFounderProfile(localProfile);
        toast({
            title: "Paramètres sauvegardés",
            description: "Vos préférences générales et votre profil ont été mis à jour.",
        });
    };

    if (!mounted) return null;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-pixel text-primary flex items-center gap-3">
                        <MonitorSmartphone className="w-8 h-8" />
                        Paramètres (Settings)
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Configurez votre profil, l&apos;interface, les agents IA et la date de votre MVP.
                    </p>
                </div>
                <Button onClick={handleSave} className="flex items-center gap-2 font-pixel tracking-wide">
                    <Save className="w-4 h-4" />
                    SAUVEGARDER
                </Button>
            </div>

            <div className="grid gap-6">

                {/* Profil & Identité */}
                <Card className="border-t-4 border-t-cyan-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-pixel text-cyan-500">
                            <User className="w-5 h-5" />
                            Profil &amp; Identité
                        </CardTitle>
                        <CardDescription>
                            Ces informations sont utilisées par l&apos;agent Créateur de Contenu pour personnaliser vos posts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    Nom / Pseudo
                                </Label>
                                <Input
                                    placeholder="Ex: Quentin L."
                                    value={localProfile.displayName}
                                    onChange={(e) => setLocalProfile({ ...localProfile, displayName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5">
                                    <Linkedin className="w-3.5 h-3.5" />
                                    URL LinkedIn
                                </Label>
                                <Input
                                    type="url"
                                    placeholder="https://linkedin.com/in/votre-profil"
                                    value={localProfile.linkedinUrl}
                                    onChange={(e) => setLocalProfile({ ...localProfile, linkedinUrl: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Niche / Secteur</Label>
                            <Input
                                placeholder="Ex: SaaS B2B, HealthTech, EdTech…"
                                value={localProfile.niche}
                                onChange={(e) => setLocalProfile({ ...localProfile, niche: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1.5">
                                <PenLine className="w-3.5 h-3.5" />
                                Style d&apos;écriture &amp; Exemples de posts
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Collez 2-3 de vos meilleurs posts LinkedIn ou décrivez votre ton (ex: &quot;Ton cash, phrases courtes, emojis fréquents, storytelling personnel&quot;).
                                L&apos;agent de contenu clonera ce style.
                            </p>
                            <Textarea
                                className="min-h-[160px] font-mono text-sm"
                                placeholder={"Exemple de post :\n\nJ'ai quitté mon CDI il y a 6 mois.\n\nVoici ce que personne ne vous dit sur l'entrepreneuriat :\n\n1. Les premiers mois, vous doutez de tout.\n2. Le syndrome de l'imposteur ne part jamais.\n3. Chaque petit win compte.\n\nMon style : phrases courtes, direct, emojis modérés, toujours une leçon concrète."}
                                value={localProfile.writingStyleContext}
                                onChange={(e) => setLocalProfile({ ...localProfile, writingStyleContext: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Lancement MVP */}
                <Card className="border-t-4 border-t-indigo-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-pixel text-indigo-500">
                            <Calendar className="w-5 h-5" />
                            Date cible du MVP
                        </CardTitle>
                        <CardDescription>
                            Cette date alimente le compte à rebours de votre Dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-w-sm">
                            <Label>Date de lancement (MVP)</Label>
                            <Input 
                                type="date"
                                value={localMvpDate}
                                onChange={(e) => setLocalMvpDate(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Thème */}
                <Card className="border-t-4 border-t-amber-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-pixel text-amber-500">
                            <Palette className="w-5 h-5" />
                            Apparence
                        </CardTitle>
                        <CardDescription>
                            Choisissez le thème de l&apos;application. Le mode sombre est recommandé pour l&apos;esthétique Pixel Art.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <Label>Thème actuel</Label>
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un thème" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Clair</SelectItem>
                                    <SelectItem value="dark">Sombre</SelectItem>
                                    <SelectItem value="system">
                                        <div className="flex items-center gap-2">
                                            <MonitorSmartphone className="w-4 h-4" />
                                            Système
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
                {/* Paramètres IA */}
                <AISettingsPanel />
            </div>

            <div className="flex justify-end mt-8">
                <Button onClick={handleSave} className="font-pixel">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder les paramètres
                </Button>
            </div>
        </div>
    );
}
