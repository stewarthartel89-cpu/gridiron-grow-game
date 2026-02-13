import { useState, useEffect, memo, useMemo } from "react";
import { Search, TrendingUp, TrendingDown, ExternalLink, RefreshCw, AlertCircle, SlidersHorizontal, ArrowUpDown, ChevronDown, Globe, Landmark, Binoculars } from "lucide-react";
import { useStockQuotes, useSymbolSearch, type FormattedQuote } from "@/hooks/useFinnhub";
import StockDetailSheet from "@/components/StockDetailSheet";

const STOCK_SECTORS: Record<string, string> = {
  AAPL: "Technology", NVDA: "Technology", MSFT: "Technology", GOOGL: "Technology", META: "Technology",
  AMZN: "Consumer", TSLA: "Consumer",
  COIN: "Crypto", SOFI: "Financials", JPM: "Financials",
  PFE: "Healthcare", XOM: "Energy",
  VXUS: "International", EFA: "International", VEA: "International", IEMG: "International", EEM: "International",
  BND: "Bonds", AGG: "Bonds", TLT: "Bonds", SHY: "Bonds", IEF: "Bonds", VCIT: "Bonds", LQD: "Bonds",
  BNDX: "Intl Bonds", IAGG: "Intl Bonds", EMB: "Intl Bonds", VWOB: "Intl Bonds",
};

const SYMBOL_REGION: Record<string, "US" | "International"> = {
  AAPL: "US", NVDA: "US", MSFT: "US", GOOGL: "US", META: "US",
  AMZN: "US", TSLA: "US", COIN: "US", SOFI: "US", JPM: "US",
  PFE: "US", XOM: "US",
  BND: "US", AGG: "US", TLT: "US", SHY: "US", IEF: "US", VCIT: "US", LQD: "US",
  VXUS: "International", EFA: "International", VEA: "International", IEMG: "International", EEM: "International",
  BNDX: "International", IAGG: "International", EMB: "International", VWOB: "International",
};

const SYMBOL_ASSET_TYPE: Record<string, "Stocks" | "ETFs"> = {
  AAPL: "Stocks", NVDA: "Stocks", MSFT: "Stocks", GOOGL: "Stocks", META: "Stocks",
  AMZN: "Stocks", TSLA: "Stocks", COIN: "Stocks", SOFI: "Stocks", JPM: "Stocks",
  PFE: "Stocks", XOM: "Stocks",
  VXUS: "ETFs", EFA: "ETFs", VEA: "ETFs", IEMG: "ETFs", EEM: "ETFs",
  BND: "ETFs", AGG: "ETFs", TLT: "ETFs", SHY: "ETFs", IEF: "ETFs", VCIT: "ETFs", LQD: "ETFs",
  BNDX: "ETFs", IAGG: "ETFs", EMB: "ETFs", VWOB: "ETFs",
};

const WATCHED_SYMBOLS = Object.keys(STOCK_SECTORS);
const SECTORS = ["All Sectors", "Technology", "Consumer", "Financials", "Energy", "Healthcare", "Crypto", "International", "Bonds", "Intl Bonds"];
const REGION_OPTIONS = [{ value: "All", label: "All Regions" }, { value: "US", label: "US" }, { value: "International", label: "International" }];
const ASSET_TYPE_OPTIONS = [{ value: "All", label: "Stocks & ETFs" }, { value: "Stocks", label: "Stocks" }, { value: "ETFs", label: "ETFs" }];

type SortOption = "weekly-growth" | "top-gainers" | "top-losers" | "price-high" | "price-low";
const sortOptions: { value: SortOption; label: string }[] = [
  { value: "weekly-growth", label: "Weekly Growth" },
  { value: "top-gainers", label: "Top Gainers (Today)" },
  { value: "top-losers", label: "Biggest Losers (Today)" },
  { value: "price-high", label: "Price: High → Low" },
  { value: "price-low", label: "Price: Low → High" },
];

const QuoteCard = memo(({ quote, onClick }: { quote: FormattedQuote; onClick: () => void }) => {
  const isUp = quote.changePct >= 0;
  return (
    <button onClick={onClick} className="w-full text-left rounded-xl border border-border bg-card p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary font-display text-[11px] font-bold text-secondary-foreground">{quote.symbol}</div>
          <div>
            <p className="text-sm font-bold text-foreground">{quote.symbol}</p>
            <p className="text-[11px] text-muted-foreground">O: ${quote.open.toFixed(2)} · H: ${quote.high.toFixed(2)} · L: ${quote.low.toFixed(2)}</p>
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
    </button>
  );
});
QuoteCard.displayName = "QuoteCard";

