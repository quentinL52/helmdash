import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const res = await updateSession(request);

  if (!request.cookies.get('NEXT_LOCALE')) {
    const acceptLang = request.headers.get('accept-language') || '';
    const detected = acceptLang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
    res.cookies.set('NEXT_LOCALE', detected, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
