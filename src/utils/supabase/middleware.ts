import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Define protected routes here
    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
    const isApiRoute = request.nextUrl.pathname.startsWith('/api')
    
    // Les routes API ne sont plus publiques par défaut
    const isPublicRoute = request.nextUrl.pathname === '/' || 
                          isAuthRoute || 
                          request.nextUrl.pathname.startsWith('/contact') || 
                          request.nextUrl.pathname.startsWith('/legal');

    // 1. Protection et filtrage des routes API
    if (isApiRoute) {
        const expectedApiKey = process.env.HERMES_API_KEY;
        const providedApiKey = request.headers.get('x-api-key');

        // Préparation des headers CORS pour les agents externes
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
        };

        // Autoriser les requêtes OPTIONS (CORS preflight) immédiatement
        if (request.method === 'OPTIONS') {
            return NextResponse.json({}, { headers: corsHeaders });
        }

        // Ajouter les headers CORS à la réponse
        Object.entries(corsHeaders).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
        });

        // Validation de l'agent externe
        if (expectedApiKey && providedApiKey === expectedApiKey) {
            return supabaseResponse;
        }

        // Validation de l'utilisateur connecté sur l'interface
        if (user) {
            return supabaseResponse;
        }

        // Exception pour la route waitlist (publique)
        if (request.nextUrl.pathname.startsWith('/api/waitlist')) {
            return supabaseResponse;
        }

        // Refus d'accès si aucune méthode d'authentification n'est valide
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 401, headers: corsHeaders });
    }

    // 2. Protection de l'interface utilisateur web
    if (!user && !isPublicRoute) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/auth'
        return NextResponse.redirect(url)
    }

    // 3. Protection de la route Admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
        const adminEmail = process.env.ADMIN_EMAIL || 'quentin.lefevre52@gmail.com'; // fallback if not set
        if (!user || user.email !== adminEmail) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}
