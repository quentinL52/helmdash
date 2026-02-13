'use server';
/**
 * @fileOverview A Genkit flow for brainstorming novel business ideas, market segments, and innovative solutions.
 *
 * - brainstormBusinessOpportunities - A function that initiates the business idea brainstorming process.
 * - BrainstormBusinessOpportunitiesInput - The input type for the brainstormBusinessOpportunities function.
 * - BrainstormBusinessOpportunitiesOutput - The return type for the brainstormBusinessOpportunities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BrainstormBusinessOpportunitiesInputSchema = z.object({
  industryOrArea: z
    .string()
    .describe(
      'The specific industry or area of interest for which to brainstorm business opportunities.'
    ),
});
export type BrainstormBusinessOpportunitiesInput = z.infer<
  typeof BrainstormBusinessOpportunitiesInputSchema
>;

const BrainstormBusinessOpportunitiesOutputSchema = z.object({
  businessIdeas: z
    .array(z.string())
    .describe('A list of novel business ideas.'),
  marketSegments: z
    .array(z.string())
    .describe('A list of potential market segments.'),
  solutions: z
    .array(z.string())
    .describe('A list of innovative solutions or value propositions.'),
});
export type BrainstormBusinessOpportunitiesOutput = z.infer<
  typeof BrainstormBusinessOpportunitiesOutputSchema
>;

export async function brainstormBusinessOpportunities(
  input: BrainstormBusinessOpportunitiesInput
): Promise<BrainstormBusinessOpportunitiesOutput> {
  return brainstormBusinessOpportunitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'brainstormBusinessOpportunitiesPrompt',
  input: {schema: BrainstormBusinessOpportunitiesInputSchema},
  output: {schema: BrainstormBusinessOpportunitiesOutputSchema},
  prompt: `You are an expert business consultant specializing in innovation and startup strategy.

Your task is to brainstorm novel business ideas, identify new market segments, and suggest innovative solutions within the specified industry or area of interest.

Be creative, think outside the box, and provide actionable and distinct ideas for each category.

Industry or Area of Interest: {{{industryOrArea}}}`,
});

const brainstormBusinessOpportunitiesFlow = ai.defineFlow(
  {
    name: 'brainstormBusinessOpportunitiesFlow',
    inputSchema: BrainstormBusinessOpportunitiesInputSchema,
    outputSchema: BrainstormBusinessOpportunitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
