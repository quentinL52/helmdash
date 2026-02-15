import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { useFounderStore } from '@/store/founder-store';

export function useSupabaseSync() {
    const { user } = useUser();
    const store = useFounderStore;
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLoadedRef = useRef(false);

    // 1. Load Data on Mount/Login
    useEffect(() => {
        async function loadData() {
            if (!user) return;

            const { data, error } = await supabase
                .from('founder_data')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) {
                if (error.code !== 'PGRST116') {
                    console.error('Supabase Load Error:', error);
                }
                isLoadedRef.current = true;
                return;
            }

            if (data) {
                const stateToHydrate = {
                    hypotheses: data.hypotheses || [],
                    finance: data.finance || {},
                    journalEntries: data.journal_entries || [],
                    objectives: data.objectives || [],
                    contentIdeas: data.content_ideas || [],
                    contacts: data.contacts || [],
                    routineHistory: data.routine_history || [],
                    leanCanvas: data.lean_canvas || {},
                    weeklyReport: data.weekly_report || null,
                };
                useFounderStore.getState().hydrate(stateToHydrate);
            }
            isLoadedRef.current = true;
        }

        loadData();
    }, [user?.id]);

    // 2. Subscribe to store changes and save with debounce (no re-renders)
    useEffect(() => {
        if (!user) return;

        const unsubscribe = store.subscribe(() => {
            if (!isLoadedRef.current) return;

            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }

            saveTimerRef.current = setTimeout(async () => {
                const state = store.getState();
                const payload = {
                    user_id: user.id,
                    hypotheses: state.hypotheses,
                    finance: state.finance,
                    journal_entries: state.journalEntries,
                    objectives: state.objectives,
                    content_ideas: state.contentIdeas,
                    contacts: state.contacts,
                    routine: state.routine,
                    routine_history: state.routineHistory,
                    lean_canvas: state.leanCanvas,
                    weekly_report: state.weeklyReport,
                    updated_at: new Date().toISOString(),
                };

                const { error } = await supabase
                    .from('founder_data')
                    .upsert(payload, { onConflict: 'user_id' });

                if (error) {
                    console.error('Supabase Save Error:', error.message);
                }
            }, 2000);
        });

        return () => {
            unsubscribe();
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, [user?.id]);
}
