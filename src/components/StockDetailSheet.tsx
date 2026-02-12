import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { TrendingUp, TrendingDown, ExternalLink, Loader2, Newspaper, Building2, Globe, DollarSign } from "lucide-react";
import { useCompanyNews, useStockCandles, useCompanyProfile, type FormattedQuote, type FormattedArticle } from "@/hooks/useFinnhub";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface Props {
  quote: FormattedQuote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TIME_PERIODS = [
  { label: "1D", days: 1, resolution: "D" },
  { label: "1W", days: 7, resolution: "D" },
  { label: "1M", days: 30, resolution: "D" },
  { label: "3M", days: 90, resolution: "D" },
  { label: "1Y", days: 365, resolution: "D" },
  { label: "5Y", days: 1825, resolution: "W" },
] as const;

function calcChange(closes: number[]) {
  if (closes.length < 2) return { change: 0, pct: 0 };
  const first = closes[0];
  const last = closes[closes.length - 1];
  return { change: last - first, pct: first > 0 ? ((last - first) / first) * 100 : 0 };
}

function formatMarketCap(cap: number) {
  if (cap >= 1000) return `$${(cap / 1000).toFixed(1)}T`;
  if (cap >= 1) return `$${cap.toFixed(1)}B`;
  return `$${(cap * 1000).toFixed(0)}M`;
}

const NewsItem = ({ article }: { article: FormattedArticle }) => (
  <a
    href={article.url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex gap-3 rounded-lg border border-border bg-card p-3 hover:bg-accent transition-colors"
  >
    {article.imageUrl && (
      <img src={article.imageUrl} alt="" className="h-14 w-14 rounded-md object-cover shrink-0" />
    )}
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold text-foreground line-clamp-2">{article.headline}</p>
      <p className="text-[10px] text-muted-foreground mt-1">
        {article.source} · {format(article.publishedAt, "MMM d")}
      </p>
    </div>
  </a>
);

const StockDetailSheet = ({ quote, open, onOpenChange }: Props) => {
  const symbol = quote?.symbol ?? null;
  const [periodIdx, setPeriodIdx] = useState(0); // default 1D
  const period = TIME_PERIODS[periodIdx];

  // For 1D, fetch 5 days of daily data so we always have at least today + yesterday
  const fetchDays = period.days <= 1 ? 5 : period.days;
  const { candle, loading: candleLoading } = useStockCandles(symbol, period.resolution, fetchDays);
  const { articles, loading: newsLoading } = useCompanyNews(symbol);
  const { profile, loading: profileLoading } = useCompanyProfile(symbol);

  const { periodChange, chartData } = useMemo(() => {
    // For 1D view, use quote's own daily change (matches Robinhood exactly)
    if (period.days <= 1) {
      if (!quote) return { periodChange: null, chartData: [] };
      const change = { change: quote.change, pct: quote.changePct };
      // Build a simple 2-point chart from prevClose to current
      const chart = [
        { date: "Prev Close", price: quote.prevClose },
        { date: "Current", price: quote.price },
      ];
      // If we have candle data for today, use that instead for a richer chart
      if (candle && candle.closes.length > 0) {
        // Get only the last trading day's data points
        const lastTimestamp = candle.timestamps[candle.timestamps.length - 1];
        const dayStart = lastTimestamp - 86400;
        const todayData = candle.timestamps
          .map((t, i) => ({ t, price: candle.closes[i] }))
          .filter(d => d.t >= dayStart);
        if (todayData.length > 1) {
          return {
            periodChange: change,
            chartData: todayData.map(d => ({
              date: format(new Date(d.t * 1000), "MMM d"),
              price: d.price,
            })),
          };
        }
      }
      return { periodChange: change, chartData: chart };
    }

    if (!candle || candle.closes.length === 0) return { periodChange: null, chartData: [] };

    const closes = candle.closes;
    const change = calcChange(closes);

    const fmt = period.days <= 30 ? "MMM d" : "MMM yyyy";
    const chart = candle.timestamps.map((t, i) => ({
      date: format(new Date(t * 1000), fmt),
      price: closes[i],
    }));

    return { periodChange: change, chartData: chart };
  }, [candle, period.days, quote]);

  if (!quote) return null;

  const isUp = periodChange ? periodChange.pct >= 0 : quote.changePct >= 0;
  const accentColor = isUp ? "hsl(var(--gain))" : "hsl(var(--loss))";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl bg-background border-border p-0">
        <div className="px-5 pt-5 pb-2">
          <SheetHeader className="pb-0">
            <SheetDescription className="sr-only">Stock details and chart</SheetDescription>
            <SheetTitle asChild>
              <div className="flex items-center gap-3">
                {profile?.logo ? (
                  <img src={profile.logo} alt={profile.name} className="h-10 w-10 rounded-full object-cover bg-secondary" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-display text-[11px] font-bold text-secondary-foreground">
                    {quote.symbol}
                  </div>
                )}
                <div>
                  <p className="text-lg font-bold text-foreground">{profile?.name || quote.symbol}</p>
                  <p className="text-xs text-muted-foreground">{quote.symbol}{profile?.exchange ? ` · ${profile.exchange}` : ""}</p>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>

          {/* Price + Change */}
          <div className="mt-3">
            <p className="text-3xl font-bold text-foreground">${quote.price.toFixed(2)}</p>
            <div className={`flex items-center gap-1.5 mt-0.5 ${isUp ? "text-gain" : "text-loss"}`}>
              {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="text-sm font-semibold">
                {periodChange
                  ? `${isUp ? "+" : ""}$${periodChange.change.toFixed(2)} (${isUp ? "+" : ""}${periodChange.pct.toFixed(2)}%)`
                  : `${isUp ? "+" : ""}${quote.changePct.toFixed(2)}%`}
              </span>
              <span className="text-xs text-muted-foreground ml-1">{period.label}</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="px-2 mt-2">
          {candleLoading ? (
            <div className="flex h-44 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accentColor} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={Math.floor(chartData.length / 4)} />
                  <YAxis domain={["auto", "auto"]} tick={false} axisLine={false} width={0} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                  />
                  <Area type="monotone" dataKey="price" stroke={accentColor} strokeWidth={2} fill="url(#chartGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground py-10">No chart data available</p>
          )}
        </div>

        {/* Time Period Tabs */}
        <div className="flex justify-center gap-1 px-5 mt-1">
          {TIME_PERIODS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPeriodIdx(i)}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors ${
                i === periodIdx
                  ? isUp ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="px-5 pb-6 space-y-4 mt-4">
          {/* About Section */}
          {(profile || profileLoading) && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-2">About</h3>
              {profileLoading ? (
                <div className="space-y-2">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-secondary" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
                </div>
              ) : profile ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {profile.name} is a {profile.finnhubIndustry?.toLowerCase() || "publicly traded"} company
                    {profile.country ? ` based in ${profile.country}` : ""}.
                    {profile.ipo ? ` IPO date: ${profile.ipo}.` : ""}
                    {profile.currency ? ` Trades in ${profile.currency}.` : ""}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-[9px] text-muted-foreground">Industry</p>
                        <p className="text-[11px] font-semibold text-foreground">{profile.finnhubIndustry || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-[9px] text-muted-foreground">Market Cap</p>
                        <p className="text-[11px] font-semibold text-foreground">{profile.marketCapitalization ? formatMarketCap(profile.marketCapitalization) : "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-[9px] text-muted-foreground">Country</p>
                        <p className="text-[11px] font-semibold text-foreground">{profile.country || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-[9px] text-muted-foreground">Exchange</p>
                        <p className="text-[11px] font-semibold text-foreground">{profile.exchange || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Key Stats */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">Key Statistics</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-border bg-card p-4">
              {[
                { label: "Open", value: `$${quote.open.toFixed(2)}` },
                { label: "Previous Close", value: `$${quote.prevClose.toFixed(2)}` },
                { label: "Day High", value: `$${quote.high.toFixed(2)}` },
                { label: "Day Low", value: `$${quote.low.toFixed(2)}` },
              ].map((stat) => (
                <div key={stat.label} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-[11px] text-muted-foreground">{stat.label}</span>
                  <span className="text-[11px] font-semibold text-foreground">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Robinhood Link */}
          <a
            href={`https://robinhood.com/stocks/${quote.symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gain py-3 text-sm font-bold text-gain-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            Trade on Robinhood
          </a>

          {/* News */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
              <Newspaper className="h-4 w-4 text-primary" />
              News
            </h3>
            {newsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : articles.length > 0 ? (
              <div className="space-y-2">
                {articles.map((a) => (
                  <NewsItem key={a.id} article={a} />
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-4">No recent news for {quote.symbol}</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StockDetailSheet;
