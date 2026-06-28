import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';

const apiKey = process.env.AI_API_KEY;

const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!openai) {
        return NextResponse.json(
            { result: 'AI Service not configured. Check AI_API_KEY in .env.local.' },
            { status: 200 }
        );
    }

    try {
        const body = await request.json();
        const { action, data } = body;

        let result: string;

        switch (action) {
            case 'weekly-report':
                result = await handleWeeklyReport(data);
                break;
            case 'follow-up':
                result = await handleFollowUp(data);
                break;
            case 'routine-analysis':
                result = await handleRoutineAnalysis(data);
                break;
            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }

        return NextResponse.json({ result });
    } catch (error) {
        console.error('AI API Error:', error);
        return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }
}

async function handleWeeklyReport(data: {
    cashAvailable: number;
    objectives: { title: string; progress: number; status: string }[];
    hypotheses: { statement: string; status: string; actualResult?: string }[];
    journalEntries: { date: string; mood: number }[];
}): Promise<string> {
    const prompt = `
You are an elite startup coach for a solo founder.
Analyze the following data from their "Founder Operating System":

**Context:**
- **Data Date**: ${new Date().toLocaleDateString()}
- **Runway**: ${data.cashAvailable} cash available (check burn rate context yourself if provided).
- **Objectives (OKRs)**: ${JSON.stringify(data.objectives)}
- **Hypotheses**: ${JSON.stringify(data.hypotheses)}
- **Recent Journal Moods**: ${JSON.stringify(data.journalEntries)}

**Your Goal:**
Write a concise, high-impact "Weekly Coach Report".
1. **Assessment**: Briefly assess their current state (Focus, Validation, Health).
2. **One Big Observation**: Connect dots between their mood, progress, and hypotheses.
3. **Actionable Advice**: Give 1 specific, tactical recommendation for next week.

**Tone:** Encouraging but radically candid. Concise. Use Markdown.
`;

    const completion = await openai!.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt },
        ],
        model: 'gpt-4o',
    });

    return completion.choices[0].message.content || 'No response generated.';
}

async function handleFollowUp(data: {
    name: string;
    role?: string;
    company?: string;
    lastContactDate: string;
    status: string;
    notes?: string;
}): Promise<string> {
    const prompt = `
Context: I am a founder. I last spoke to ${data.name} (${data.role || 'Partner'} at ${data.company || 'Unknown'}) on ${data.lastContactDate}.
Status: ${data.status}.
Notes: ${data.notes || 'No notes'}.

Task: Draft a short, personalized follow-up email to reconnect/move the deal forward.
Return ONLY the subject and body.

Tone: Professional, concise, and friendly.
`;

    const completion = await openai!.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt },
        ],
        model: 'gpt-4o',
    });

    return completion.choices[0].message.content || 'No response generated.';
}

async function handleRoutineAnalysis(data: {
    routine: { day: string; tasks: string[] }[];
    history: { date: string; rate: string }[];
}): Promise<string> {
    const prompt = `
Context: I am a solo founder trying to build a consistent high-performance routine.

My Routine Structure:
${JSON.stringify(data.routine)}

My Consistency History (Last 14 days):
${JSON.stringify(data.history)}

Task: Analyze my routine and consistency.
1. Identify patterns (do I slack off on Fridays? Is my Monday too heavy?).
2. Suggest 1 specific modification to improve consistency or impact.

Tone: Analytical but encouraging. Short and actionable.
`;

    const completion = await openai!.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a productivity expert.' },
            { role: 'user', content: prompt },
        ],
        model: 'gpt-4o',
    });

    return completion.choices[0].message.content || 'No analysis generated.';
}
