'use client';

import { useEffect, useRef } from 'react';
import { useGamification } from '@/hooks/use-gamification';
import { useGamificationStore } from '@/store/gamification-store';

export function GamificationBootstrapper() {
    const { awardXP, recordActivity } = useGamification();
    const hasBootstrapped = useRef(false);

    useEffect(() => {
        if (hasBootstrapped.current) return;

        const bootstrap = () => {
            if (hasBootstrapped.current) return;
            hasBootstrapped.current = true;
            awardXP('daily_login');
            recordActivity();
        };

        if (useGamificationStore.persist.hasHydrated()) {
            bootstrap();
        } else {
            const unsub = useGamificationStore.persist.onFinishHydration(() => {
                bootstrap();
            });
            return () => unsub();
        }
    }, [awardXP, recordActivity]);

    return null;
}
