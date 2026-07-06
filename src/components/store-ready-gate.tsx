'use client';

import { useEffect, useState } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { PageSkeleton } from '@/components/ui/loading-skeleton';

/**
 * StoreReadyGate — prevents rendering children until zustand has rehydrated from localStorage.
 * Without this, pages flash empty content while the persist middleware loads the store state.
 */
export function StoreReadyGate({ children }: { children: React.ReactNode }) {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const hydrateFromApi = async () => {
            try {
                const [financesRes, canvasRes, hypothesesRes, roadmapRes] = await Promise.all([
                    fetch('/api/data/finances'),
                    fetch('/api/data/canvas'),
                    fetch('/api/data/hypotheses'),
                    fetch('/api/data/roadmap')
                ]);

                if (financesRes.ok) {
                    const data = await financesRes.json();
                    useFounderStore.getState().hydrateFinances(data);
                }
                
                if (canvasRes.ok) {
                    const data = await canvasRes.json();
                    if (data.canvasData) {
                        useFounderStore.getState().hydrate({ leanCanvas: { ...useFounderStore.getState().leanCanvas, ...data.canvasData } });
                    }
                }

                if (hypothesesRes.ok) {
                    const data = await hypothesesRes.json();
                    if (data.hypotheses) {
                        useFounderStore.getState().hydrate({ hypotheses: data.hypotheses });
                    }
                }

                if (roadmapRes.ok) {
                    const data = await roadmapRes.json();
                    if (data.roadmap) {
                        useFounderStore.getState().hydrate({ roadmap: data.roadmap });
                    }
                }
            } catch (e) {
                console.error('Failed to hydrate store from API', e);
            }
        };

        const onHydrated = () => {
            setIsHydrated(true);
            hydrateFromApi();
        };

        // Check if store is already hydrated (fast path)
        const state = useFounderStore.persist.getOptions();
        if (state) {
            // Subscribe to the rehydration event
            const unsub = useFounderStore.persist.onFinishHydration(onHydrated);

            // If already rehydrated (e.g., navigating between pages), mark immediately
            if (useFounderStore.persist.hasHydrated()) {
                onHydrated();
            }

            return unsub;
        }
    }, []);

    if (!isHydrated) {
        return <PageSkeleton />;
    }

    return <>{children}</>;
}
