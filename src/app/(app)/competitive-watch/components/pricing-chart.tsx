'use client';

import { useMemo } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Eye } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';

const PRICING_COLORS: Record<string, string> = {
    free: '#55efc4',
    freemium: '#74b9ff',
    subscription: '#6c5ce7',
    usage: '#fdcb6e',
    enterprise: '#e17055',
    other: '#8b8fa3',
};

function parsePriceRange(priceStr?: string): { min: number; max: number } | null {
    if (!priceStr) return null;
    // Try to extract numbers from strings like "$10-$50", "10€ - 100€", "Free", etc.
    const numbers = priceStr.match(/[\d]+(?:[.,]\d+)?/g);
    if (!numbers || numbers.length === 0) {
        // Check for "free" / "gratuit"
        if (/free|gratuit/i.test(priceStr)) return { min: 0, max: 0 };
        return null;
    }
    const parsed = numbers.map((n) => parseFloat(n.replace(',', '.')));
    if (parsed.length === 1) return { min: parsed[0], max: parsed[0] };
    return { min: Math.min(...parsed), max: Math.max(...parsed) };
}

export function PricingChart() {
    const competitors = useFounderStore(s => s.competitors);
    const mySolution = useFounderStore(s => s.mySolution);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).competitiveWatch;

    // Build data for horizontal bar chart
    const chartData = useMemo(() => {
        const items: {
            name: string;
            min: number;
            max: number;
            range: number;
            model: string;
            modelLabel: string;
            isMe: boolean;
            rawPricing: string;
        }[] = [];

        // My solution
        const myPrice = parsePriceRange(mySolution.pricingRange);
        if (myPrice) {
            items.push({
                name: mySolution.name || (language === 'fr' ? 'Ma Solution' : 'My Solution'),
                min: myPrice.min,
                max: myPrice.max,
                range: myPrice.max - myPrice.min,
                model: mySolution.pricingModel || 'other',
                modelLabel: t.pricingModels?.[mySolution.pricingModel || 'other'] || mySolution.pricingModel || 'Other',
                isMe: true,
                rawPricing: mySolution.pricingRange || '',
            });
        }

        // Competitors
        competitors.forEach((c) => {
            const price = parsePriceRange(c.pricingRange || c.pricing);
            if (price) {
                items.push({
                    name: c.name,
                    min: price.min,
                    max: price.max,
                    range: price.max - price.min,
                    model: c.pricingModel || 'other',
                    modelLabel: t.pricingModels?.[c.pricingModel || 'other'] || c.pricingModel || 'Other',
                    isMe: false,
                    rawPricing: c.pricingRange || c.pricing || '',
                });
            }
        });

        // Sort by min price
        items.sort((a, b) => a.min - b.min);
        return items;
    }, [competitors, mySolution, language, t]);

    // Group by pricing model for the model overview
    const modelGroups = useMemo(() => {
        const groups = new Map<string, { label: string; count: number; entities: string[] }>();
        const allEntities = [
            { name: mySolution.name || (language === 'fr' ? 'Ma Solution' : 'My Solution'), model: mySolution.pricingModel || 'other' },
            ...competitors.map((c) => ({ name: c.name, model: c.pricingModel || 'other' })),
        ];
        allEntities.forEach((e) => {
            const existing = groups.get(e.model);
            if (existing) {
                existing.count++;
                existing.entities.push(e.name);
            } else {
                groups.set(e.model, {
                    label: t.pricingModels?.[e.model] || e.model,
                    count: 1,
                    entities: [e.name],
                });
            }
        });
        return Array.from(groups.entries());
    }, [competitors, mySolution, language, t]);

    const hasChartData = chartData.length > 0;

    if (competitors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-[#8b8fa3] space-y-2">
                <Eye className="h-12 w-12 opacity-40" />
                <p>{t.noCompetitors}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-[#e8e9ed]">
                    {t.pricingChart?.title || (language === 'fr' ? 'Comparaison Pricing' : 'Pricing Comparison')}
                </h2>
                <p className="text-[#8b8fa3] text-sm">
                    {t.pricingChart?.subtitle || (language === 'fr'
                        ? 'Visualisez les fourchettes de prix et modèles tarifaires.'
                        : 'Visualize price ranges and pricing models.')}
                </p>
            </div>

            {/* Pricing Model Overview */}
            <div className="flex flex-wrap gap-3">
                {modelGroups.map(([model, data]) => (
                    <Card key={model} className="bg-[#1e2029] border-[#2b2d36] flex-1 min-w-[150px]">
                        <CardContent className="pt-4 pb-3 px-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: PRICING_COLORS[model] || '#8b8fa3' }}
                                />
                                <span className="text-sm font-medium text-[#e8e9ed]">{data.label}</span>
                            </div>
                            <span className="text-2xl font-bold text-[#e8e9ed]">{data.count}</span>
                            <p className="text-xs text-[#8b8fa3] mt-1 line-clamp-1">
                                {data.entities.join(', ')}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Price Range Chart */}
            {hasChartData ? (
                <Card className="bg-[#1e2029] border-[#2b2d36]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base text-[#e8e9ed] flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-[#6c5ce7]" />
                            {language === 'fr' ? 'Fourchettes de Prix' : 'Price Ranges'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 50 + 40)}>
                            <BarChart
                                layout="vertical"
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#2b2d36" horizontal={false} />
                                <XAxis
                                    type="number"
                                    stroke="#8b8fa3"
                                    tick={{ fontSize: 12 }}
                                    label={{
                                        value: language === 'fr' ? 'Prix (€/$/mois)' : 'Price (€/$/mo)',
                                        position: 'insideBottomRight',
                                        offset: -5,
                                        style: { fill: '#8b8fa3', fontSize: 11 },
                                    }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="#8b8fa3"
                                    tick={{ fontSize: 12 }}
                                    width={120}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (!active || !payload || payload.length === 0) return null;
                                        const data = payload[0]?.payload;
                                        if (!data) return null;
                                        return (
                                            <div className="bg-[#1a1d2d] border border-[#2b2d36] rounded-lg p-3 text-sm">
                                                <p className="font-semibold text-[#e8e9ed]">{data.name}</p>
                                                <p className="text-[#8b8fa3]">
                                                    {language === 'fr' ? 'Fourchette' : 'Range'}: {data.rawPricing}
                                                </p>
                                                <p className="text-[#8b8fa3]">
                                                    {language === 'fr' ? 'Modèle' : 'Model'}: {data.modelLabel}
                                                </p>
                                                {data.isMe && (
                                                    <Badge className="mt-1 bg-[#6c5ce7]/20 text-[#a29bfe] border-[#6c5ce7]/30">
                                                        {language === 'fr' ? 'Votre solution' : 'Your solution'}
                                                    </Badge>
                                                )}
                                            </div>
                                        );
                                    }}
                                />
                                {/* Stacked bars: min (transparent) + range (colored) */}
                                <Bar dataKey="min" stackId="price" fill="transparent" />
                                <Bar dataKey="range" stackId="price" radius={[0, 4, 4, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.isMe ? '#6c5ce7' : (PRICING_COLORS[entry.model] || '#8b8fa3')}
                                            opacity={entry.isMe ? 1 : 0.7}
                                            stroke={entry.isMe ? '#a29bfe' : 'none'}
                                            strokeWidth={entry.isMe ? 2 : 0}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>

                        {/* Legend for pricing models */}
                        <div className="flex flex-wrap gap-4 mt-4 justify-center">
                            {Object.entries(PRICING_COLORS).map(([model, color]) => {
                                const hasModel = chartData.some((d) => d.model === model);
                                if (!hasModel) return null;
                                return (
                                    <div key={model} className="flex items-center gap-1.5">
                                        <div
                                            className="w-3 h-3 rounded-sm"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span className="text-xs text-[#8b8fa3]">
                                            {t.pricingModels?.[model] || model}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-[#1e2029] border-[#2b2d36]">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <DollarSign className="h-10 w-10 text-[#8b8fa3] opacity-40 mb-3" />
                        <p className="text-[#e8e9ed] font-medium mb-1">
                            {language === 'fr' ? 'Pas de données de prix' : 'No pricing data'}
                        </p>
                        <p className="text-[#8b8fa3] text-sm max-w-md">
                            {language === 'fr'
                                ? 'Renseignez les fourchettes de prix dans les profils concurrents pour visualiser la comparaison.'
                                : 'Fill in price ranges in competitor profiles to visualize the comparison.'}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Detailed Pricing Table */}
            <Card className="bg-[#1e2029] border-[#2b2d36]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base text-[#e8e9ed]">
                        {language === 'fr' ? 'Détails Tarifaires' : 'Pricing Details'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="divide-y divide-[#2b2d36]">
                        {/* My solution */}
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#6c5ce7]" />
                                <span className="text-[#e8e9ed] font-medium">
                                    {mySolution.name || (language === 'fr' ? 'Ma Solution' : 'My Solution')}
                                </span>
                                <Badge className="bg-[#6c5ce7]/20 text-[#a29bfe] border-[#6c5ce7]/30 text-xs">
                                    {language === 'fr' ? 'Vous' : 'You'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="border-[#2b2d36] text-[#8b8fa3]">
                                    {t.pricingModels?.[mySolution.pricingModel || 'other'] || mySolution.pricingModel || '-'}
                                </Badge>
                                <span className="text-[#e8e9ed] text-sm min-w-[80px] text-right">
                                    {mySolution.pricingRange || '-'}
                                </span>
                            </div>
                        </div>
                        {/* Competitors */}
                        {competitors.map((c) => (
                            <div key={c.id} className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: PRICING_COLORS[c.pricingModel || 'other'] || '#8b8fa3' }}
                                    />
                                    <span className="text-[#e8e9ed] font-medium">{c.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="border-[#2b2d36] text-[#8b8fa3]">
                                        {t.pricingModels?.[c.pricingModel || 'other'] || c.pricingModel || '-'}
                                    </Badge>
                                    <span className="text-[#e8e9ed] text-sm min-w-[80px] text-right">
                                        {c.pricingRange || c.pricing || '-'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
