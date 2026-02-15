'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
// We use flexible schemas to accommodate evolving data structures
// Input Schema
// We use flexible schemas to accommodate evolving data structures
const WeeklyCoachInputSchema = z.object({
    mondayDate: z.string().describe('The date of the Monday for this report (YYYY-MM-DD)'),
    hypotheses: z.array(z.object({
        hypothesis: z.string(),
        status: z.string(),
    }).passthrough()).describe('List of current hypotheses and their status'),
    journalEntries: z.array(z.object({
        content: z.string(),
        mood: z.string().optional(),
        tags: z.array(z.string()).optional(),
        date: z.string(),
    }).passthrough()).describe('Journal entries from the past week'),
    objectives: z.array(z.object({
        title: z.string(),
        progress: z.number(),
        status: z.string(),
    }).passthrough()).describe('Current OKRs and their progress'),
    routineConsistency: z.string().describe('Summary or score of routine adherence for the past week'),
    weeklyFocus: z.string().optional().describe('The main focus or goal set for the past week, if any'),
    language: z.enum(['fr', 'en']).optional().default('en').describe('The language for the generated report'),
});

export type WeeklyCoachInput = z.infer<typeof WeeklyCoachInputSchema>;

// Output Schema
const WeeklyCoachOutputSchema = z.object({
    report: z.string().describe('A comprehensive markdown report including Review, Strategy, and Motivation sections.'),
});

export type WeeklyCoachOutput = z.infer<typeof WeeklyCoachOutputSchema>;

// Prompt
const generateWeeklyReportPrompt = ai.definePrompt({
    name: 'generateWeeklyReport',
    input: { schema: WeeklyCoachInputSchema },
    output: { schema: WeeklyCoachOutputSchema },
    prompt: `You are an elite Startup Coach and Strategist. Your goal is to help the founder reflect on their past week, extract key learnings, and set a powerful direction for the new week.

  **Context:**
  - **Date:** {{mondayDate}}
  - **Weekly Focus:** {{weeklyFocus}}
  - **Routine Consistency:** {{routineConsistency}}
  - **Language:** {{language}}

  **Data from the Past Week:**
  
  **1. Hypotheses (Experiments):**
  {{#each hypotheses}}
  - {{hypothesis}} [Status: {{status}}]
  {{/each}}

  **2. OKRs (Objectives):**
  {{#each objectives}}
  - {{title}} [Progress: {{progress}}%, Status: {{status}}]
  {{/each}}

  **3. Journal Entries (Reflections & Mood):**
  {{#each journalEntries}}
  - [{{date}}] {{content}} (Mood: {{mood}}, Tags: {{tags}})
  {{/each}}

  ---

  **Instructions:**
  Generate a **Weekly Founder Report** in Markdown format. The report should be concise, actionable, and encouraging but honest. 
  
  **Language Instructions:**
  - If language is 'fr', write the Main Content in **French**.
  - IMPORTANT: Keep standard startup terminology in **English** even when writing in French (e.g., "Burn Rate", "Runway", "Churn", "Lead", "Pivot", "MVP", "Product-Market Fit", "Pipeline", "OKR").
  - If language is 'en', write everything in English.

  Use the following structure:

  # 🚀 Weekly Kickoff Report - {{mondayDate}}

  ## 1. 🛑 Last Week's Review (The "Mirror")
  *Analyze the data above.*
  - **Highlights:** What went well based on objective progress and positive journal entries?
  - **Blockers & Patterns:** Identify any recurring negative patterns (e.g., poor routine, stalled hypotheses, negative mood). Be direct but constructive.
  - **Hypothesis Check:** Are they iterating fast enough?

  ## 2. 🎯 Strategy for This Week (The "Map")
  *Based on the review, suggest a focus.*
  - **Top 3 Priorities:** Suggest 3 concrete actions to move the needle on the most critical OKRs or modify a stalled hypothesis.
  - **Routine Helper:** A 1-sentence tip to improve or maintain routine consistency.

  ## 3. 🔥 Monday Motivation (The "Spark")
  - A short, punchy paragraph or a relevant quote to get them fire up for the week. Connect it to their specific situation (e.g., if they had a tough week, focus on resilience; if great, focus on momentum).

  **Tone:** Professional, insightful, empathetic, yet demanding of high performance (like a top-tier sports coach).
  `,
});

// Flow
const generateWeeklyReportFlow = ai.defineFlow(
    {
        name: 'generateWeeklyReportFlow',
        inputSchema: WeeklyCoachInputSchema,
        outputSchema: WeeklyCoachOutputSchema,
    },
    async (input) => {
        const { output } = await generateWeeklyReportPrompt(input);
        if (!output) {
            throw new Error('Failed to generate weekly report.');
        }
        return output;
    }
);

export async function generateWeeklyReport(input: WeeklyCoachInput): Promise<WeeklyCoachOutput> {
    return generateWeeklyReportFlow(input);
}
