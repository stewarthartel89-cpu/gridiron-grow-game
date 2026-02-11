import { memo } from "react";
import { Shield, Info } from "lucide-react";
import {
  type DiversificationResult,
  type BucketAllocation,
  BUCKETS,
} from "@/lib/diversificationModifier";

const BUCKET_COLORS: Record<string, string> = {
  "US Stocks": "bg-[hsl(200,70%,50%)]",
  "Intl Stocks": "bg-[hsl(170,60%,45%)]",
  "US Bonds": "bg-[hsl(35,90%,55%)]",
  "Intl Bonds": "bg-[hsl(280,60%,55%)]",
};

const modifierColor = (m: number) =>
  m >= 1 ? "text-gain" : m >= 0.9 ? "text-warning" : "text-loss";
const modifierBg = (m: number) =>
  m >= 1 ? "bg-gain" : m >= 0.9 ? "bg-warning" : "bg-loss";

interface Props {
  result: DiversificationResult;
  compact?: boolean;
}

const DiversificationModifier = memo(({ result, compact = false }: Props) => {
  const { allocations, worstDeviation, worstBucket, modifier } = result;
  const color = modifierColor(modifier);
  const bg = modifierBg(modifier);
  const label =
    modifier >= 1 ? "NO ADJUSTMENT" : modifier >= 0.9 ? "MINOR ADJUSTMENT" : "SIGNIFICANT ADJUSTMENT";

  return (
    <div className="space-y-3">
      {/* Modifier Score */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className={`h-4 w-4 ${color}`} />
            <h3 className="font-display text-sm font-bold text-foreground">DIVERSIFICATION MODIFIER</h3>
          </div>
          <span className={`text-[10px] font-bold ${color}`}>{label}</span>
        </div>

        <div className="flex items-end gap-3 mb-2">
          <span className={`font-display text-4xl font-bold ${color}`}>{modifier.toFixed(2)}x</span>
          <span className="text-sm text-muted-foreground mb-1">weekly score multiplier</span>
        </div>

        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full ${bg} transition-all`}
            style={{ width: `${modifier * 100}%` }}
          />
        </div>

        {modifier < 1 && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/60 p-2.5">
            <Info className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <p className="text-[11px] text-muted-foreground">
              Your <strong>{worstBucket}</strong> allocation deviates{" "}
              <strong>{worstDeviation.toFixed(1)}%</strong> from the target. Rebalancing toward the
              ideal allocation will improve your modifier.
            </p>
          </div>
        )}

        {modifier >= 1 && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-gain/10 p-2.5">
            <Shield className="h-4 w-4 shrink-0 text-gain mt-0.5" />
            <p className="text-[11px] text-gain">
              Your portfolio is well-diversified. No adjustment applied to your weekly score.
            </p>
          </div>
        )}
      </div>

      {/* Allocation Breakdown */}
      {!compact && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm font-bold text-foreground">ALLOCATION vs TARGET</h3>
            <span className="text-[10px] text-muted-foreground">Worst deviation: {worstDeviation.toFixed(1)}%</span>
          </div>
          <div className="space-y-3">
            {allocations.map((a) => (
              <AllocationRow key={a.bucket} data={a} isWorst={a.bucket === worstBucket && modifier < 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
DiversificationModifier.displayName = "DiversificationModifier";

const AllocationRow = memo(({ data, isWorst }: { data: BucketAllocation; isWorst: boolean }) => {
  const { bucket, actual, target, deviation } = data;
  const isOver = actual > target;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${BUCKET_COLORS[bucket]}`} />
          <span className={`text-[11px] ${isWorst ? "font-bold text-warning" : "text-muted-foreground"}`}>
            {bucket}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{target}% target</span>
          <span className={`text-[11px] font-bold ${isWorst ? "text-warning" : "text-foreground"}`}>
            {actual.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full ${isWorst ? "bg-warning" : BUCKET_COLORS[bucket]}`}
          style={{ width: `${Math.min(actual, 100)}%` }}
        />
        {/* Target marker */}
        <div
          className="absolute top-0 h-full w-px bg-foreground/40"
          style={{ left: `${target}%` }}
        />
      </div>
    </div>
  );
});
AllocationRow.displayName = "AllocationRow";

export default DiversificationModifier;
