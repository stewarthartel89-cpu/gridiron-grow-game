import { useState, memo, useEffect } from "react";
import LeagueHeader from "@/components/LeagueHeader";
import PageTransition from "@/components/PageTransition";
import { Search, TrendingUp, TrendingDown, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { useStockQuotes, useSymbolSearch, type FormattedQuote } from "@/hooks/useFinnhub";

const WATCHED_SYMBOLS = [
  "AAPL", "NVDA", "MSFT", "AMZN", "TSLA", "GOOGL", "META", "COIN", "SOFI", "PFE", "XOM", "JPM",
];

const QuoteCard = memo(({ quote }: { quote: FormattedQuote }) => {
  const isUp = quote.changePct >= 0;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary font-display text-[11px] font-bold text-secondary-foreground">
            {quote.symbol}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{quote.symbol}</p>
            <p className="text-[11px] text-muted-foreground">
              O: ${quote.open.toFixed(2)} · H: ${quote.high.toFixed(2)} · L: ${quote.low.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">${quote.price.toFixed(2)}</p>
          <div className={`flex items-center justify-end gap-0.5 text-[11px] font-semibold ${isUp ? "text-gain" : "text-loss"}`}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isUp ? "+" : ""}{quote.changePct.toFixed(2)}%
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Prev Close: ${quote.prevClose.toFixed(2)}</span>
        <a
          href={`https://robinhood.com/stocks/${quote.symbol}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-lg bg-gain/10 px-2.5 py-1 text-[10px] font-semibold text-gain"
        >
          <ExternalLink className="h-3 w-3" />
          View on Robinhood
        </a>
      </div>
    </div>
  );
});
QuoteCard.displayName = "QuoteCard";

const ScoutPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [symbols, setSymbols] = useState(WATCHED_SYMBOLS);
  const { quotes, loading, error, refetch } = useStockQuotes(symbols);
  const { results: searchResults, search, loading: searchLoading } = useSymbolSearch();

  useEffect(() => {
    const timeout = setTimeout(() => search(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput, search]);

  const filteredQuotes = searchInput
    ? quotes.filter((q) => q.symbol.toLowerCase().includes(searchInput.toLowerCase()))
    : quotes;

  const addSymbol = (sym: string) => {
    if (!symbols.includes(sym)) {
      setSymbols((prev) => [...prev, sym]);
    }
    setSearchInput("");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <LeagueHeader />
        <main className="mx-auto max-w-2xl px-4 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Scout
            </h2>
            <button onClick={refetch} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary">
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Updating..." : "Refresh"}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search stocks by symbol..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            {searchInput && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-border bg-card p-2 shadow-lg">
                {searchResults.map((r) => (
                  <button
                    key={r.symbol}
                    onClick={() => addSymbol(r.symbol)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary"
                  >
                    <span className="font-bold text-foreground">{r.symbol}</span>
                    <span className="text-[11px] text-muted-foreground truncate ml-2">{r.description}</span>
                  </button>
                ))}
                {searchLoading && <p className="px-3 py-2 text-[11px] text-muted-foreground">Searching...</p>}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-loss/30 bg-loss/10 p-3 text-[11px] text-loss">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Quotes */}
          {loading && quotes.length === 0 ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-secondary" />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredQuotes.map((quote) => (
                <QuoteCard key={quote.symbol} quote={quote} />
              ))}
              {filteredQuotes.length === 0 && (
                <div className="py-12 text-center">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No stocks match your search</p>
                </div>
              )}
            </div>
          )}

          <p className="text-center text-[9px] text-muted-foreground py-4">
            Live data from Finnhub. For informational purposes only. Not financial advice. All trades executed on Robinhood.
          </p>
        </main>
      </div>
    </PageTransition>
  );
};

export default ScoutPage;
