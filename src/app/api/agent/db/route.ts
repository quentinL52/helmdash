import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    // 1. Authentification
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.HERMES_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Initialisation du client admin
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        const body = await request.json()
        const { action, table, match, data, select = '*' } = body

        if (!table || !action) {
            return NextResponse.json({ error: 'Paramètres "table" et "action" obligatoires' }, { status: 400 })
        }

        let query = supabaseAdmin.from(table)
        let result;

        switch (action) {
            case 'select':
                let selectQuery = query.select(select);
                if (match) {
                    selectQuery = selectQuery.match(match);
                }
                result = await selectQuery;
                break;
            case 'insert':
                if (!data) throw new Error("Le paramètre 'data' est requis pour une insertion.");
                result = await query.insert(data).select(select);
                break;
            case 'update':
                if (!data || !match) throw new Error("Les paramètres 'data' et 'match' sont requis pour une mise à jour.");
                result = await query.update(data).match(match).select(select);
                break;
            case 'delete':
                if (!match) throw new Error("Le paramètre 'match' est requis pour une suppression.");
                result = await query.delete().match(match).select(select);
                break;
            default:
                return NextResponse.json({ error: `Action '${action}' non reconnue. Utilisez select, insert, update ou delete.` }, { status: 400 })
        }

        if (result.error) {
            throw result.error;
        }

        return NextResponse.json({ success: true, data: result.data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
