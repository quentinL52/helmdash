import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Fetch user plan to ensure they have access (Growth or Scale)
        const { data: userData } = await supabase
            .from('users')
            .select('plan_tier')
            .eq('id', user.id)
            .single();

        const planTier = userData?.plan_tier || 'free';
        if (planTier !== 'growth' && planTier !== 'scale') {
            return NextResponse.json({ error: 'Le plan Growth ou Scale est requis pour cette fonctionnalité.' }, { status: 403 });
        }

        // Parse optional request parameters
        const body = await req.json().catch(() => ({}));

        // Fetch user data from Supabase to provide as context
        const { data: founderData, error: dbError } = await supabase
            .from('founder_data')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (dbError || !founderData) {
            return NextResponse.json({ error: 'Données utilisateur introuvables' }, { status: 404 });
        }

        // Aggregate data for the prompt
        const objectives = founderData.objectives || [];
        const hypotheses = founderData.hypotheses || [];
        const finances = founderData.finance || { cashAvailable: 0 };
        const routineHistory = founderData.routine_history || [];

        const prompt = `
En tant que Coach d'Affaires Expert en IA pour les fondateurs de startups (méthode Lean Startup), générez un rapport stratégique hebdomadaire pour ce fondateur.

Voici les données de la semaine :
Objectifs (OKRs) :
${JSON.stringify(objectives, null, 2)}

Hypothèses testées :
${JSON.stringify(hypotheses.filter((h: any) => h.status === 'testing' || h.status === 'validated' || h.status === 'invalidated'), null, 2)}

Finances :
Cash disponible : ${finances.cashAvailable}

Dernières routines complétées :
${JSON.stringify(routineHistory.slice(0, 5), null, 2)}

Génère un rapport en Markdown structuré avec :
1. Résumé exécutif de la semaine (Ton encourageant mais rigoureux)
2. Analyse de la progression des OKRs
3. Insights sur les hypothèses testées (Qu'avons-nous appris ?)
4. Recommandations actionnables pour la semaine prochaine (3 priorités claires)
5. Santé du projet (Analyse rapide cash/runway et momentum)

Reste concis, orienté action et direct. Utilise un format Markdown agréable à lire.
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Vous êtes un mentor exigeant et bienveillant spécialisé en early-stage startups." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        const reportContent = response.choices[0].message.content;

        const newReport = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            content: reportContent,
            status: 'generated'
        };

        // Optionally, save the generated report back to the database
        // We retrieve the existing weekly reports to append the new one
        const existingReports = founderData.weekly_report ? [founderData.weekly_report] : [];
        if (founderData.weekly_reports_history) {
            existingReports.push(...founderData.weekly_reports_history);
        }

        // Wait, usually it saves the latest as `weekly_report` object.
        await supabase
            .from('founder_data')
            .update({ weekly_report: newReport })
            .eq('user_id', user.id);

        return NextResponse.json({ report: newReport });

    } catch (error: any) {
        console.error('Weekly Report Error:', error);
        return NextResponse.json({ error: error.message || 'Une erreur est survenue lors de la génération du rapport' }, { status: 500 });
    }
}
