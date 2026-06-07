'use server';
/**
 * @fileOverview Genkit flow for AI-powered competitive analysis.
 * Compares the user's solution against all competitors and generates
 * structured strategic insights including head-to-head comparisons,
 * competitive advantages, vulnerabilities, and prioritized recommendations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- Input Schema ---

const SolutionSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    targetSegment: z.string().optional(),
    businessModel: z.string().optional(),
    teamSize: z.string().optional(),
    fundingStage: z.string().optional(),
    keyFeatures: z.array(z.string()).optional(),
    differentiators: z.array(z.string()).optional(),
    pricingModel: z.string().optional(),
    pricingRange: z.string().optional(),
    positioning: z.string().optional(),
    radarScores: z.object({
        price: z.number(),
        features: z.number(),
        ux: z.number(),
        market: z.number(),
        innovation: z.number(),
        support: z.number(),
    }),
});

const CompetitorSchema = z.object({
    name: z.string(),
    website: z.string().optional(),
    description: z.string().optional(),
    strengths: z.string().optional(),
    weaknesses: z.string().optional(),
    pricing: z.string().optional(),
    positioning: z.string().optional(),
    targetSegment: z.string().optional(),
    businessModel: z.string().optional(),
    teamSize: z.string().optional(),
    fundingStage: z.string().optional(),
    fundingAmount: z.string().optional(),
    keyFeatures: z.array(z.string()).optional(),
    differentiators: z.array(z.string()).optional(),
    pricingModel: z.string().optional(),
    pricingRange: z.string().optional(),
    yearFounded: z.string().optional(),
    geography: z.string().optional(),
    radarScores: z.object({
        price: z.number(),
        features: z.number(),
        ux: z.number(),
        market: z.number(),
        innovation: z.number(),
        support: z.number(),
    }),
});

const CompetitiveAnalysisInputSchema = z.object({
    mySolution: SolutionSchema.describe('The user\u0027s own solution to benchmark against competitors'),
    competitors: z.array(CompetitorSchema).describe('List of competitors to analyze'),
    language: z.enum(['fr', 'en']).default('fr').describe('Language for the generated analysis'),
});

export type CompetitiveAnalysisInput = z.infer<typeof CompetitiveAnalysisInputSchema>;

// --- Output Schema ---

const HeadToHeadSchema = z.object({
    competitorName: z.string().describe('Name of the competitor'),
    winPoints: z.array(z.string()).describe('Areas where user\u0027s solution is stronger'),
    losePoints: z.array(z.string()).describe('Areas where the competitor is stronger'),
    recommendation: z.string().describe('Actionable recommendation for this matchup'),
});

const StrategicRecommendationSchema = z.object({
    priority: z.enum(['high', 'medium', 'low']).describe('Priority level'),
    title: z.string().describe('Short title of the recommendation'),
    description: z.string().describe('Detailed description of what to do'),
    timeline: z.string().describe('"Court terme", "Moyen terme", or "Long terme"'),
});

const CompetitiveAnalysisOutputSchema = z.object({
    executiveSummary: z.string().describe('High-level summary of competitive positioning'),
    marketPositioning: z.object({
        overview: z.string().describe('Analysis of market positioning'),
        quadrantSuggestion: z.string().describe('One of: Leader, Challenger, Niche, Suiveur'),
    }),
    competitiveAdvantages: z.array(z.string()).describe('Key competitive advantages identified'),
    vulnerabilities: z.array(z.string()).describe('Weaknesses or gaps to address'),
    opportunities: z.array(z.string()).describe('Strategic opportunities in the market'),
    threats: z.array(z.string()).describe('External threats to watch'),
    headToHead: z.array(HeadToHeadSchema).describe('1-v-1 comparison with each competitor'),
    strategicRecommendations: z.array(StrategicRecommendationSchema).describe('Prioritized strategic recommendations'),
});

export type CompetitiveAnalysisOutput = z.infer<typeof CompetitiveAnalysisOutputSchema>;

// --- Prompt ---

const competitiveAnalysisPrompt = ai.definePrompt({
    name: 'competitiveAnalysisPrompt',
    input: { schema: CompetitiveAnalysisInputSchema },
    output: { schema: CompetitiveAnalysisOutputSchema },
    prompt: `You are an elite Startup Strategy Consultant specializing in competitive intelligence and market positioning.

**Your task:** Analyze the user's solution against their competitors and produce a comprehensive, actionable strategic analysis.

**Language:** Write the entire analysis in {{language}} (fr = French, en = English). Keep standard startup/business terms in English even when writing in French (e.g., "Product-Market Fit", "Blue Ocean", "Go-to-Market", "Freemium", "Churn", "CAC", "LTV").

---

## MY SOLUTION
- **Name:** {{mySolution.name}}
{{#if mySolution.description}}- **Description:** {{mySolution.description}}{{/if}}
{{#if mySolution.targetSegment}}- **Target Segment:** {{mySolution.targetSegment}}{{/if}}
{{#if mySolution.businessModel}}- **Business Model:** {{mySolution.businessModel}}{{/if}}
{{#if mySolution.teamSize}}- **Team Size:** {{mySolution.teamSize}}{{/if}}
{{#if mySolution.fundingStage}}- **Funding Stage:** {{mySolution.fundingStage}}{{/if}}
{{#if mySolution.keyFeatures}}- **Key Features:** {{mySolution.keyFeatures}}{{/if}}
{{#if mySolution.differentiators}}- **Differentiators:** {{mySolution.differentiators}}{{/if}}
{{#if mySolution.pricingModel}}- **Pricing Model:** {{mySolution.pricingModel}}{{/if}}
{{#if mySolution.pricingRange}}- **Pricing Range:** {{mySolution.pricingRange}}{{/if}}
{{#if mySolution.positioning}}- **Positioning:** {{mySolution.positioning}}{{/if}}
- **Radar Scores:** Price={{mySolution.radarScores.price}}, Features={{mySolution.radarScores.features}}, UX={{mySolution.radarScores.ux}}, Market={{mySolution.radarScores.market}}, Innovation={{mySolution.radarScores.innovation}}, Support={{mySolution.radarScores.support}}

---

## COMPETITORS
{{#each competitors}}
### {{name}}
{{#if website}}- Website: {{website}}{{/if}}
{{#if description}}- Description: {{description}}{{/if}}
{{#if targetSegment}}- Target Segment: {{targetSegment}}{{/if}}
{{#if businessModel}}- Business Model: {{businessModel}}{{/if}}
{{#if strengths}}- Strengths: {{strengths}}{{/if}}
{{#if weaknesses}}- Weaknesses: {{weaknesses}}{{/if}}
{{#if pricing}}- Pricing: {{pricing}}{{/if}}
{{#if pricingModel}}- Pricing Model: {{pricingModel}}{{/if}}
{{#if pricingRange}}- Pricing Range: {{pricingRange}}{{/if}}
{{#if positioning}}- Positioning: {{positioning}}{{/if}}
{{#if teamSize}}- Team Size: {{teamSize}}{{/if}}
{{#if fundingStage}}- Funding: {{fundingStage}}{{/if}}
{{#if fundingAmount}}- Funding Amount: {{fundingAmount}}{{/if}}
{{#if yearFounded}}- Founded: {{yearFounded}}{{/if}}
{{#if geography}}- Geography: {{geography}}{{/if}}
{{#if keyFeatures}}- Key Features: {{keyFeatures}}{{/if}}
{{#if differentiators}}- Differentiators: {{differentiators}}{{/if}}
- Radar: Price={{radarScores.price}}, Features={{radarScores.features}}, UX={{radarScores.ux}}, Market={{radarScores.market}}, Innovation={{radarScores.innovation}}, Support={{radarScores.support}}
{{/each}}

---

## INSTRUCTIONS

Produce a structured JSON analysis with the following sections:

1. **executiveSummary**: A 3-5 sentence executive overview summarizing the competitive landscape and the user's positioning within it.

2. **marketPositioning**: 
   - overview: Detailed analysis of where the solution stands relative to competitors (price vs features, niche vs mass market, etc.)
   - quadrantSuggestion: Classify as "Leader", "Challenger", "Niche", or "Suiveur" based on radar scores and market data.

3. **competitiveAdvantages**: List 3-5 clear advantages the user's solution has over competitors (based on radar scores, features, pricing, differentiation).

4. **vulnerabilities**: List 3-5 weaknesses or gaps compared to competitors that need attention.

5. **opportunities**: List 3-5 strategic opportunities (Blue Ocean areas, underserved segments, feature gaps in competitor offerings).

6. **threats**: List 3-5 external threats (well-funded competitors, market shifts, commoditization risks).

7. **headToHead**: For each competitor, provide:
   - winPoints: 2-3 specific areas where the user's solution is stronger
   - losePoints: 2-3 specific areas where the competitor is stronger
   - recommendation: One concrete, actionable recommendation

8. **strategicRecommendations**: 4-6 prioritized recommendations with:
   - priority: high/medium/low
   - title: concise action title
   - description: what to do and why
   - timeline: "Court terme" (0-3 months), "Moyen terme" (3-6 months), or "Long terme" (6-12 months)

**Important guidelines:**
- Be specific and data-driven — reference actual radar scores and features in your analysis
- Be honest about weaknesses, don't just flatter
- Recommendations must be actionable, not generic platitudes
- If data is sparse for a competitor, note the uncertainty but still provide analysis
`,
});

// --- Flow ---

const competitiveAnalysisFlow = ai.defineFlow(
    {
        name: 'competitiveAnalysisFlow',
        inputSchema: CompetitiveAnalysisInputSchema,
        outputSchema: CompetitiveAnalysisOutputSchema,
    },
    async (input) => {
        const { output } = await competitiveAnalysisPrompt(input);
        if (!output) {
            throw new Error('Failed to generate competitive analysis.');
        }
        return output;
    }
);

// --- Exported wrapper ---

export async function generateCompetitiveAnalysis(
    input: CompetitiveAnalysisInput
): Promise<CompetitiveAnalysisOutput> {
    return competitiveAnalysisFlow(input);
}
