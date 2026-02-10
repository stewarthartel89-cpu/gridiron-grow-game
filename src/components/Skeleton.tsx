import { memo } from "react";

export const CardSkeleton = memo(() => (
  <div className="animate-pulse rounded-xl border border-border bg-card p-4 space-y-3">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-secondary" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-secondary" />
        <div className="h-2 w-16 rounded bg-secondary" />
      </div>
      <div className="h-4 w-12 rounded bg-secondary" />
    </div>
    <div className="h-2 w-full rounded bg-secondary" />
    <div className="h-2 w-3/4 rounded bg-secondary" />
  </div>
));
CardSkeleton.displayName = "CardSkeleton";

export const MatchupSkeleton = memo(() => (
  <div className="animate-pulse rounded-xl border border-border bg-card p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-secondary" />
        <div className="space-y-1.5">
          <div className="h-3 w-20 rounded bg-secondary" />
          <div className="h-2 w-14 rounded bg-secondary" />
        </div>
      </div>
      <div className="h-5 w-8 rounded bg-secondary" />
      <div className="flex items-center gap-2">
        <div className="space-y-1.5 text-right">
          <div className="h-3 w-20 rounded bg-secondary" />
          <div className="h-2 w-14 rounded bg-secondary" />
        </div>
        <div className="h-8 w-8 rounded-full bg-secondary" />
      </div>
    </div>
  </div>
));
MatchupSkeleton.displayName = "MatchupSkeleton";

export const FeedSkeleton = memo(() => (
  <div className="space-y-2">
    {[1, 2, 3, 4].map(i => (
      <CardSkeleton key={i} />
    ))}
  </div>
));
FeedSkeleton.displayName = "FeedSkeleton";

export const StandingSkeleton = memo(() => (
  <div className="animate-pulse rounded-xl border border-border bg-card overflow-hidden">
    <div className="px-4 py-3">
      <div className="h-4 w-24 rounded bg-secondary" />
    </div>
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="flex items-center gap-3 border-t border-border/50 px-4 py-3">
        <div className="h-4 w-4 rounded bg-secondary" />
        <div className="h-7 w-7 rounded-full bg-secondary" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-28 rounded bg-secondary" />
          <div className="h-2 w-16 rounded bg-secondary" />
        </div>
        <div className="h-3 w-10 rounded bg-secondary" />
      </div>
    ))}
  </div>
));
StandingSkeleton.displayName = "StandingSkeleton";
