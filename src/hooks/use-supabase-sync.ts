import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useFounderStore } from '@/store/founder-store';

/**
 * Synchronizes core user data (Auth ID, plan_status, cohort) between Supabase Auth and the Zustand store.
 * (Legacy founder_data sync has been removed in favor of Prisma API endpoints).
 */
export function useSupabaseSync() {
    const [user, setUser] = useState<any>(null);
    const store = useFounderStore;
    const supabase = createClient();

    // Track Supabase Auth State
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load User Profile Data on Mount/Login
    useEffect(() => {
        const currentUserId = user?.id ?? null;
        const storedUserId = useFounderStore.getState().userId;

        if (currentUserId && currentUserId !== storedUserId) {
            if (!storedUserId) {
                useFounderStore.getState().setUserId(currentUserId);
            } else {
                useFounderStore.getState().reset();
                useFounderStore.getState().setUserId(currentUserId);
            }
        } else if (!currentUserId && storedUserId) {
            useFounderStore.getState().reset();
            useFounderStore.getState().setUserId(null);
        }

        async function loadData() {
            if (!user) return;

            try {
                // Load basic profile fields
                const { data: userData } = await supabase
                    .from('users')
                    .select('plan_status, cohort, cohort_rank')
                    .eq('id', user.id)
                    .single();

                if (userData) {
                    const storeState = useFounderStore.getState();
                    if (userData.plan_status) storeState.setPlanStatus(userData.plan_status as any);
                    if (userData.cohort) storeState.setCohort(userData.cohort as any);
                    if (userData.cohort_rank != null) storeState.setCohortRank(userData.cohort_rank);
                }
            } catch (err: any) {
                console.error('[Sync] Unexpected load error:', err);
            }
        }

        loadData();
    }, [user?.id]);
}
