import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

/**
 * Middleware Helmdash — session + subdomain routing
 *
 * HD-100 · Split marketing/app : app.helmdash.app → (app)
 * Les routes protégées (dashboard, agent, etc.) ne sont accessibles
 * que depuis le sous-domaine app. ou après authentification.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // === Subdomain routing : app.helmdash.app ===
  // Si on est sur app.*, on autorise l'accès aux routes protégées
  const isAppSubdomain = host.startsWith('app.') || host.startsWith('localhost:');
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/agent') ||
    pathname.startsWith('/memory') ||
    pathname.startsWith('/hypotheses') ||
    pathname.startsWith('/finances') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/admin');

  // Rediriger les tentatives d'accès aux routes protégées depuis le domaine principal
  // vers la page de login (si pas sur app.*)
  if (isProtectedRoute && !isAppSubdomain) {
    // Laisser passer — l'auth gérera la redirection si non connecté
    // On ne bloque pas ici pour permettre le développement local
  }

  // === Session Supabase (existante) ===
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};