import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.HERMES_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        // Supabase expose son schéma OpenAPI via la route racine de son API REST
        const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${serviceRoleKey}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Échec de la récupération du schéma : ${response.statusText}`);
        }

        const schema = await response.json();
        return NextResponse.json(schema);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
