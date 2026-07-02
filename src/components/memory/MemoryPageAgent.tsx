'use client';

import { PageAgent } from '@/components/agent/PageAgent';

/**
 * Wrapper client pour intégrer PageAgent dans une page serveur.
 */
export function MemoryPageAgent({ userId, pageLabel }: { userId: string; pageLabel: string }) {
  return <PageAgent userId={userId} pageLabel={pageLabel} />;
}