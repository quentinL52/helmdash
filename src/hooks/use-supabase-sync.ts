import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useFounderStore } from '@/store/founder-store';
import { useToast } from '@/hooks/use-toast';

/**
 * Synchronizes founder data between the Zustand store and Supabase native Auth.
 *
 * Key safety mechanisms:
 * - userIdRef ensures save always uses the current authenticated user
 * - isLoadedRef prevents saving empty/reset state before Supabase data is loaded
 * - userId check in save prevents cross-account data leaks
 */
export function useSupabaseSync() {
    const [user, setUser] = useState<any>(null);
    const store = useFounderStore;
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLoadedRef = useRef(false);
    const userIdRef = useRef<string | null>(null); // Stable ref for current user ID
    const { toast } = useToast();
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

    // 1. Load Data on Mount/Login
    useEffect(() => {
        const currentUserId = user?.id ?? null;
        const storedUserId = useFounderStore.getState().userId;

        // Update the stable ref
        userIdRef.current = currentUserId;

        if (currentUserId && currentUserId !== storedUserId) {
            // Check if it's a first-time login (guest -> user)
            if (!storedUserId) {
                useFounderStore.getState().setUserId(currentUserId);
            } else {
                useFounderStore.getState().reset();
                useFounderStore.getState().setUserId(currentUserId);
            }
            isLoadedRef.current = false;
        } else if (!currentUserId && storedUserId) {
            useFounderStore.getState().reset();
            useFounderStore.getState().setUserId(null);
            isLoadedRef.current = false;
        }

        async function loadData() {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('founder_data')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                // Verify user hasn't changed during async operation
                if (userIdRef.current !== user.id) {
                    return;
                }

                if (error) {
                    if (error.code !== 'PGRST116') {
                        console.error('[Sync] Load Error:', error.message);
                        toast({
                            title: "Error loading data",
                            description: error.message,
                            variant: "destructive",
                        });
                    }
                    // New user or no data found — empty state from reset is valid
                    isLoadedRef.current = true;
                    return;
                }

                if (data) {

                    // Always synchronize IDs immediately
                    if (useFounderStore.getState().userId !== user.id) {
                        useFounderStore.getState().setUserId(user.id);
                    }

                    // HEURISTIC: Check if Supabase has any actual content at all
                    const hasSupaContent =
                        (data.hypotheses?.length > 0) ||
                        (data.objectives?.length > 0) ||
                        (data.journal_entries?.length > 0) ||
                        (data.contacts?.length > 0) ||
                        (data.finance && Object.keys(data.finance).length > 2) ||
                        (data.lean_canvas && Object.keys(data.lean_canvas).length > 0) ||
                        (data.my_solution?.name && data.my_solution.name !== "") ||
                        (data.roadmap?.length > 0);

                    const localState = useFounderStore.getState();
                    const hasLocalContent =
                        localState.hypotheses.length > 0 ||
                        localState.objectives.length > 0 ||
                        (localState.leanCanvas && Object.keys(localState.leanCanvas).length > 0 && localState.leanCanvas.problem !== "");

                    if (!hasSupaContent && hasLocalContent) {
                        isLoadedRef.current = true;
                        return;
                    }

                    // If Supabase has data OR local is empty, we must load what's on the account
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
                        strategicRecommendations: data.strategic_recommendations || null,
                        routine: data.routine || [],
                        competitors: data.competitors || [],
                        marketSignals: data.market_signals || [],
                        roadmap: data.roadmap || [],
                        mySolution: data.my_solution || {
                            name: '',
                            radarScores: { price: 5, features: 5, ux: 5, market: 5, innovation: 5, support: 5 },
                        },
                        competitiveIntelligence: data.competitive_intelligence || null,
                        competitiveSnapshots: data.competitive_snapshots || [],
                        scenarioAnalyses: data.scenario_analyses || [],
                        userId: user.id,
                    };
                    useFounderStore.getState().hydrate(stateToHydrate);



                // Plan tier fetch is currently failing due to missing column in 'users' table.
                // Re-enable this once the schema is updated.
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('plan_tier')
                    .eq('id', user.id)
                    .single();

                if (userData?.plan_tier) {
                    useFounderStore.getState().setPlanTier(userData.plan_tier as any);
                }
            } catch (err: any) {
                console.error('[Sync] Unexpected load error:', err);
            } finally {
                isLoadedRef.current = true;
            }
        }

        loadData();
    }, [user?.id]);

    // 2. Subscribe to store changes and save with debounce
    useEffect(() => {
        if (!user) return;

        const currentUserId = user.id;

        const unsubscribe = store.subscribe(() => {
            if (!isLoadedRef.current) return;

            // Safety check: only save if store userId matches the authenticated user
            const state = store.getState();
            if (state.userId !== currentUserId) {
                console.warn('[Sync] Store userId mismatch, skipping save.', {
                    storeUserId: state.userId,
                    authUserId: currentUserId,
                });
                return;
            }

            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }

            saveTimerRef.current = setTimeout(async () => {
                // Re-check after debounce
                const latestState = store.getState();
                if (latestState.userId !== currentUserId) {
                    console.warn('[Sync] Store userId mismatch after debounce, skipping save.');
                    return;
                }
                if (userIdRef.current !== currentUserId) {
                    console.warn('[Sync] Auth user changed during debounce, skipping save.');
                    return;
                }

                const now = new Date().toISOString();

                const payload = {
                    user_id: currentUserId,
                    hypotheses: latestState.hypotheses,
                    finance: latestState.finance,
                    journal_entries: latestState.journalEntries,
                    objectives: latestState.objectives,
                    content_ideas: latestState.contentIdeas,
                    contacts: latestState.contacts,
                    routine: latestState.routine,
                    routine_history: latestState.routineHistory,
                    lean_canvas: latestState.leanCanvas,
                    weekly_report: latestState.weeklyReport,
                    strategic_recommendations: latestState.strategicRecommendations,
                    competitors: latestState.competitors,
                    market_signals: latestState.marketSignals,
                    roadmap: latestState.roadmap,
                    my_solution: latestState.mySolution,
                    competitive_intelligence: latestState.competitiveIntelligence,
                    competitive_snapshots: latestState.competitiveSnapshots,
                    scenario_analyses: latestState.scenarioAnalyses,
                    updated_at: now,
                };

                // Parallel save: Founder Data + User Profile
                const saveFounderData = supabase
                    .from('founder_data')
                    .upsert(payload, { onConflict: 'user_id' });

                const saveUserProfile = supabase
                    .from('users')
                    .upsert({
                        id: currentUserId,
                        email: user.email,
                        full_name: user?.user_metadata?.full_name,
                        avatar_url: user?.user_metadata?.avatar_url,
                        updated_at: now,
                    }, { onConflict: 'id' });

                const [founderRes, userRes] = await Promise.all([saveFounderData, saveUserProfile]);
                const error = founderRes.error || userRes.error;

                if (error) {
                    console.error('[Sync] Save Error:', error.message);
                    toast({
                        title: "Error saving changes",
                        description: error.message,
                        variant: "destructive",
                    });
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
