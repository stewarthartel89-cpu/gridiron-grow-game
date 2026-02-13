/**
 * Diversification Modifier System
 *
 * Compares a user's portfolio Stock vs ETF allocation against a tier-based target.
 * Applies a negative-only multiplier to weekly matchup scores.
 *
 * Tiers:
 *   Cautious:    50% Stocks / 50% ETFs
 *   Moderate:    65% Stocks / 35% ETFs
 *   Aggressive:  80% Stocks / 20% ETFs
 */

export type AssetBucket = "Stocks" | "ETFs";

export type DiversificationTier = "cautious" | "moderate" | "aggressive";

export const TIER_LABELS: Record<DiversificationTier, string> = {
  cautious: "Cautious",
  moderate: "Moderate",
  aggressive: "Aggressive",
};

export const TIER_ALLOCATIONS: Record<DiversificationTier, Record<AssetBucket, number>> = {
  cautious: { Stocks: 50, ETFs: 50 },
  moderate: { Stocks: 65, ETFs: 35 },
  aggressive: { Stocks: 80, ETFs: 20 },
};

export const BUCKETS: AssetBucket[] = ["Stocks", "ETFs"];

/**
 * Maps a sector string to Stocks or ETFs.
 * Holdings with ETF/Index-related sectors map to ETFs; everything else is Stocks.
 */
export function classifyHolding(sector: string): AssetBucket {
  const s = sector.toLowerCase();
  if (
    s === "etf" ||
    s === "index" ||
    s === "index/etf" ||
    s === "index_etf" ||
    s.includes("etf") ||
    s.includes("index fund")
  ) {
    return "ETFs";
  }
  return "Stocks";
}

export interface BucketAllocation {
  bucket: AssetBucket;
  actual: number; // percentage 0-100
  target: number; // percentage 0-100
  deviation: number; // absolute difference
}

export interface DiversificationResult {
  tier: DiversificationTier;
  allocations: BucketAllocation[];
  worstDeviation: number;
  worstBucket: AssetBucket;
  modifier: number; // 0.75 – 1.00
}

/**
 * Calculates the current allocation across Stock/ETF buckets
 * and compares against the given tier target.
 */
export function calculateDiversification(
  holdings: { sector: string; allocation: number; isActive?: boolean; is_active?: boolean }[],
  tier: DiversificationTier = "moderate"
): DiversificationResult {
  const target = TIER_ALLOCATIONS[tier];
  const active = holdings.filter(h => h.isActive ?? h.is_active ?? true);
  const totalAlloc = active.reduce((sum, h) => sum + h.allocation, 0);

  const raw: Record<AssetBucket, number> = { Stocks: 0, ETFs: 0 };
  for (const h of active) {
    raw[classifyHolding(h.sector)] += h.allocation;
  }

  const allocations: BucketAllocation[] = BUCKETS.map(bucket => {
    const actual = totalAlloc > 0 ? (raw[bucket] / totalAlloc) * 100 : 0;
    const t = target[bucket];
    return {
      bucket,
      actual: Math.round(actual * 10) / 10,
      target: t,
      deviation: Math.round(Math.abs(actual - t) * 10) / 10,
    };
  });

  let worst = allocations[0];
  for (const a of allocations) {
    if (a.deviation > worst.deviation) worst = a;
  }

  return {
    tier,
    allocations,
    worstDeviation: worst.deviation,
    worstBucket: worst.bucket,
    modifier: deviationToModifier(worst.deviation),
  };
}

/**
 * Converts the largest bucket deviation to a score multiplier.
 * 0–5%  → 1.00
 * 5–10% → 0.95
 * 10–15% → 0.90
 * 15–20% → 0.85
 * 20–25% → 0.80
 * 25%+  → 0.75 (cap)
 */
export function deviationToModifier(deviation: number): number {
  if (deviation <= 5) return 1.0;
  if (deviation <= 10) return 0.95;
  if (deviation <= 15) return 0.9;
  if (deviation <= 20) return 0.85;
  if (deviation <= 25) return 0.8;
  return 0.75;
}
