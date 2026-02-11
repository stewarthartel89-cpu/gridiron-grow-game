/**
 * Diversification Modifier System
 *
 * Compares a user's portfolio allocation against the ideal target allocation
 * and applies a negative-only multiplier to weekly matchup scores.
 *
 * Target: 45% US Stocks, 25% Intl Stocks, 20% US Bonds, 10% Intl Bonds
 */

export type AssetBucket = "US Stocks" | "Intl Stocks" | "US Bonds" | "Intl Bonds";

export const TARGET_ALLOCATION: Record<AssetBucket, number> = {
  "US Stocks": 45,
  "Intl Stocks": 25,
  "US Bonds": 20,
  "Intl Bonds": 10,
};

export const BUCKETS: AssetBucket[] = ["US Stocks", "Intl Stocks", "US Bonds", "Intl Bonds"];

/**
 * Maps a sector string to one of the 4 asset buckets.
 * Holdings with bond-related sectors map to bond buckets;
 * "International" maps to Intl Stocks; everything else is US Stocks.
 */
export function classifyHolding(sector: string): AssetBucket {
  const s = sector.toLowerCase();
  if (s === "international" || s === "intl stock" || s === "intl_stock") return "Intl Stocks";
  if (s === "intl bond" || s === "intl_bond" || s === "international bonds") return "Intl Bonds";
  if (s === "us bond" || s === "us_bond" || s === "bonds" || s === "bond") return "US Bonds";
  // Everything else (Tech, Healthcare, Energy, Financials, Consumer, Index/ETF, Real Estate, Crypto, Industrials)
  return "US Stocks";
}

export interface BucketAllocation {
  bucket: AssetBucket;
  actual: number; // percentage 0-100
  target: number; // percentage 0-100
  deviation: number; // absolute difference
}

export interface DiversificationResult {
  allocations: BucketAllocation[];
  worstDeviation: number;
  worstBucket: AssetBucket;
  modifier: number; // 0.75 – 1.00
}

/**
 * Calculates the current allocation across the 4 buckets
 * from a list of holdings with { sector, allocation, is_active/isActive } fields.
 */
export function calculateDiversification(
  holdings: { sector: string; allocation: number; isActive?: boolean; is_active?: boolean }[]
): DiversificationResult {
  const active = holdings.filter(h => h.isActive ?? h.is_active ?? true);
  const totalAlloc = active.reduce((sum, h) => sum + h.allocation, 0);

  // Compute raw bucket totals
  const raw: Record<AssetBucket, number> = { "US Stocks": 0, "Intl Stocks": 0, "US Bonds": 0, "Intl Bonds": 0 };
  for (const h of active) {
    raw[classifyHolding(h.sector)] += h.allocation;
  }

  // Normalise to percentages
  const allocations: BucketAllocation[] = BUCKETS.map(bucket => {
    const actual = totalAlloc > 0 ? (raw[bucket] / totalAlloc) * 100 : 0;
    const target = TARGET_ALLOCATION[bucket];
    return { bucket, actual: Math.round(actual * 10) / 10, target, deviation: Math.round(Math.abs(actual - target) * 10) / 10 };
  });

  // Worst bucket
  let worst = allocations[0];
  for (const a of allocations) {
    if (a.deviation > worst.deviation) worst = a;
  }

  return {
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
