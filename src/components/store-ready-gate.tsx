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
                const res = await fetch('/api/data/finances');
                if (res.ok) {
                    const data = await res.json();
                    useFounderStore.getState().hydrateFinances(data);
                }
            } catch (e) {
                console.error('Failed to hydrate finances from API', e);
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
