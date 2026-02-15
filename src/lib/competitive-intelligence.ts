import type {
    Competitor,
    MySolution,
    MarketSignal,
    CompetitiveHealthBreakdown,
    FeatureStatus,
} from '@/store/founder-store';

/**
 * Computes the competitive health score breakdown from current data.
 * Each dimension is scored 0-100, with 100 being the best position.
 */
export function computeHealthBreakdown(
    mySolution: MySolution,
    competitors: Competitor[],
    marketSignals: MarketSignal[]
): CompetitiveHealthBreakdown {
    if (competitors.length === 0) {
        return {
            featureParity: 100,
            pricingPosition: 100,
            marketMomentum: 100,
            differentiationStrength: 50,
            threatExposure: 100,
        };
    }

    const featureParity = computeFeatureParity(mySolution, competitors);
    const pricingPosition = computePricingPosition(mySolution, competitors);
    const marketMomentum = computeMarketMomentum(marketSignals);
    const differentiationStrength = computeDifferentiationStrength(mySolution, competitors);
    const threatExposure = computeThreatExposure(competitors);

    return {
        featureParity,
        pricingPosition,
        marketMomentum,
        differentiationStrength,
        threatExposure,
    };
}

/**
 * Computes a weighted overall health score from the breakdown.
 */
