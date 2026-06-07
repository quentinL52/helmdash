'use client';

import { useSupabaseSync } from '@/hooks/use-supabase-sync';

export function StoreSync() {
    useSupabaseSync();
    return null;
}
