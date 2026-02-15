import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Creates a Supabase client using the native Clerk integration.
 * Uses the `accessToken` callback to inject Clerk's session token
 * into every request, verified by Supabase via JWKS (no shared secret).
 * @see https://clerk.com/docs/integrations/databases/supabase
 */
export function createClerkSupabaseClient(
    getToken: () => Promise<string | null>
) {
    return createClient(supabaseUrl, supabaseKey, {
        accessToken: async () => {
            return (await getToken()) ?? null;
        },
    });
}
