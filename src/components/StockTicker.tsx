import { memo, useState } from "react";
import { useStockQuotes, type FormattedQuote } from "@/hooks/useFinnhub";
import { TrendingUp, TrendingDown } from "lucide-react";
import StockDetailSheet from "@/components/StockDetailSheet";

const TICKER_SYMBOLS = [
  "AAPL", "NVDA", "MSFT", "GOOGL", "META", "AMZN", "TSLA", "JPM", "XOM", "PFE",
  "COIN", "SOFI", "BND", "AGG", "TLT", "VXUS",
];

const TickerItem = memo(({ quote, onClick }: { quote: FormattedQuote; onClick: () => void }) => {
  const isUp = quote.changePct >= 0;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 hover:bg-accent/50 rounded-md transition-colors"
    >
      <span className="text-xs font-bold text-foreground">{quote.symbol}</span>
      <span className="text-[11px] font-semibold text-foreground">${quote.price.toFixed(2)}</span>
      <span className={`flex items-center gap-0.5 text-[10px] font-bold ${isUp ? "text-gain" : "text-loss"}`}>
        {isUp ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
        {isUp ? "+" : ""}{quote.changePct.toFixed(2)}%
      </span>
    </button>
  );
});
TickerItem.displayName = "TickerItem";

const StockTicker = () => {
  const { quotes, loading } = useStockQuotes(TICKER_SYMBOLS);
  const [selectedQuote, setSelectedQuote] = useState<FormattedQuote | null>(null);

  if (loading && quotes.length === 0) {
    return (
      <div className="h-10 bg-card border-b border-border flex items-center">
        <div className="flex gap-4 px-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-20 animate-pulse rounded bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  // Duplicate quotes for seamless marquee
  const doubled = [...quotes, ...quotes];

  return (
    <>
      <div className="bg-card border-b border-border overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-1">
          {doubled.map((q, i) => (
            <TickerItem key={`${q.symbol}-${i}`} quote={q} onClick={() => setSelectedQuote(q)} />
          ))}
        </div>
      </div>
      <StockDetailSheet
        quote={selectedQuote}
        open={!!selectedQuote}
        onOpenChange={(open) => { if (!open) setSelectedQuote(null); }}
      />
    </>
  );
};

export default StockTicker;
