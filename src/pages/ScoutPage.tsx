import { useState, useEffect, memo, useMemo } from "react";
import LeagueHeader from "@/components/LeagueHeader";
import PageTransition from "@/components/PageTransition";
import { Search, TrendingUp, TrendingDown, ExternalLink, RefreshCw, AlertCircle, SlidersHorizontal, ArrowUpDown, ChevronDown } from "lucide-react";
import { useStockQuotes, useSymbolSearch, type FormattedQuote } from "@/hooks/useFinnhub";

const WATCHED_SYMBOLS = [
  "AAPL", "NVDA", "MSFT", "AMZN", "TSLA", "GOOGL", "META", "COIN", "SOFI", "PFE", "XOM", "JPM",
];

type SortOption = "default" | "top-gainers" | "top-losers" | "price-high" | "price-low";
type FilterOption = "all" | "gainers" | "losers";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "top-gainers", label: "Top Gainers" },
  { value: "top-losers", label: "Biggest Losers" },
  { value: "price-high", label: "Price: High → Low" },
  { value: "price-low", label: "Price: Low → High" },
];

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "gainers", label: "Gainers" },
  { value: "losers", label: "Losers" },
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

const DropdownSelect = ({ value, options, onChange, icon: Icon }: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  icon: typeof ArrowUpDown;
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground"
      >
        <Icon className="h-3 w-3 text-muted-foreground" />
        {selected?.label}
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-card shadow-lg">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`block w-full px-3 py-2 text-left text-[11px] hover:bg-secondary ${
                o.value === value ? "font-bold text-primary" : "text-foreground"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ScoutPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [symbols, setSymbols] = useState(WATCHED_SYMBOLS);
  const [sort, setSort] = useState<SortOption>("default");
  const [filter, setFilter] = useState<FilterOption>("all");
  const { quotes, loading, error, refetch } = useStockQuotes(symbols);
  const { results: searchResults, search, loading: searchLoading } = useSymbolSearch();

  useEffect(() => {
    const timeout = setTimeout(() => search(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput, search]);

  const processedQuotes = useMemo(() => {
    let result = [...quotes];

    // Search filter
    if (searchInput) {
      result = result.filter((q) => q.symbol.toLowerCase().includes(searchInput.toLowerCase()));
    }

    // Gainers / Losers filter
    if (filter === "gainers") result = result.filter((q) => q.changePct > 0);
    if (filter === "losers") result = result.filter((q) => q.changePct < 0);

    // Sort
    switch (sort) {
      case "top-gainers": result.sort((a, b) => b.changePct - a.changePct); break;
      case "top-losers": result.sort((a, b) => a.changePct - b.changePct); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "price-low": result.sort((a, b) => a.price - b.price); break;
    }

    return result;
  }, [quotes, searchInput, sort, filter]);

  const addSymbol = (sym: string) => {
    if (!symbols.includes(sym)) setSymbols((prev) => [...prev, sym]);
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
              <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-card p-2 shadow-lg">
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

          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1.5">
              {filterOptions.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as FilterOption)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    filter === f.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <DropdownSelect
              value={sort}
              options={sortOptions}
              onChange={(v) => setSort(v as SortOption)}
              icon={ArrowUpDown}
            />
            {(filter !== "all" || sort !== "default") && (
              <button
                onClick={() => { setFilter("all"); setSort("default"); }}
                className="text-[10px] font-semibold text-primary"
              >
                Clear
              </button>
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
              {processedQuotes.map((quote) => (
                <QuoteCard key={quote.symbol} quote={quote} />
              ))}
              {processedQuotes.length === 0 && (
                <div className="py-12 text-center">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No stocks match your filters</p>
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
