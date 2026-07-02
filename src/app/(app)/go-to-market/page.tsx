'use client';

import { useState, useEffect } from 'react';
import { useFounderStore, GoToMarketStrategy } from '@/store/founder-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Target, BookOpen, Map, Zap, PenTool, Save, BarChart3, Play, Lightbulb } from 'lucide-react';
import { useGamification } from '@/hooks/use-gamification';
import { PageAgent } from '@/components/agent/PageAgent';
import { createClient } from '@/utils/supabase/client';

type GtmTab = 'strategie' | 'execution' | 'mesure';

const TABS: { id: GtmTab; label: string; icon: typeof Lightbulb; description: string }[] = [
  { id: 'strategie', label: 'Stratégie', icon: Lightbulb, description: 'Frameworks de positionnement et distribution' },
  { id: 'execution', label: 'Exécution', icon: Play, description: 'Actions concrètes pilotées par l\'Agent Growth' },
  { id: 'mesure', label: 'Mesure', icon: BarChart3, description: 'KPIs, conversion, itérations' },
];

export default function GoToMarketPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const { goToMarket, updateGoToMarket } = useFounderStore();
    const [localData, setLocalData] = useState<GoToMarketStrategy>(goToMarket);
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<GtmTab>('strategie');
    const { awardXP } = useGamification();

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user) setUserId(data.user.id);
        });
    }, []);

    useEffect(() => {
        setLocalData(goToMarket);
        setMounted(true);
    }, [goToMarket]);

    const handleSave = () => {
        updateGoToMarket(localData);
        awardXP('gtm_milestone');
        toast({
            title: 'Stratégie GTM sauvegardée',
            description: 'Vos modifications ont été enregistrées avec succès.',
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
                        Stratégie, exécution et mesure de votre mise sur le marché.
                    </p>
                </div>
                <Button onClick={handleSave} className="flex items-center gap-2 font-pixel tracking-wide">
                    <Save className="w-4 h-4" />
                    SAUVEGARDER
                </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-muted rounded-lg p-1">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all
                            ${activeTab === tab.id
                                ? 'bg-card text-primary shadow-sm font-pixel'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>
            <p className="text-xs text-muted-foreground -mt-4">
                {TABS.find(t => t.id === activeTab)?.description}
            </p>

            {/* ===== STRATÉGIE ===== */}
            {activeTab === 'strategie' && (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* 1-Page Marketing Plan */}
                    <Card className="border-t-4 border-t-primary">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-pixel">
                                <Map className="w-5 h-5 text-primary" />
                                1-Page Marketing Plan
                            </CardTitle>
                            <CardDescription>
                                Phase d&apos;acquisition : cible, message et média de diffusion.
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
                                    <Label>Cadence de Publication (L&apos;effet cumulé)</Label>
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
            )}

            {/* ===== EXÉCUTION ===== */}
            {activeTab === 'execution' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-pixel">
                            <Play className="w-5 h-5 text-primary" />
                            Exécution — Agent Growth
                        </CardTitle>
                        <CardDescription>
                            L&apos;Agent Growth exécute vos actions GTM : création de contenu, campagnes email,
                            tâches CRM, tickets Linear. Déléguez depuis le chat Agent Central.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center">
                            <p className="text-muted-foreground text-sm">
                                Ouvrez l&apos;<strong>Agent Central</strong> (onglet Agent) et demandez :
                            </p>
                            <code className="block mt-2 text-xs bg-muted px-3 py-1.5 rounded-md">
                                &quot;Agent Growth, analyse ma stratégie GTM et crée des tickets Linear pour les 3 prochaines actions.&quot;
                            </code>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Les actions exécutées apparaîtront ici automatiquement (intégration à venir avec le dashboard).
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* ===== MESURE ===== */}
            {activeTab === 'mesure' && (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-pixel">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                KPIs GTM
                            </CardTitle>
                            <CardDescription>
                                Métriques clés de votre stratégie de mise sur le marché.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Visiteurs site/mois', value: '—' },
                                    { label: 'Taux de conversion', value: '—' },
                                    { label: 'Coût d\'acquisition', value: '—' },
                                    { label: 'MRR GTM', value: '—' },
                                ].map(kpi => (
                                    <div key={kpi.label} className="bg-muted rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold font-pixel text-primary">{kpi.value}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Les métriques seront alimentées automatiquement par les intégrations
                                (Stripe, Google Analytics, LinkedIn) une fois configurées.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-pixel">
                                <Target className="w-5 h-5 text-primary" />
                                Itérations
                            </CardTitle>
                            <CardDescription>
                                Cycle Build → Measure → Learn appliqué au GTM.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Chaque action GTM est une hypothèse. Utilisez l&apos;onglet{' '}
                                <strong>Hypothèses</strong> pour tracker vos expériences GTM
                                avec le framework Build-Measure-Learn.
                            </p>
                            <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4">
                                <p className="text-xs font-pixel text-primary">CONSEIL</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Créez une hypothèse de type &quot;channel&quot; pour chaque canal GTM testé.
                                    L&apos;Agent Central vous aidera à prioriser.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* PageAgent */}
            {userId && (
                <PageAgent userId={userId} pageLabel="GTM" pageContext={`Stratégie GTM active. Onglet courant : ${activeTab}.`} />
            )}
        </div>
    );
}
