'use client';

import { useState } from 'react';
import { useFounderStore, PricingModelType } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { generateStrategicRecommendations, generateCompetitiveIntelligence } from '@/lib/ai-service';
import { generateCompetitiveAnalysis, type CompetitiveAnalysisOutput } from '@/ai/flows/competitive-analysis-flow';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
    Target,
    Brain,
    Sparkles,
    Shield,
    AlertTriangle,
    Loader2,
    CheckCircle,
    XCircle,
    Lightbulb,
    Swords,
    Zap,
} from 'lucide-react';
import { ActionItemsPanel } from './action-items-panel';
import { ScenarioPanel } from './scenario-panel';

export function AiInsightsTab() {
    const competitors = useFounderStore(s => s.competitors);
    const mySolution = useFounderStore(s => s.mySolution);
    const updateMySolution = useFounderStore(s => s.updateMySolution);
    const leanCanvas = useFounderStore(s => s.leanCanvas);
    const marketSignals = useFounderStore(s => s.marketSignals);
    const competitiveIntelligence = useFounderStore(s => s.competitiveIntelligence);
    const setCompetitiveIntelligence = useFounderStore(s => s.setCompetitiveIntelligence);
    const setStrategicRecommendations = useFounderStore(s => s.setStrategicRecommendations);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    const roadmap = { objectives: useFounderStore(s => s.objectives) };
    const hypotheses = useFounderStore(s => s.hypotheses);
    const finance = useFounderStore(s => s.finance);
    const roadmapItems = useFounderStore(s => s.roadmap);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isRunningIntelligence, setIsRunningIntelligence] = useState(false);
    const [analysis, setAnalysis] = useState<CompetitiveAnalysisOutput | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [featuresInput, setFeaturesInput] = useState(mySolution.keyFeatures?.join(', ') || '');
    const [diffInput, setDiffInput] = useState(mySolution.differentiators?.join(', ') || '');

    // Intelligence results (from the competitive-intelligence API)
    const [intelligenceResult, setIntelligenceResult] = useState<any>(null);

    const radarAxesKeys = ['price', 'features', 'ux', 'market', 'innovation', 'support'] as const;

    const canAnalyze = (mySolution.name || '').trim() && competitors.length > 0;

    const handleSaveSolution = () => {
        updateMySolution({
            keyFeatures: featuresInput.trim() ? featuresInput.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
            differentiators: diffInput.trim() ? diffInput.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        });
    };

    const handleRunIntelligence = async () => {
        if (!canAnalyze) return;
        setIsRunningIntelligence(true);
        setError(null);
        handleSaveSolution();

        try {
            const result = await generateCompetitiveIntelligence({
                mySolution: {
                    ...mySolution,
                    keyFeatures: featuresInput.trim() ? featuresInput.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
                    differentiators: diffInput.trim() ? diffInput.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
                },
                competitors,
                marketSignals,
                leanCanvas,
                roadmap: roadmapItems,
                hypotheses,
                financeSummary: {
                    cashAvailable: finance.cashAvailable,
                    monthlyEntries: finance.monthlyEntries.length,
                },
                previousIntelligence: competitiveIntelligence || undefined,
                language,
            });

            setIntelligenceResult(result);

            // Persist health score and alerts to store
            if (result.healthScore !== undefined) {
                setCompetitiveIntelligence({
                    lastAnalyzedAt: result.lastAnalyzedAt || new Date().toISOString(),
                    healthScore: result.healthScore,
                    healthBreakdown: result.healthBreakdown,
                    alerts: result.alerts || [],
                    trendSummary: result.trendSummary,
                });
            }

            toast({
                title: language === 'fr' ? 'Analyse Intelligence terminée' : 'Intelligence Analysis complete',
                description: language === 'fr'
                    ? `Score de santé : ${result.healthScore}/100`
                    : `Health score: ${result.healthScore}/100`,
            });
        } catch (e) {
            setError(language === 'fr' ? 'Échec de l\'analyse d\'intelligence.' : 'Intelligence analysis failed.');
        } finally {
            setIsRunningIntelligence(false);
        }
    };

    const handleAnalyze = async () => {
        if (!canAnalyze) return;
        setIsAnalyzing(true);
        setError(null);
        handleSaveSolution();

        try {
            const result = await generateCompetitiveAnalysis({
                mySolution: {
                    ...mySolution,
                    keyFeatures: featuresInput.trim() ? featuresInput.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
                    differentiators: diffInput.trim() ? diffInput.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
                },
                competitors: competitors.map(c => ({
                    name: c.name,
                    website: c.website,
                    description: c.description,
                    strengths: c.strengths,
                    weaknesses: c.weaknesses,
                    pricing: c.pricing,
                    positioning: c.positioning,
                    targetSegment: c.targetSegment,
                    businessModel: c.businessModel,
                    teamSize: c.teamSize,
                    fundingStage: c.fundingStage,
                    fundingAmount: c.fundingAmount,
                    keyFeatures: c.keyFeatures,
                    differentiators: c.differentiators,
                    pricingModel: c.pricingModel,
                    pricingRange: c.pricingRange,
                    yearFounded: c.yearFounded,
                    geography: c.geography,
                    radarScores: c.radarScores,
                })),
                language,
            });
            setAnalysis(result);
        } catch (e) {
            setError(t.aiInsights.error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const priorityColors: Record<string, string> = {
        high: 'bg-red-500/20 text-red-400 border-red-500/30',
        medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };

    const handleGenerateStrategy = async () => {
        setIsAnalyzing(true);
        try {
            const recommendations = await generateStrategicRecommendations({
                mySolution,
                competitors,
                leanCanvas,
                roadmap: roadmap.objectives,
                hypotheses,
                language
            });

            setStrategicRecommendations({
                ...recommendations,
                generatedAt: new Date().toISOString()
            });

            toast({
                title: language === 'fr' ? 'Stratégie Générée' : 'Strategy Generated',
                description: language === 'fr'
                    ? 'Les recommandations ont été mises à jour dans le store.'
                    : 'Recommendations have been updated in the store.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to generate strategy.",
                variant: 'destructive'
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Intelligence Engine - Primary CTA */}
            <Card className="bg-gradient-to-r from-[#6c5ce7]/10 to-[#a29bfe]/10 border-[#6c5ce7]/30">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-[#6c5ce7]" />
                                <h3 className="text-lg font-semibold text-[#e8e9ed]">
                                    {language === 'fr' ? 'Moteur d\'Intelligence Stratégique' : 'Strategic Intelligence Engine'}
                                </h3>
                            </div>
                            <p className="text-sm text-[#8b8fa3] max-w-xl">
                                {language === 'fr'
                                    ? 'Analyse complète cross-module : santé concurrentielle, gaps features, pricing, tendances marché, et recommandations actionnables.'
                                    : 'Comprehensive cross-module analysis: competitive health, feature gaps, pricing, market trends, and actionable recommendations.'}
                            </p>
                            {competitiveIntelligence?.lastAnalyzedAt && (
                                <p className="text-xs text-[#8b8fa3]">
                                    {language === 'fr' ? 'Dernière analyse' : 'Last analysis'}: {new Date(competitiveIntelligence.lastAnalyzedAt).toLocaleString(language)}
                                    {' — '}Score: <span className="text-[#e8e9ed] font-medium">{competitiveIntelligence.healthScore}/100</span>
                                </p>
                            )}
                        </div>
                        <Button
                            onClick={handleRunIntelligence}
                            disabled={!canAnalyze || isRunningIntelligence}
                            className="bg-[#6c5ce7] hover:bg-[#5a4bd6] text-white shrink-0 px-6"
                        >
                            {isRunningIntelligence ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {language === 'fr' ? 'Analyse...' : 'Analyzing...'}</>
                            ) : (
                                <><Brain className="mr-2 h-4 w-4" /> {language === 'fr' ? 'Lancer l\'Analyse AI' : 'Run AI Analysis'}</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Action Items Panel (from intelligence results) */}
            <ActionItemsPanel
                featureGaps={intelligenceResult?.featureGapPrioritization}
                crossModuleRecs={intelligenceResult?.crossModuleRecommendations}
                pricingIntelligence={intelligenceResult?.pricingIntelligence}
            />

            {/* Scenario Panel */}
            <ScenarioPanel
                aiSuggestions={intelligenceResult?.scenarioSuggestions}
            />

            {/* Trend Summary (from intelligence) */}
            {intelligenceResult?.trendSummary && (
                <Card className="bg-[#181a24] border-[#282c3a]">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-[#a29bfe]" />
                            <CardTitle className="text-base text-[#e8e9ed]">
                                {language === 'fr' ? 'Tendances Marché' : 'Market Trends'}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-[#dfe1e6] leading-relaxed">{intelligenceResult.trendSummary}</p>
                    </CardContent>
                </Card>
            )}

            {/* Competitor Updates from intelligence */}
            {intelligenceResult?.competitorUpdates?.length > 0 && (
                <Card className="bg-[#181a24] border-[#282c3a]">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-[#00cec9]" />
                            <CardTitle className="text-base text-[#e8e9ed]">
                                {language === 'fr' ? 'Actualités Concurrents' : 'Competitor Updates'}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {intelligenceResult.competitorUpdates.map((update: any, i: number) => (
                            <div key={i} className="rounded-lg bg-[#0f1117] border border-[#282c3a] p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-[#e8e9ed]">{update.competitorName}</span>
                                    <Badge variant="outline" className={`text-xs ${update.suggestedMomentum === 'rising' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                            update.suggestedMomentum === 'declining' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                        }`}>
                                        {t.momentum?.[update.suggestedMomentum] || update.suggestedMomentum}
                                    </Badge>
                                    <span className="text-xs text-[#8b8fa3] ml-auto">
                                        {t.threatLevel}: {update.suggestedThreatLevel}/100
                                    </span>
                                </div>
                                {update.recentNews?.map((news: any, j: number) => (
                                    <div key={j} className="ml-2 mb-1">
                                        <p className="text-xs text-[#dfe1e6]">{news.title}</p>
                                        <p className="text-xs text-[#8b8fa3]">{news.summary}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <hr className="border-[#282c3a]" />

            {/* Legacy: Strategic Analysis + Competitive Analysis Sections */}
            <Card className="bg-[#181a24] border-[#282c3a] p-4">
                <h3 className="text-[#e8e9ed] font-semibold mb-2">
                    {language === 'fr' ? 'Analyse Stratégique Complète' : 'Full Strategic Analysis'}
                </h3>
                <p className="text-xs text-[#8b8fa3] mb-4">
                    {language === 'fr'
                        ? 'Générez un plan d\'action complet basé sur vos concurrents, votre Lean Canvas et votre Roadmap.'
                        : 'Generate a comprehensive action plan based on your competitors, Lean Canvas, and Roadmap.'}
                </p>
                <Button
                    onClick={handleGenerateStrategy}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] hover:opacity-90 text-white"
                >
                    {isAnalyzing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {language === 'fr' ? 'Analyse...' : 'Analyzing...'}</>
                    ) : (
                        <><Brain className="mr-2 h-4 w-4" /> {language === 'fr' ? 'Générer le Plan Stratégique' : 'Generate Strategic Plan'}</>
                    )}
                </Button>
            </Card>

            {/* My Solution Section */}
            <Card className="bg-[#181a24] border-[#282c3a]">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-[#6c5ce7]" />
                        <CardTitle className="text-lg text-[#e8e9ed]">{t.mySolution.title}</CardTitle>
                    </div>
                    <p className="text-sm text-[#8b8fa3]">{t.mySolution.subtitle}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[#e8e9ed] text-sm">{t.competitor.name} *</Label>
                            <Input
                                value={mySolution.name}
                                onChange={(e) => updateMySolution({ name: e.target.value })}
                                placeholder={t.mySolution.namePlaceholder}
                                className="bg-[#0f1117] border-[#282c3a] text-[#e8e9ed]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#e8e9ed] text-sm">{t.competitor.positioning}</Label>
                            <Input
                                value={mySolution.positioning || ''}
                                onChange={(e) => updateMySolution({ positioning: e.target.value })}
                                className="bg-[#0f1117] border-[#282c3a] text-[#e8e9ed]"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#e8e9ed] text-sm">{t.competitor.description}</Label>
                        <Textarea
                            value={mySolution.description || ''}
                            onChange={(e) => updateMySolution({ description: e.target.value })}
                            placeholder={t.mySolution.descriptionPlaceholder}
                            className="bg-[#0f1117] border-[#282c3a] text-[#e8e9ed] min-h-[60px]"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[#e8e9ed] text-sm">{t.competitor.targetSegment}</Label>
                            <Input
                                value={mySolution.targetSegment || ''}
                                onChange={(e) => updateMySolution({ targetSegment: e.target.value })}
                                className="bg-[#0f1117] border-[#282c3a] text-[#e8e9ed]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#e8e9ed] text-sm">{t.competitor.businessModel}</Label>
                            <Input
                                value={mySolution.businessModel || ''}
                                onChange={(e) => updateMySolution({ businessModel: e.target.value })}
                                className="bg-[#0f1117] border-[#282c3a] text-[#e8e9ed]"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[#e8e9ed] text-sm">{t.competitor.keyFeatures}</Label>
                            <Input
                                value={featuresInput}
                                onChange={(e) => setFeaturesInput(e.target.value)}
                                onBlur={handleSaveSolution}
                                placeholder={language === 'fr' ? 'Séparées par des virgules' : 'Comma separated'}
                                className="bg-[#0f1117] border-[#282c3a] text-[#e8e9ed]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#e8e9ed] text-sm">{t.competitor.differentiators}</Label>
                            <Input
                                value={diffInput}
                                onChange={(e) => setDiffInput(e.target.value)}
                                onBlur={handleSaveSolution}
                                placeholder={language === 'fr' ? 'Séparés par des virgules' : 'Comma separated'}
                                className="bg-[#0f1117] border-[#282c3a] text-[#e8e9ed]"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[#e8e9ed] text-sm">{t.competitor.pricingModel}</Label>
                            <Select
                                value={mySolution.pricingModel || ''}
                                onValueChange={(v) => updateMySolution({ pricingModel: v as PricingModelType })}
                            >
                                <SelectTrigger className="bg-[#0f1117] border-[#282c3a] text-[#e8e9ed]">
                                    <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1d2d] border-[#282c3a] text-[#e8e9ed]">
                                    {(['free', 'freemium', 'subscription', 'usage', 'enterprise', 'other'] as PricingModelType[]).map(pm => (
                                        <SelectItem key={pm} value={pm} className="hover:bg-[#282c3a]">{t.pricingModels[pm]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#e8e9ed] text-sm">{t.competitor.pricingRange}</Label>
                            <Input
                                value={mySolution.pricingRange || ''}
                                onChange={(e) => updateMySolution({ pricingRange: e.target.value })}
                                placeholder="$0 - $99/mo"
                                className="bg-[#0f1117] border-[#282c3a] text-[#e8e9ed]"
                            />
                        </div>
                    </div>

                    {/* Radar Scores */}
                    <div className="space-y-3 pt-2">
                        <Label className="text-[#e8e9ed] text-sm font-semibold">
                            {language === 'fr' ? 'Scores Radar (1-10)' : 'Radar Scores (1-10)'}
                        </Label>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                            {radarAxesKeys.map((axis) => (
                                <div key={axis} className="flex items-center gap-3">
                                    <span className="text-[#8b8fa3] text-sm w-24 shrink-0">{t.radarAxes[axis]}</span>
                                    <Slider
                                        min={1} max={10} step={1}
                                        value={[mySolution.radarScores[axis]]}
                                        onValueChange={(val) => updateMySolution({
                                            radarScores: { ...mySolution.radarScores, [axis]: val[0] }
                                        })}
                                        className="flex-1"
                                    />
                                    <span className="text-[#e8e9ed] text-sm w-6 text-right font-mono">
                                        {mySolution.radarScores[axis]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Competitive Analysis Button */}
            <div className="flex items-center gap-4">
                <Button
                    onClick={handleAnalyze}
                    disabled={!canAnalyze || isAnalyzing}
                    className="bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] hover:from-[#5a4bd6] hover:to-[#8b7ff5] text-white shadow-lg shadow-[#6c5ce7]/25 px-6"
                >
                    {isAnalyzing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.aiInsights.analyzing}</>
                    ) : (
                        <><Brain className="mr-2 h-4 w-4" /> {t.aiInsights.analyze}</>
                    )}
                </Button>
                {!(mySolution.name || '').trim() && (
                    <p className="text-sm text-yellow-400/80">{t.aiInsights.needSolution}</p>
                )}
                {(mySolution.name || '').trim() && competitors.length === 0 && (
                    <p className="text-sm text-yellow-400/80">{t.aiInsights.needCompetitors}</p>
                )}
            </div>

            {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Analysis Results */}
            {analysis && (
                <div className="space-y-6">
                    {/* Executive Summary */}
                    <Card className="bg-[#181a24] border-[#6c5ce7]/30">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-[#6c5ce7]" />
                                <CardTitle className="text-base text-[#e8e9ed]">{t.aiInsights.executiveSummary}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[#dfe1e6] text-sm leading-relaxed">{analysis.executiveSummary}</p>
                        </CardContent>
                    </Card>

                    {/* Market Positioning */}
                    <Card className="bg-[#181a24] border-[#282c3a]">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-[#00cec9]" />
                                <CardTitle className="text-base text-[#e8e9ed]">{t.aiInsights.marketPositioning}</CardTitle>
                                <Badge className="ml-auto bg-[#6c5ce7]/20 text-[#a29bfe] border-[#6c5ce7]/30">
                                    {t.aiInsights.quadrant}: {analysis.marketPositioning.quadrantSuggestion}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[#dfe1e6] text-sm leading-relaxed">{analysis.marketPositioning.overview}</p>
                        </CardContent>
                    </Card>

                    {/* Advantages + Vulnerabilities */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-green-500/5 border-green-500/20">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-green-400" />
                                    <CardTitle className="text-base text-green-400">{t.aiInsights.advantages}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {analysis.competitiveAdvantages.map((a, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-[#dfe1e6]">
                                            <CheckCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                                            <span>{a}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="bg-red-500/5 border-red-500/20">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-400" />
                                    <CardTitle className="text-base text-red-400">{t.aiInsights.vulnerabilities}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {analysis.vulnerabilities.map((v, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-[#dfe1e6]">
                                            <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                                            <span>{v}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Opportunities + Threats */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-blue-500/5 border-blue-500/20">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-blue-400" />
                                    <CardTitle className="text-base text-blue-400">{t.aiInsights.opportunities}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {analysis.opportunities.map((o, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-[#dfe1e6]">
                                            <CheckCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                            <span>{o}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="bg-orange-500/5 border-orange-500/20">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-400" />
                                    <CardTitle className="text-base text-orange-400">{t.aiInsights.threats}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {analysis.threats.map((th, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-[#dfe1e6]">
                                            <XCircle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                                            <span>{th}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Head to Head */}
                    <Card className="bg-[#181a24] border-[#282c3a]">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Swords className="h-5 w-5 text-[#fd79a8]" />
                                <CardTitle className="text-base text-[#e8e9ed]">{t.aiInsights.headToHead}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {analysis.headToHead.map((h2h, i) => (
                                <div key={i} className="rounded-lg bg-[#0f1117] border border-[#282c3a] p-4 space-y-3">
                                    <h4 className="text-[#e8e9ed] font-semibold flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#6c5ce7]" />
                                        vs {h2h.competitorName}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-green-400 font-medium mb-1">{t.aiInsights.wins}</p>
                                            <ul className="space-y-1">
                                                {h2h.winPoints.map((w, j) => (
                                                    <li key={j} className="text-sm text-[#dfe1e6] flex items-start gap-1.5">
                                                        <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                                                        {w}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-xs text-red-400 font-medium mb-1">{t.aiInsights.losses}</p>
                                            <ul className="space-y-1">
                                                {h2h.losePoints.map((l, j) => (
                                                    <li key={j} className="text-sm text-[#dfe1e6] flex items-start gap-1.5">
                                                        <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                                                        {l}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <p className="text-sm text-[#a29bfe] italic border-l-2 border-[#6c5ce7]/40 pl-3">
                                        {h2h.recommendation}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Strategic Recommendations */}
                    <Card className="bg-[#181a24] border-[#282c3a]">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-[#fdcb6e]" />
                                <CardTitle className="text-base text-[#e8e9ed]">{t.aiInsights.recommendations}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {analysis.strategicRecommendations.map((rec, i) => (
                                    <div key={i} className="rounded-lg bg-[#0f1117] border border-[#282c3a] p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-[#e8e9ed] font-medium text-sm">{rec.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`text-xs ${priorityColors[rec.priority]}`}>
                                                    {t.aiInsights.priority[rec.priority]}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs bg-[#282c3a]/50 text-[#8b8fa3] border-[#282c3a]">
                                                    {rec.timeline}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-[#8b8fa3] text-sm">{rec.description}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
