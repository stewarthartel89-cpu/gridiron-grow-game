import { useState, memo } from "react";
import LeagueHeader from "@/components/LeagueHeader";
import PageTransition from "@/components/PageTransition";
import { Search, TrendingUp, TrendingDown, Activity, Shield, Globe, BarChart3, Zap, DollarSign, ExternalLink, Filter } from "lucide-react";

type FilterCategory = "movement" | "strategy" | "sector" | "cap";

interface StockCard {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  changePct: number;
  volatility: "Low" | "Medium" | "High";
  trending?: string;
  tags: string[];
}

const mockStocks: StockCard[] = [
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Tech", price: 340, changePct: 8.2, volatility: "High", trending: "AI chip demand surges on data center buildout", tags: ["Large Cap", "Growth", "Domestic"] },
  { symbol: "AAPL", name: "Apple Inc.", sector: "Tech", price: 195, changePct: 2.1, volatility: "Low", tags: ["Large Cap", "Growth", "Domestic"] },
  { symbol: "XLE", name: "Energy Select SPDR", sector: "Energy", price: 88, changePct: -1.4, volatility: "Medium", tags: ["ETF", "Domestic"] },
  { symbol: "VXUS", name: "Vanguard Intl Stock", sector: "International", price: 58, changePct: 1.8, volatility: "Low", tags: ["ETF", "International"] },
  { symbol: "SCHD", name: "Schwab US Dividend", sector: "Index/ETF", price: 78, changePct: 0.5, volatility: "Low", trending: "Top dividend ETF by inflows this quarter", tags: ["ETF", "Dividend", "Domestic"] },
  { symbol: "COIN", name: "Coinbase Global", sector: "Crypto", price: 195, changePct: 5.6, volatility: "High", trending: "Bitcoin ETF approval boosting trading volumes", tags: ["Mid Cap", "Growth", "Crypto"] },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare", price: 30, changePct: -2.8, volatility: "Medium", tags: ["Large Cap", "Dividend", "Domestic"] },
  { symbol: "SOFI", name: "SoFi Technologies", sector: "Financials", price: 9.5, changePct: 4.1, volatility: "High", trending: "Fintech revenue beat expectations", tags: ["Small Cap", "Growth", "Domestic"] },
  { symbol: "VNQ", name: "Vanguard Real Estate", sector: "Real Estate", price: 85, changePct: -0.3, volatility: "Low", tags: ["ETF", "Dividend", "Domestic"] },
  { symbol: "LIT", name: "Global X Lithium ETF", sector: "Industrials", price: 48, changePct: 3.2, volatility: "High", trending: "EV battery supply chain rally", tags: ["ETF", "Growth", "International"] },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer", price: 168, changePct: 1.5, volatility: "Medium", tags: ["Large Cap", "Growth", "Domestic"] },
  { symbol: "BTC", name: "Bitcoin ETF (IBIT)", sector: "Crypto", price: 48, changePct: 6.8, volatility: "High", trending: "Institutional adoption accelerating", tags: ["ETF", "Crypto"] },
];

const filterOptions: { category: FilterCategory; label: string; icon: typeof TrendingUp; filters: string[] }[] = [
  { category: "movement", label: "Market", icon: Activity, filters: ["Gainers", "Losers", "High Vol", "Low Vol"] },
  { category: "strategy", label: "Strategy", icon: Zap, filters: ["Dividend", "Growth", "ETF", "International"] },
  { category: "sector", label: "Sector", icon: BarChart3, filters: ["Tech", "Healthcare", "Energy", "Financials", "Consumer", "Crypto"] },
  { category: "cap", label: "Size", icon: Shield, filters: ["Large Cap", "Mid Cap", "Small Cap"] },
];

const VolatilityBadge = memo(({ level }: { level: string }) => {
  const color = level === "High" ? "bg-loss/20 text-loss" : level === "Medium" ? "bg-warning/20 text-warning" : "bg-gain/20 text-gain";
  return <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${color}`}>{level} Vol</span>;
});
VolatilityBadge.displayName = "VolatilityBadge";

const ScoutPage = () => {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<FilterCategory | null>(null);

  const toggleFilter = (f: string) => {
    setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const filtered = mockStocks.filter(s => {
    const matchesSearch = !search || s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilters.length === 0) return true;
    return activeFilters.some(f => {
      if (f === "Gainers") return s.changePct > 0;
      if (f === "Losers") return s.changePct < 0;
      if (f === "High Vol") return s.volatility === "High";
      if (f === "Low Vol") return s.volatility === "Low";
      if (f === "International") return s.tags.includes("International");
      return s.tags.includes(f) || s.sector === f;
    });
  });

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
          <span className="text-[10px] text-muted-foreground">Read-only · Trade on Robinhood</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stocks, ETFs, crypto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filterOptions.map(({ category, label, icon: Icon }) => (
              <button
                key={category}
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  expandedCategory === category ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
                <Filter className="h-2.5 w-2.5" />
              </button>
            ))}
          </div>
          {expandedCategory && (
            <div className="flex flex-wrap gap-1.5">
              {filterOptions.find(f => f.category === expandedCategory)?.filters.map(f => (
                <button
                  key={f}
                  onClick={() => toggleFilter(f)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                    activeFilters.includes(f) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
          {activeFilters.length > 0 && (
            <button onClick={() => setActiveFilters([])} className="text-[10px] text-primary font-semibold">
              Clear all filters
            </button>
          )}
        </div>

        {/* Stock Cards */}
        <div className="space-y-2.5">
          {filtered.map(stock => {
            const isUp = stock.changePct >= 0;
            return (
              <div key={stock.symbol} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary font-display text-[11px] font-bold text-secondary-foreground">
                      {stock.symbol}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{stock.symbol}</p>
                      <p className="text-[11px] text-muted-foreground">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">${stock.price.toFixed(2)}</p>
                    <div className={`flex items-center justify-end gap-0.5 text-[11px] font-semibold ${isUp ? "text-gain" : "text-loss"}`}>
                      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {isUp ? "+" : ""}{stock.changePct.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">{stock.sector}</span>
                  <VolatilityBadge level={stock.volatility} />
                  {stock.tags.slice(0, 2).map(t => (
                    <span key={t} className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">{t}</span>
                  ))}
                </div>

                {stock.trending && (
                  <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-accent/50 p-2.5">
                    <Zap className="h-3.5 w-3.5 shrink-0 text-xp mt-0.5" />
                    <p className="text-[10px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Why it's trending: </span>
                      {stock.trending}
                    </p>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    {stock.tags.includes("International") ? "International" : "Domestic"}
                  </div>
                  <a
                    href={`https://robinhood.com/stocks/${stock.symbol}`}
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
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No stocks match your filters</p>
            </div>
          )}
        </div>

        <p className="text-center text-[9px] text-muted-foreground py-4">
          For informational purposes only. Not financial advice. All trades executed on Robinhood.
        </p>
      </main>
    </div>
    </PageTransition>
  );
};

export default ScoutPage;