export function computeHealthScore(breakdown: CompetitiveHealthBreakdown): number {
    const weights = {
        featureParity: 0.25,
        pricingPosition: 0.15,
        marketMomentum: 0.20,
        differentiationStrength: 0.25,
        threatExposure: 0.15,
    };

    const score =
        breakdown.featureParity * weights.featureParity +
        breakdown.pricingPosition * weights.pricingPosition +
        breakdown.marketMomentum * weights.marketMomentum +
        breakdown.differentiationStrength * weights.differentiationStrength +
        breakdown.threatExposure * weights.threatExposure;

    return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Feature parity: % of comparison criteria where mySolution has 'yes',
 * relative to the best competitor coverage.
 */
function computeFeatureParity(mySolution: MySolution, competitors: Competitor[]): number {
    const criteria = mySolution.comparisonCriteria || [];
    if (criteria.length === 0) return 50;

    const myYesCount = criteria.filter(
        (f) => mySolution.featureAnalysis?.[f] === 'yes'
    ).length;

    const maxCompetitorYes = Math.max(
        ...competitors.map((c) =>
            criteria.filter((f) => c.featureAnalysis?.[f] === 'yes').length
        ),
        1
    );

    // Score is how well we compare to the best competitor
    const myCoverage = myYesCount / criteria.length;
    const bestCoverage = maxCompetitorYes / criteria.length;

    if (bestCoverage === 0) return 100;
    return Math.round(Math.min(100, (myCoverage / bestCoverage) * 100));
}

/**
 * Pricing position: comparison of price radar score.
 * Higher price score (better value) = better position.
 */
function computePricingPosition(mySolution: MySolution, competitors: Competitor[]): number {
    const myPrice = mySolution.radarScores?.price || 5;
    const avgCompetitorPrice =
        competitors.reduce((sum, c) => sum + (c.radarScores?.price || 5), 0) /
        competitors.length;

    // If we're at or above average, good position
    const ratio = myPrice / Math.max(avgCompetitorPrice, 1);
    return Math.round(Math.min(100, ratio * 50 + 25));
}

/**
 * Market momentum: based on recent signals sentiment.
 * More positive signals = better momentum.
 */
function computeMarketMomentum(signals: MarketSignal[]): number {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    const recentSignals = signals.filter(
        (s) => s.createdAt >= thirtyDaysAgoStr || s.date >= thirtyDaysAgo.toISOString().split('T')[0]
    );

    if (recentSignals.length === 0) return 50; // Neutral

    const positiveCount = recentSignals.filter((s) => s.impact === 'positive').length;
    const negativeCount = recentSignals.filter((s) => s.impact === 'negative').length;
    const total = recentSignals.length;

    const sentimentRatio = (positiveCount - negativeCount) / total;
    // Map from [-1, 1] to [0, 100]
    return Math.round(Math.min(100, Math.max(0, (sentimentRatio + 1) * 50)));
}

/**
 * Differentiation strength: number of unique differentiators
 * and radar score advantages.
 */
function computeDifferentiationStrength(mySolution: MySolution, competitors: Competitor[]): number {
    const myScores = mySolution.radarScores || { price: 5, features: 5, ux: 5, market: 5, innovation: 5, support: 5 };
    const axes = ['price', 'features', 'ux', 'market', 'innovation', 'support'] as const;

    // Count axes where we lead by >1 point vs average
    let advantageCount = 0;
    let disadvantageCount = 0;

    for (const axis of axes) {
        const avg = competitors.reduce((sum, c) => sum + (c.radarScores?.[axis] || 5), 0) / competitors.length;
        // Handle undefined local scores
        const myScore = myScores[axis] !== undefined ? myScores[axis] : 5;
        const diff = myScore - avg;
        if (diff > 1) advantageCount++;
        if (diff < -1) disadvantageCount++;
    }

    const axisScore = ((advantageCount - disadvantageCount) / axes.length + 1) * 50;

    // Differentiators count bonus
    const myDifferentiators = (mySolution as any).competitiveAdvantages?.length || 0;
    const avgCompetitorDiff = competitors.reduce(
        (sum, c) => sum + (c.differentiators?.length || 0), 0
    ) / Math.max(competitors.length, 1);

    const diffBonus = myDifferentiators > avgCompetitorDiff ? 15 : 0;

    return Math.round(Math.min(100, Math.max(0, axisScore + diffBonus)));
}

/**
 * Threat exposure: inverse of average competitor threat level.
 * Low threat levels = high score (good).
 */
function computeThreatExposure(competitors: Competitor[]): number {
    const competitorsWithThreat = competitors.filter((c) => c.threatLevel !== undefined);

    if (competitorsWithThreat.length === 0) return 75; // Default safe

    const avgThreat =
        competitorsWithThreat.reduce((sum, c) => sum + (c.threatLevel || 0), 0) /
        competitorsWithThreat.length;

    // Invert: high threat = low score
    return Math.round(Math.max(0, 100 - avgThreat));
}

/**
 * Returns the competitive rank of mySolution among all entities.
 * Uses a simple average of radar scores.
 */
export function computeCompetitiveRank(
    mySolution: MySolution,
    competitors: Competitor[]
): { rank: number; total: number } {
    const getAvgScore = (scores: { price: number; features: number; ux: number; market: number; innovation: number; support: number } | undefined) => {
        if (!scores) return 5; // Default average
        return ((scores.price || 5) + (scores.features || 5) + (scores.ux || 5) + (scores.market || 5) + (scores.innovation || 5) + (scores.support || 5)) / 6;
    };

    const myAvg = getAvgScore(mySolution.radarScores);
    const allScores = competitors.map((c) => ({
        id: c.id,
        avg: getAvgScore(c.radarScores),
    }));

    allScores.push({ id: 'my-solution', avg: myAvg });
    allScores.sort((a, b) => b.avg - a.avg);

    const rank = allScores.findIndex((s) => s.id === 'my-solution') + 1;
    return { rank, total: allScores.length };
}

/**
 * Computes the feature coverage percentage for mySolution.
 */
export function computeFeatureCoverage(mySolution: MySolution): number {
    const criteria = mySolution.comparisonCriteria || [];
    if (criteria.length === 0) return 0;

    const yesCount = criteria.filter(
        (f) => mySolution.featureAnalysis?.[f] === 'yes'
    ).length;

    return Math.round((yesCount / criteria.length) * 100);
}

/**
 * Counts unacknowledged alerts with high or critical severity.
 */
export function countActiveThreats(
    alerts: { severity: string; acknowledgedAt?: string }[]
): number {
    return alerts.filter(
        (a) =>
            !a.acknowledgedAt &&
            (a.severity === 'high' || a.severity === 'critical')
    ).length;
}

/**
 * Returns the color for the health score gauge.
 */
export function getHealthScoreColor(score: number): string {
    if (score >= 70) return '#00b894'; // Green
    if (score >= 40) return '#fdcb6e'; // Yellow
    return '#ff7675'; // Red
}

/**
 * Returns alert severity color.
 */
export function getAlertSeverityColor(severity: string): string {
    switch (severity) {
        case 'critical': return '#ff7675';
        case 'high': return '#fdcb6e';
        case 'medium': return '#6c5ce7';
        case 'low': return '#8b8fa3';
        default: return '#8b8fa3';
    }
}

/**
 * Returns alert type icon name (Lucide).
 */
export function getAlertTypeIcon(type: string): string {
    switch (type) {
        case 'threat': return 'AlertTriangle';
        case 'opportunity': return 'TrendingUp';
        case 'action_required': return 'Zap';
        case 'info': return 'Info';
        default: return 'Info';
    }
}
