import OpenAI from 'openai';
import { FounderStore, Contact } from '@/store/founder-store';

const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY;

export const AI_SERVICE_CONFIG = {
    provider: apiKey ? 'openai' : 'mock',
    apiKey: apiKey || '',
};

const openai = apiKey ? new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // ONLY for this local-first dashboard. In production, use API routes.
}) : null;

/**
 * Generates a weekly report for the founder based on their data.
 */
export async function generateWeeklyReport(data: FounderStore): Promise<string> {

    if (!openai) {
        console.warn("OpenAI API Key missing. Returning mock data.");
        // Fallback to mock if no key
        return generateMockReport(data);
    }

    try {
        const prompt = `
        You are an elite startup coach for a solo founder.
        Analyze the following data from their "Founder Operating System":

        **Context:**
        - **Data Date**: ${new Date().toLocaleDateString()}
        - **Runway**: ${data.finance.cashAvailable} cash available (check burn rate context yourself if provided).
        - **Objectives (OKRs)**: ${JSON.stringify(data.objectives.map(o => ({ title: o.title, progress: o.progress, status: o.status })))}
        - **Hypotheses**: ${JSON.stringify(data.hypotheses.map(h => ({ statement: h.statement, status: h.status, result: h.actualResult })))}
        - **Recent Journal Moods**: ${JSON.stringify(data.journalEntries.slice(-5).map(e => ({ date: e.date, mood: e.mood })))}
        
        **Your Goal:**
        Write a concise, high-impact "Weekly Coach Report".
        1. **Assessment**: Briefly assess their current state (Focus, Validation, Health).
        2. **One Big Observation**: Connect dots between their mood, progress, and hypotheses.
        3. **Actionable Advice**: Give 1 specific, tactical recommendation for next week.
        
        **Tone:** Encouraging but radically candid. Concise. Use Markdown.
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
            model: "gpt-4o",
        });

        return completion.choices[0].message.content || "No response generated.";

    } catch (error) {
        console.error("AI Generation Error:", error);
        return "Error generating report. Please check your API usage or internet connection.\n\nFallback:\n" + generateMockReport(data);
    }
}

function generateMockReport(data: any): string {
    const objectivesCount = data.objectives.length;
    const hypothesesCount = data.hypotheses.length;

    return `
# Weekly Founder Report (Mock) 🚀

*OpenAI Key not detected or error occurred. Showing placeholder.*

**Focus & Direction (OKRs)**
You have **${objectivesCount} active Objectives**.

**Validation (Hypotheses)**
You are tracking **${hypothesesCount} hypotheses**.

---
*Recommendation:*
Check your API key configuration in .env.local to enable real AI coaching.
    `.trim();
}

/**
 * Generates a follow-up email draft for a contact.
 */
export async function generateFollowUp(contact: Contact): Promise<string> {
    if (!openai) {
        return "AI Service not configured. Please check .env.local.";
    }

    try {
        const prompt = `
        Context: I am a founder. I last spoke to ${contact.name} (${contact.role || 'Partner'} at ${contact.company || 'Unknown'}) on ${contact.lastContactDate}.
        Status: ${contact.status}.
        Notes: ${contact.notes || "No notes"}.
        
        Task: Draft a short, personalized follow-up email to reconnect/move the deal forward.
        Return ONLY the subject and body.
        
        Tone: Professional, concise, and friendly.
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
            model: "gpt-4o",
        });

        return completion.choices[0].message.content || "No response generated.";
    } catch (error) {
        console.error("AI Follow-up Error:", error);
        return "Error generating draft.";
    }
}

/**
 * Generates an analysis of the founder's routine and consistency.
 */
export async function generateRoutineAnalysis(routine: any[], history: any[]): Promise<string> {
    if (!openai) {
        return "AI Service not configured. Please check .env.local.";
    }

    try {
        const recentHistory = history.slice(-14);
        const prompt = `
        Context: I am a solo founder trying to build a consistent high-performance routine.
        
        My Routine Structure:
        ${JSON.stringify(routine.map((d: any) => ({ day: d.day, tasks: d.tasks.map((t: any) => t.text) })))}
        
        My Consistency History (Last 14 days):
        ${JSON.stringify(recentHistory.map((h: any) => ({ date: h.date, rate: Math.round(h.completionRate * 100) + '%' })))}
        
        Task: Analyze my routine and consistency.
        1. Identify patterns (do I slack off on Fridays? Is my Monday too heavy?).
        2. Suggest 1 specific modification to improve consistency or impact.
        
        Tone: Analytical but encouraging. Short and actionable.
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a productivity expert." }, { role: "user", content: prompt }],
            model: "gpt-4o",
        });

        return completion.choices[0].message.content || "No analysis generated.";
    } catch (error) {
        console.error("AI Routine Analysis Error:", error);
        return "Error analyzing routine.";
    }
}
