
import { FounderStore } from '@/store/founder-store';

export const AI_SERVICE_CONFIG = {
    provider: 'mock', // 'mock' | 'openai' | 'gemini'
    apiKey: process.env.NEXT_PUBLIC_AI_API_KEY || '',
};

/**
 * Generates a weekly report for the founder based on their data.
 * Currently returns a mocked response until an API key is provided and provider logic is implemented.
 */
export async function generateWeeklyReport(data: FounderStore): Promise<string> {

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (AI_SERVICE_CONFIG.provider === 'mock') {
        const objectivesCount = data.objectives.length;
        const hypothesesCount = data.hypotheses.length;
        const runwayMonths = data.finance.runwayMonths;

        return `
# Weekly Founder Report 🚀

Based on your current data, here are my observations:

**Focus & Direction (OKRs)**
You have **${objectivesCount} active Objectives**. ${objectivesCount === 0 ? "Consider setting a North Star to align your daily tasks." : "Good job keeping your goals visible."}

**Validation (Hypotheses)**
You are tracking **${hypothesesCount} hypotheses**. ${hypothesesCount > 0 ? "Make sure to run experiments quickly to validate them." : "Start formulating risky assumptions to test."}

**Health (Runway)**
Your calculated runway is **${runwayMonths} months**. ${runwayMonths < 6 ? "⚠️ Keep an eye on your finances and consider fundraising or cost-cutting." : "✅ You have a healthy runway."}

---
*Recommendation:*
Focus on your top priority objective this week. Don't get distracted by "fake work".
        `.trim();
    }

    // TODO: Implement real API call to OpenAI or Gemini here
    // const prompt = `Act as a startup coach. Analyze this data: ${JSON.stringify(data)}...`;

    return "AI service not fully configured.";
}
