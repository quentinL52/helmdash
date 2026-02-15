'use client';

/**
 * Loading skeleton components for lazy-loaded modules.
 * Used as fallback in `next/dynamic` imports to provide instant visual feedback.
 */

export function PageSkeleton() {
    return (
        <div className="flex flex-col h-full space-y-6 p-8 pt-6 animate-pulse">
            {/* Title skeleton */}
            <div className="space-y-2">
                <div className="h-8 w-64 bg-[#282c3a] rounded-lg" />
                <div className="h-4 w-96 bg-[#282c3a]/60 rounded" />
            </div>
            {/* Content skeleton grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-32 bg-[#181a24] border border-[#282c3a] rounded-xl" />
                ))}
            </div>
            <div className="h-64 bg-[#181a24] border border-[#282c3a] rounded-xl" />
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="h-32 bg-[#181a24] border border-[#282c3a] rounded-xl animate-pulse" />
    );
}

export function TableSkeleton() {
    return (
        <div className="rounded-xl border border-[#282c3a] bg-[#181a24]/50 overflow-hidden animate-pulse">
            <div className="h-10 bg-[#181a24] border-b border-[#282c3a]" />
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 border-b border-[#282c3a] flex items-center px-4 gap-4">
                    <div className="h-4 w-32 bg-[#282c3a] rounded" />
                    <div className="h-4 w-24 bg-[#282c3a]/60 rounded" />
                    <div className="h-4 w-16 bg-[#282c3a]/40 rounded ml-auto" />
                </div>
            ))}
        </div>
    );
}

export function BoardSkeleton() {
    return (
        <div className="flex gap-4 h-full animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex-1 min-w-[280px] space-y-3">
                    <div className="h-10 bg-[#181a24] border border-[#282c3a] rounded-lg" />
                    {Array.from({ length: 3 - i }).map((_, j) => (
                        <div key={j} className="h-24 bg-[#181a24] border border-[#282c3a] rounded-xl" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="col-span-full h-80 bg-[#181a24] border border-[#282c3a] rounded-xl animate-pulse flex items-end p-6 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    className="flex-1 bg-[#282c3a] rounded-t"
                    style={{ height: `${20 + Math.random() * 60}%` }}
                />
            ))}
        </div>
    );
}
