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
        // Check if store is already hydrated (fast path)
        const state = useFounderStore.persist.getOptions();
        if (state) {
            // Subscribe to the rehydration event
            const unsub = useFounderStore.persist.onFinishHydration(() => {
                setIsHydrated(true);
            });

            // If already rehydrated (e.g., navigating between pages), mark immediately
            if (useFounderStore.persist.hasHydrated()) {
                setIsHydrated(true);
            }

            return unsub;
        }
    }, []);

    if (!isHydrated) {
        return <PageSkeleton />;
    }

    return <>{children}</>;
}
