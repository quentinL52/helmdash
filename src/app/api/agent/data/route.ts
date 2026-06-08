import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    // 1. Sécurité de second niveau au sein de l'endpoint
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.HERMES_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Initialisation du client admin qui outrepasse les politiques RLS
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        const body = await request.json()
        
        // Exemple d'insertion ou de lecture de données
        // Remplacer 'nom_de_votre_table' par la table réelle à cibler
        const { data, error } = await supabaseAdmin
            .from('nom_de_votre_table')
            .select('*')

        if (error) throw error

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
