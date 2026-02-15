import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const createSupabaseClient = (accessToken?: string) => {
    const options = accessToken
        ? {
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        }
        : {};

    return createClient(supabaseUrl, supabaseKey, options);
};
