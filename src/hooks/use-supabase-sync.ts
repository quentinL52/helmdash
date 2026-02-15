import { useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { createSupabaseClient } from '@/lib/supabase';
import { useFounderStore } from '@/store/founder-store';
import { useToast } from '@/hooks/use-toast';

export function useSupabaseSync() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const store = useFounderStore;
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLoadedRef = useRef(false);
    const { toast } = useToast();

    // 1. Load Data on Mount/Login
    useEffect(() => {
        async function loadData() {
            if (!user) return;

            const token = await getToken({ template: 'supabase' });
            const supabase = createSupabaseClient(token || undefined);

            const { data, error } = await supabase
                .from('founder_data')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) {
                if (error.code !== 'PGRST116') {
                    console.error('Supabase Load Error:', error);
                    toast({
                        title: "Error loading data",
                        description: error.message,
                        variant: "destructive",
                    });
                } else {
                    // New user, no data yet
                    // toast({
                    //     title: "Welcome!",
                    //     description: "Initializing your dashboard.",
                    // });
                }
                // Mark as loaded even if error (empty state)
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
                    strategicRecommendations: data.strategic_recommendations || null, // Hydrate recommendations
                    // New fields
                    routine: data.routine || [], // Fix: Load routine customization
                    competitors: data.competitors || [],
                    marketSignals: data.market_signals || [],
                    roadmap: data.roadmap || [], // Load roadmap
                    mySolution: data.my_solution || {
                        name: '',
                        radarScores: { price: 5, features: 5, ux: 5, market: 5, innovation: 5, support: 5 },
                    },
                };
                useFounderStore.getState().hydrate(stateToHydrate);
                // toast({
                //     title: "Data loaded",
                //     description: "Your dashboard is ready.",
                // });
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
                    strategic_recommendations: state.strategicRecommendations, // Persist AI recommendations
                    // New fields
                    competitors: state.competitors,
                    market_signals: state.marketSignals,
                    roadmap: state.roadmap, // Persist roadmap
                    my_solution: state.mySolution,
                    updated_at: new Date().toISOString(),
                };

                const token = await getToken({ template: 'supabase' });
                const supabase = createSupabaseClient(token || undefined);

                const { error } = await supabase
                    .from('founder_data')
                    .upsert(payload, { onConflict: 'user_id' });

                if (error) {
                    console.error('Supabase Save Error:', error.message);
                    toast({
                        title: "Error saving changes",
                        description: error.message,
                        variant: "destructive",
                    });
                } else {
                    // Optional: success toast (can be noisy if too frequent)
                    toast({
                        title: "Saved",
                        description: "Your changes have been saved.",
                        duration: 2000,
                    });
                }
            }, 2000); // 2 seconds debounce
        });

        return () => {
            unsubscribe();
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, [user?.id]);
}
