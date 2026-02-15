import { Contact } from '@/store/founder-store';

/**
 * Generates a follow-up email draft for a contact.
 */
export async function generateFollowUp(contact: Contact): Promise<string> {
    try {
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'follow-up',
                data: {
                    name: contact.name,
                    role: contact.role,
                    company: contact.company,
                    lastContactDate: contact.lastContactDate,
                    status: contact.status,
                    notes: contact.notes,
                },
            }),
        });

        const json = await response.json();

        if (!response.ok) {
            console.error('AI Follow-up Error:', json.error);
            return 'Error generating draft.';
        }

        return json.result;
    } catch (error) {
        console.error('AI Follow-up Error:', error);
        return 'Error generating draft.';
    }
}

/**
 * Generates an analysis of the founder's routine and consistency.
 */
export async function generateRoutineAnalysis(routine: any[], history: any[]): Promise<string> {
    try {
        const recentHistory = history.slice(-14);

        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'routine-analysis',
                data: {
                    routine: routine.map((d: any) => ({
                        day: d.day,
                        tasks: d.tasks.map((t: any) => t.text),
                    })),
                    history: recentHistory.map((h: any) => ({
                        date: h.date,
                        rate: Math.round(h.completionRate * 100) + '%',
                    })),
                },
            }),
        });

        const json = await response.json();

        if (!response.ok) {
            console.error('AI Routine Analysis Error:', json.error);
            return 'Error analyzing routine.';
        }

        return json.result;
    } catch (error) {
        console.error('AI Routine Analysis Error:', error);
        return 'Error analyzing routine.';
    }
}
/**
 * Generates strategic recommendations based on the founder's data.
 */
export async function generateStrategicRecommendations(data: {
    mySolution: any;
    competitors: any[];
    leanCanvas: any;
    roadmap: any;
    hypotheses: any[];
    language: string;
}) {
    const response = await fetch('/api/ai/strategic-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to generate strategic recommendations');
    }

    return response.json();
}

/**
 * Generates comprehensive competitive intelligence analysis.
 */
export async function generateCompetitiveIntelligence(data: {
    mySolution: any;
    competitors: any[];
    marketSignals: any[];
    leanCanvas: any;
    roadmap: any;
    hypotheses: any[];
    financeSummary?: any;
    previousIntelligence?: any;
    language: string;
}) {
    const response = await fetch('/api/ai/competitive-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to generate competitive intelligence');
    }

    return response.json();
}

/**
 * Scans the web for market signals about competitors.
 */
export async function scanMarketSignals(data: {
    competitors: { id: string; name: string }[];
    existingSignalTitles: string[];
    language: string;
}) {
    const response = await fetch('/api/ai/market-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to scan market signals');
    }

    return response.json();
}

/**
 * Auto-fills competitor data from a URL.
 */
export async function autoFillCompetitorFromUrl(url: string, language: string) {
    const response = await fetch('/api/ai/competitor-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, language }),
    });

    if (!response.ok) {
        throw new Error('Failed to extract competitor profile');
    }

    return response.json();
}
