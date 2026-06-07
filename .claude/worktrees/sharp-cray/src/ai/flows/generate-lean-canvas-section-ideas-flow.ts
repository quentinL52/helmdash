'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate content suggestions
 * for specific sections of a Lean Canvas based on a business concept.
 *
 * - generateLeanCanvasSectionIdeas - A function that generates content suggestions for a Lean Canvas section.
 * - GenerateLeanCanvasSectionIdeasInput - The input type for the generateLeanCanvasSectionIdeas function.
 * - GenerateLeanCanvasSectionIdeasOutput - The return type for the generateLeanCanvasSectionIdeas function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input Schema
const GenerateLeanCanvasSectionIdeasInputSchema = z.object({
  businessConcept: z.string().describe('A high-level description or keywords of the business concept.'),
  leanCanvasSection: z.enum([
    'Problem',
    'Solution',
    'Key Metrics',
    'Unique Value Proposition',
    'Unfair Advantage',
    'Channels',
    'Customer Segments',
    'Cost Structure',
    'Revenue Streams'
  ]).describe('The specific section of the Lean Canvas for which to generate ideas.')
});
export type GenerateLeanCanvasSectionIdeasInput = z.infer<typeof GenerateLeanCanvasSectionIdeasInputSchema>;

// 2. Define Output Schema
const GenerateLeanCanvasSectionIdeasOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of generated content suggestions for the specified Lean Canvas section.')
});
export type GenerateLeanCanvasSectionIdeasOutput = z.infer<typeof GenerateLeanCanvasSectionIdeasOutputSchema>;

// 3. Define the Prompt
const generateLeanCanvasSectionIdeasPrompt = ai.definePrompt({
  name: 'generateLeanCanvasSectionIdeasPrompt',
  input: { schema: GenerateLeanCanvasSectionIdeasInputSchema },
  output: { schema: GenerateLeanCanvasSectionIdeasOutputSchema },
  prompt: `You are an AI assistant specialized in business model generation for startups. Your task is to generate ideas for a specific section of a Lean Canvas, based on a provided business concept.\n\nBusiness Concept: {{{businessConcept}}}\nLean Canvas Section: {{{leanCanvasSection}}}\n\nGenerate 3-5 distinct and concise content suggestions for the "{{{leanCanvasSection}}}" section of a Lean Canvas, based on the provided "Business Concept". Ensure the suggestions are actionable, relevant, and suitable for a startup founder quickly populating their business model.\n\nOutput your suggestions as a JSON array in the format:\n\n\`\`\`json\n{\n  "suggestions": [\n    "Suggestion 1",\n    "Suggestion 2",\n    "Suggestion 3"\n  ]\n}\n\`\`\`\n`
});

// 4. Define the Genkit Flow
const generateLeanCanvasSectionIdeasFlow = ai.defineFlow(
  {
    name: 'generateLeanCanvasSectionIdeasFlow',
    inputSchema: GenerateLeanCanvasSectionIdeasInputSchema,
    outputSchema: GenerateLeanCanvasSectionIdeasOutputSchema,
  },
  async (input) => {
    const { output } = await generateLeanCanvasSectionIdeasPrompt(input);
    if (!output) {
      throw new Error('Failed to generate Lean Canvas section ideas.');
    }
    return output;
  }
);

// 5. Exported wrapper function
export async function generateLeanCanvasSectionIdeas(input: GenerateLeanCanvasSectionIdeasInput): Promise<GenerateLeanCanvasSectionIdeasOutput> {
  return generateLeanCanvasSectionIdeasFlow(input);
}
