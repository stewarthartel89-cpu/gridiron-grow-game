import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TrendingUp, TrendingDown, ExternalLink, Loader2, Newspaper } from "lucide-react";
import { useCompanyNews, useStockCandles, type FormattedQuote, type FormattedArticle } from "@/hooks/useFinnhub";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface Props {
  quote: FormattedQuote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function calcChange(closes: number[]) {
  if (closes.length < 2) return { change: 0, pct: 0 };
  const first = closes[0];
  const last = closes[closes.length - 1];
  return { change: last - first, pct: first > 0 ? ((last - first) / first) * 100 : 0 };
}

const PeriodStat = ({ label, change, pct }: { label: string; change: number; pct: number }) => {
  const isUp = pct >= 0;
  return (
    <div className="rounded-lg border border-border bg-secondary/50 p-3 text-center">
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      <div className={`flex items-center justify-center gap-1 text-sm font-bold ${isUp ? "text-gain" : "text-loss"}`}>
        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isUp ? "+" : ""}{pct.toFixed(2)}%
      </div>
      <p className={`text-[10px] ${isUp ? "text-gain/70" : "text-loss/70"}`}>
        {isUp ? "+" : ""}${change.toFixed(2)}
      </p>
    </div>
  );
};

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
  const { candle, loading: candleLoading } = useStockCandles(symbol, "D", 365);
  const { articles, loading: newsLoading } = useCompanyNews(symbol);

  const { daily, weekly, yearly, chartData } = useMemo(() => {
    if (!candle || candle.closes.length === 0) return { daily: null, weekly: null, yearly: null, chartData: [] };

    const closes = candle.closes;
    const len = closes.length;

    const dailyData = len >= 2 ? calcChange(closes.slice(-2)) : { change: 0, pct: 0 };
    const weeklyData = len >= 5 ? calcChange(closes.slice(-5)) : calcChange(closes);
    const yearlyData = calcChange(closes);

    const chart = candle.timestamps.map((t, i) => ({
      date: format(new Date(t * 1000), "MMM d"),
      price: closes[i],
    }));

    return { daily: dailyData, weekly: weeklyData, yearly: yearlyData, chartData: chart };
  }, [candle]);

  if (!quote) return null;

  const isUp = quote.changePct >= 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background border-border">
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary font-display text-[11px] font-bold text-secondary-foreground">
                {quote.symbol}
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{quote.symbol}</p>
                <p className="text-sm text-muted-foreground">${quote.price.toFixed(2)}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold ${isUp ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"}`}>
              {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isUp ? "+" : ""}{quote.changePct.toFixed(2)}%
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pt-2">
          {/* Chart */}
          {candleLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={Math.floor(chartData.length / 5)} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={45} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  />
                  <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground py-8">No chart data available</p>
          )}

          {/* Period Stats */}
          {daily && weekly && yearly && (
            <div className="grid grid-cols-3 gap-2">
              <PeriodStat label="Daily" change={daily.change} pct={daily.pct} />
              <PeriodStat label="Weekly" change={weekly.change} pct={weekly.pct} />
              <PeriodStat label="Yearly" change={yearly.change} pct={yearly.pct} />
            </div>
          )}

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border border-border bg-card p-3">
            <div className="flex justify-between py-1">
              <span className="text-[10px] text-muted-foreground">Open</span>
              <span className="text-[10px] font-semibold text-foreground">${quote.open.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[10px] text-muted-foreground">Prev Close</span>
              <span className="text-[10px] font-semibold text-foreground">${quote.prevClose.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[10px] text-muted-foreground">High</span>
              <span className="text-[10px] font-semibold text-foreground">${quote.high.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[10px] text-muted-foreground">Low</span>
              <span className="text-[10px] font-semibold text-foreground">${quote.low.toFixed(2)}</span>
            </div>
          </div>

          {/* Robinhood Link */}
          <a
            href={`https://robinhood.com/stocks/${quote.symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gain/10 py-3 text-sm font-semibold text-gain"
          >
            <ExternalLink className="h-4 w-4" />
            View on Robinhood
          </a>

          {/* News */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
              <Newspaper className="h-4 w-4 text-primary" />
              Latest News
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
