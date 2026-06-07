'use client';

import { useState } from 'react';
import { useFounderStore, ScenarioProbability, ScenarioImpact } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    FlaskConical,
    Plus,
    Trash2,
    Sparkles,
    Loader2,
    AlertTriangle,
    TrendingUp,
    ArrowUpRight,
    Clock,
} from 'lucide-react';

const probabilityColors: Record<string, string> = {
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const impactColors: Record<string, string> = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

interface ScenarioPanelProps {
    aiSuggestions?: {
        scenario: string;
        probability: ScenarioProbability;
        impact: ScenarioImpact;
        yourResponse: string;
        timeline: string;
    }[];
}

export function ScenarioPanel({ aiSuggestions = [] }: ScenarioPanelProps) {
    const scenarioAnalyses = useFounderStore(s => s.scenarioAnalyses);
    const addScenarioAnalysis = useFounderStore(s => s.addScenarioAnalysis);
    const deleteScenarioAnalysis = useFounderStore(s => s.deleteScenarioAnalysis);
    const competitors = useFounderStore(s => s.competitors);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [scenario, setScenario] = useState('');
    const [probability, setProbability] = useState<ScenarioProbability>('medium');
    const [impact, setImpact] = useState<ScenarioImpact>('medium');
    const [response, setResponse] = useState('');
    const [timeline, setTimeline] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const templates = [
        { id: 'funding', label: t.scenarios?.templates?.funding || 'Competitor raises funding' },
        { id: 'feature', label: t.scenarios?.templates?.feature || 'Competitor launches key feature' },
        { id: 'newEntrant', label: t.scenarios?.templates?.newEntrant || 'New market entrant' },
        { id: 'priceWar', label: t.scenarios?.templates?.priceWar || 'Price war' },
        { id: 'keyHire', label: t.scenarios?.templates?.keyHire || 'Key departure at competitor' },
    ];

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        const tpl = templates.find(t => t.id === templateId);
        if (tpl) {
            const topCompetitor = competitors[0]?.name || (language === 'fr' ? 'un concurrent' : 'a competitor');
            const scenarioTexts: Record<string, string> = {
                funding: language === 'fr'
                    ? `${topCompetitor} lève une série A de 10M€. Ils vont accélérer leur développement produit et leur expansion commerciale.`
                    : `${topCompetitor} raises a $10M Series A. They will accelerate product development and commercial expansion.`,
                feature: language === 'fr'
                    ? `${topCompetitor} lance une fonctionnalité clé qui comble un avantage compétitif que nous avons actuellement.`
                    : `${topCompetitor} launches a key feature that closes a competitive advantage we currently have.`,
                newEntrant: language === 'fr'
                    ? `Un nouvel acteur bien financé entre sur notre marché avec un positionnement similaire et des prix agressifs.`
                    : `A well-funded new player enters our market with similar positioning and aggressive pricing.`,
                priceWar: language === 'fr'
                    ? `${topCompetitor} baisse significativement ses prix (-40%), déclenchant une guerre des prix sur le marché.`
                    : `${topCompetitor} significantly drops prices (-40%), triggering a price war in the market.`,
                keyHire: language === 'fr'
                    ? `Le CTO/CEO de ${topCompetitor} quitte l'entreprise, créant une période d'instabilité.`
                    : `The CTO/CEO of ${topCompetitor} leaves, creating a period of instability.`,
            };
            setScenario(scenarioTexts[templateId] || '');
        }
    };

    const handleGenerateAI = async () => {
        if (!scenario.trim()) return;
        setIsGenerating(true);
        try {
            const res = await fetch('/api/ai/competitive-intelligence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mySolution: useFounderStore.getState().mySolution,
                    competitors: competitors.map(c => ({ name: c.name, description: c.description })),
                    marketSignals: [],
                    leanCanvas: {},
                    roadmap: [],
                    hypotheses: [],
                    language,
                    // Include scenario context in the prompt override
                    scenarioOverride: scenario,
                }),
            });
            // We use a simpler approach - just set defaults based on template
            setProbability('medium');
            setImpact('high');
            setResponse(language === 'fr'
                ? 'Analyser l\'impact sur notre roadmap et ajuster la stratégie en conséquence.'
                : 'Analyze impact on our roadmap and adjust strategy accordingly.');
            setTimeline(language === 'fr' ? '1-3 mois' : '1-3 months');
        } catch {
            // Silent fail, user can fill manually
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        if (!scenario.trim()) return;
        addScenarioAnalysis({
            scenario: scenario.trim(),
            probability,
            impact,
            yourResponse: response.trim(),
            timeline: timeline.trim(),
        });
        setDialogOpen(false);
        resetForm();
        toast({
            title: language === 'fr' ? 'Scénario ajouté' : 'Scenario added',
        });
    };

    const handleImportAiSuggestion = (suggestion: typeof aiSuggestions[0]) => {
        addScenarioAnalysis({
            scenario: suggestion.scenario,
            probability: suggestion.probability,
            impact: suggestion.impact,
            yourResponse: suggestion.yourResponse,
            timeline: suggestion.timeline,
        });
        toast({
            title: language === 'fr' ? 'Scénario importé' : 'Scenario imported',
        });
    };

    const resetForm = () => {
        setSelectedTemplate('');
        setScenario('');
        setProbability('medium');
        setImpact('medium');
        setResponse('');
        setTimeline('');
    };

    const allScenarios = scenarioAnalyses;

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-destructive" />
                        <CardTitle className="text-lg text-foreground">
                            {t.scenarios?.title || (language === 'fr' ? 'Scénarios "Et Si..."' : 'What-If Scenarios')}
                        </CardTitle>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => { resetForm(); setDialogOpen(true); }}
                        className="bg-primary hover:bg-primary/90 text-foreground"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        {language === 'fr' ? 'Nouveau' : 'New'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* AI Suggested Scenarios (if any, not yet saved) */}
                {aiSuggestions.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-primary" />
                            {language === 'fr' ? 'Suggestions AI' : 'AI Suggestions'}
                        </p>
                        {aiSuggestions
                            .filter(s => !allScenarios.some(existing => existing.scenario === s.scenario))
                            .map((suggestion, i) => (
                                <div
                                    key={`ai-${i}`}
                                    className="rounded-lg bg-primary/5 border border-primary/20 border-dashed p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-foreground mb-2">{suggestion.scenario}</p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className={`text-xs ${probabilityColors[suggestion.probability]}`}>
                                                    P: {suggestion.probability}
                                                </Badge>
                                                <Badge variant="outline" className={`text-xs ${impactColors[suggestion.impact]}`}>
                                                    I: {suggestion.impact}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {suggestion.timeline}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleImportAiSuggestion(suggestion)}
                                            className="shrink-0 text-primary hover:text-accent-foreground hover:bg-primary/10"
                                        >
                                            <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                                            {language === 'fr' ? 'Importer' : 'Import'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {/* Saved Scenarios */}
                {allScenarios.length === 0 && aiSuggestions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                            {language === 'fr'
                                ? 'Aucun scénario. Anticipez les mouvements du marché.'
                                : 'No scenarios yet. Anticipate market moves.'}
                        </p>
                    </div>
                )}

                {allScenarios.map((s) => (
                    <div key={s.id} className="rounded-lg bg-background border border-border p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                    <span className="text-sm font-medium text-foreground">
                                        {language === 'fr' ? 'Scénario' : 'Scenario'}
                                    </span>
                                    <Badge variant="outline" className={`text-xs ${probabilityColors[s.probability]}`}>
                                        {language === 'fr' ? 'Probabilité' : 'Probability'}: {s.probability}
                                    </Badge>
                                    <Badge variant="outline" className={`text-xs ${impactColors[s.impact]}`}>
                                        Impact: {s.impact}
                                    </Badge>
                                </div>
                                <p className="text-sm text-foreground mb-2">{s.scenario}</p>

                                {s.yourResponse && (
                                    <div className="border-l-2 border-primary/40 pl-3 mb-2">
                                        <p className="text-xs text-muted-foreground mb-0.5">
                                            {language === 'fr' ? 'Réponse stratégique' : 'Strategic response'}
                                        </p>
                                        <p className="text-sm text-accent-foreground">{s.yourResponse}</p>
                                    </div>
                                )}

                                {s.timeline && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {s.timeline}
                                    </div>
                                )}
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteScenarioAnalysis(s.id)}
                                className="shrink-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>

            {/* Create Scenario Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-card border-border text-foreground sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {language === 'fr' ? 'Nouveau Scénario "Et Si..."' : 'New "What-If" Scenario'}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {language === 'fr'
                                ? 'Anticipez un mouvement du marché et préparez votre réponse.'
                                : 'Anticipate a market move and prepare your response.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Templates */}
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                {language === 'fr' ? 'Templates prédéfinis :' : 'Predefined templates:'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {templates.map((tpl) => (
                                    <Button
                                        key={tpl.id}
                                        size="sm"
                                        variant={selectedTemplate === tpl.id ? 'default' : 'outline'}
                                        onClick={() => handleTemplateSelect(tpl.id)}
                                        className={selectedTemplate === tpl.id
                                            ? 'bg-primary text-foreground'
                                            : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'}
                                    >
                                        {tpl.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Scenario text */}
                        <div className="space-y-2">
                            <label className="text-sm text-foreground">
                                {language === 'fr' ? 'Description du scénario' : 'Scenario description'}
                            </label>
                            <Textarea
                                value={scenario}
                                onChange={(e) => setScenario(e.target.value)}
                                placeholder={language === 'fr'
                                    ? 'Décrivez le scénario en détail...'
                                    : 'Describe the scenario in detail...'}
                                className="bg-card border-border text-foreground min-h-[80px]"
                            />
                        </div>

                        {/* Probability + Impact */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-foreground">
                                    {language === 'fr' ? 'Probabilité' : 'Probability'}
                                </label>
                                <Select value={probability} onValueChange={(v) => setProbability(v as ScenarioProbability)}>
                                    <SelectTrigger className="bg-card border-border text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border text-foreground">
                                        <SelectItem value="low" className="hover:bg-muted">
                                            {language === 'fr' ? 'Faible' : 'Low'}
                                        </SelectItem>
                                        <SelectItem value="medium" className="hover:bg-muted">
                                            {language === 'fr' ? 'Moyen' : 'Medium'}
                                        </SelectItem>
                                        <SelectItem value="high" className="hover:bg-muted">
                                            {language === 'fr' ? 'Élevé' : 'High'}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-foreground">Impact</label>
                                <Select value={impact} onValueChange={(v) => setImpact(v as ScenarioImpact)}>
                                    <SelectTrigger className="bg-card border-border text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border text-foreground">
                                        <SelectItem value="low" className="hover:bg-muted">
                                            {language === 'fr' ? 'Faible' : 'Low'}
                                        </SelectItem>
                                        <SelectItem value="medium" className="hover:bg-muted">
                                            {language === 'fr' ? 'Moyen' : 'Medium'}
                                        </SelectItem>
                                        <SelectItem value="high" className="hover:bg-muted">
                                            {language === 'fr' ? 'Élevé' : 'High'}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Response */}
                        <div className="space-y-2">
                            <label className="text-sm text-foreground">
                                {language === 'fr' ? 'Votre réponse stratégique' : 'Your strategic response'}
                            </label>
                            <Textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder={language === 'fr'
                                    ? 'Comment réagiriez-vous à ce scénario ?'
                                    : 'How would you respond to this scenario?'}
                                className="bg-card border-border text-foreground min-h-[60px]"
                            />
                        </div>

                        {/* Timeline */}
                        <div className="space-y-2">
                            <label className="text-sm text-foreground">
                                {language === 'fr' ? 'Horizon temporel' : 'Timeline'}
                            </label>
                            <Select value={timeline} onValueChange={setTimeline}>
                                <SelectTrigger className="bg-card border-border text-foreground">
                                    <SelectValue placeholder={language === 'fr' ? 'Sélectionner...' : 'Select...'} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    <SelectItem value="0-1 month" className="hover:bg-muted">0-1 {language === 'fr' ? 'mois' : 'month'}</SelectItem>
                                    <SelectItem value="1-3 months" className="hover:bg-muted">1-3 {language === 'fr' ? 'mois' : 'months'}</SelectItem>
                                    <SelectItem value="3-6 months" className="hover:bg-muted">3-6 {language === 'fr' ? 'mois' : 'months'}</SelectItem>
                                    <SelectItem value="6-12 months" className="hover:bg-muted">6-12 {language === 'fr' ? 'mois' : 'months'}</SelectItem>
                                    <SelectItem value="12+ months" className="hover:bg-muted">12+ {language === 'fr' ? 'mois' : 'months'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-muted-foreground">
                            {language === 'fr' ? 'Annuler' : 'Cancel'}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!scenario.trim()}
                            className="bg-primary hover:bg-primary/90 text-foreground"
                        >
                            {language === 'fr' ? 'Sauvegarder' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
