/**
 * Helmdash — Authenticated Route Wrapper
 *
 * Extracts the Supabase session from the request cookies.
 * Returns 401 if no valid session exists.
 * Injects `userId` into the handler context.
 *
 * Usage:
 * ```ts
 * import { withAuth } from '@/lib/security/with-auth';
 *
 * export const POST = withAuth(async (req, { userId }) => {
 *   // userId is guaranteed to be defined here
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export type AuthenticatedHandler<T = unknown> = (
  req: NextRequest,
  context: { userId: string; params?: T },
) => Promise<NextResponse>;

export type AuthResult =
  | { user: null; error: NextResponse }
  | { user: { id: string }; error: null };

/**
 * Extract the authenticated user from the request.
 * Can be used standalone or composed with the `withAuth` wrapper.
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Authentication required. Please sign in.' },
          { status: 401 },
        ),
      };
    }

    return { user: { id: user.id }, error: null };
  } catch (err) {
    console.error('[withAuth] Unexpected error:', err);
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication check failed.' },
        { status: 500 },
      ),
    };
  }
}

/**
 * Wraps an API route handler with Supabase session authentication.
 * The handler receives `userId` in its context — guaranteed to be defined.
 *
 * Supports both AuthenticatedHandler (standard) and handlers with
 * richer context types (e.g. composed with withValidation).
 */
export function withAuth<T>(
  handler: AuthenticatedHandler<T>,
): (req: NextRequest, context: any) => Promise<NextResponse>;

export function withAuth<C extends { userId: string }>(
  handler: (req: NextRequest, context: C) => Promise<NextResponse>,
): (req: NextRequest, context: any) => Promise<NextResponse>;

export function withAuth<T>(
  handler: ((req: NextRequest, context: { userId: string; params?: T }) => Promise<NextResponse>) | ((req: NextRequest, context: Record<string, unknown>) => Promise<NextResponse>),
): (req: NextRequest, context: any) => Promise<NextResponse> {
  return async (req: NextRequest, context: any) => {
    const auth = await getAuthenticatedUser();
    if (auth.error) return auth.error;
    
    // In Next.js 15, params might be a Promise, so we must await it if it exists.
    let resolvedParams = {};
    if (context && context.params) {
       resolvedParams = context.params instanceof Promise ? await context.params : context.params;
    }

    return (handler as (req: NextRequest, context: { userId: string; params?: unknown }) => Promise<NextResponse>)(
      req,
      { userId: auth.user.id, ...context, params: resolvedParams },
    );
  };
}