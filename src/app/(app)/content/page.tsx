'use client';

import dynamic from 'next/dynamic';
import { BoardSkeleton } from '@/components/ui/loading-skeleton';

const ContentBoard = dynamic(
    () => import('@/components/content/content-board').then(m => m.ContentBoard),
    { loading: () => <BoardSkeleton /> }
);

export default function ContentPage() {
    return (
        <div className="flex flex-col h-full space-y-4 p-8 pt-6 font-sans text-foreground">
            <div className="flex-1 min-h-0 mt-0">
                <ContentBoard />
            </div>
        </div>
    );
}