const DropdownSelect = ({ value, options, onChange, icon: Icon }: {
  value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; icon: typeof ArrowUpDown;
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground">
        <Icon className="h-3 w-3 text-muted-foreground" />
        {selected?.label}
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-card shadow-lg">
          {options.map((o) => (
            <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
              className={`block w-full px-3 py-2 text-left text-[11px] hover:bg-secondary ${o.value === value ? "font-bold text-primary" : "text-foreground"}`}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ScoutContent = () => {
  const [searchInput, setSearchInput] = useState("");
  const [symbols, setSymbols] = useState(WATCHED_SYMBOLS);
  const [sort, setSort] = useState<SortOption>("weekly-growth");
  const [sector, setSector] = useState("All Sectors");
  const [region, setRegion] = useState("All");
  const [assetType, setAssetType] = useState("All");
  const [selectedQuote, setSelectedQuote] = useState<FormattedQuote | null>(null);
  const { quotes, loading, error, refetch } = useStockQuotes(symbols);
  const { results: searchResults, search, loading: searchLoading } = useSymbolSearch();

  useEffect(() => {
    const timeout = setTimeout(() => search(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput, search]);

  const processedQuotes = useMemo(() => {
    let result = [...quotes];
    if (searchInput) result = result.filter((q) => q.symbol.toLowerCase().includes(searchInput.toLowerCase()));
    if (sector !== "All Sectors") result = result.filter((q) => STOCK_SECTORS[q.symbol] === sector);
    if (region !== "All") result = result.filter((q) => SYMBOL_REGION[q.symbol] === region);
    if (assetType !== "All") result = result.filter((q) => SYMBOL_ASSET_TYPE[q.symbol] === assetType);
    switch (sort) {
      case "weekly-growth":
      case "top-gainers": result.sort((a, b) => b.changePct - a.changePct); break;
      case "top-losers": result.sort((a, b) => a.changePct - b.changePct); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "price-low": result.sort((a, b) => a.price - b.price); break;
    }
    return result;
  }, [quotes, searchInput, sort, sector, region, assetType]);

  const addSymbol = (sym: string) => {
    if (!symbols.includes(sym)) setSymbols((prev) => [...prev, sym]);
    setSearchInput("");
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Binoculars className="h-5 w-5 text-primary" />
          Scout
        </h2>
        <button onClick={refetch} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary">
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Updating..." : "Refresh"}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text" placeholder="Search any stock or bond by symbol..."
          value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        {searchInput && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-card p-2 shadow-lg">
            {searchResults.map((r) => (
              <button key={r.symbol} onClick={() => addSymbol(r.symbol)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary">
                <span className="font-bold text-foreground">{r.symbol}</span>
                <span className="text-[11px] text-muted-foreground truncate ml-2">{r.description}</span>
              </button>
            ))}
            {searchLoading && <p className="px-3 py-2 text-[11px] text-muted-foreground">Searching...</p>}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownSelect value={sort} options={sortOptions} onChange={(v) => setSort(v as SortOption)} icon={ArrowUpDown} />
        <DropdownSelect value={sector} options={SECTORS.map((s) => ({ value: s, label: s }))} onChange={setSector} icon={SlidersHorizontal} />
        <DropdownSelect value={region} options={REGION_OPTIONS} onChange={setRegion} icon={Globe} />
        <DropdownSelect value={assetType} options={ASSET_TYPE_OPTIONS} onChange={setAssetType} icon={Landmark} />
        {(sector !== "All Sectors" || sort !== "weekly-growth" || region !== "All" || assetType !== "All") && (
          <button onClick={() => { setSector("All Sectors"); setSort("weekly-growth"); setRegion("All"); setAssetType("All"); }} className="text-[10px] font-semibold text-primary">Clear</button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-loss/30 bg-loss/10 p-3 text-[11px] text-loss">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {loading && quotes.length === 0 ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-secondary" />)}
        </div>
      ) : (
        <div className="space-y-2.5">
          {processedQuotes.map((quote) => (
            <QuoteCard key={quote.symbol} quote={quote} onClick={() => setSelectedQuote(quote)} />
          ))}
          {processedQuotes.length === 0 && (
            <div className="py-12 text-center">
              <Binoculars className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No stocks match your filters</p>
            </div>
          )}
        </div>
      )}

      <StockDetailSheet quote={selectedQuote} open={!!selectedQuote} onOpenChange={(open) => { if (!open) setSelectedQuote(null); }} />
    </>
  );
};

export default ScoutContent;
