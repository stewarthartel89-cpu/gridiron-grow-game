import { useState, memo } from "react";
import LeagueHeader from "@/components/LeagueHeader";
import { Newspaper, Clock, TrendingUp, Flame, BarChart3, DollarSign } from "lucide-react";

type NewsSection = "top" | "trending" | "crypto" | "earnings";

interface Article {
  id: string;
  headline: string;
  source: string;
  timeAgo: string;
  tickers: string[];
  section: NewsSection;
  summary?: string;
  reads: number;
}

const mockArticles: Article[] = [
  { id: "n1", headline: "S&P 500 Hits New All-Time High as Tech Rally Extends", source: "Reuters", timeAgo: "12m ago", tickers: ["SPY", "QQQ", "VOO"], section: "top", summary: "Broad market strength driven by AI optimism and cooling inflation data.", reads: 45200 },
  { id: "n2", headline: "NVIDIA Q4 Earnings Crush Estimates, Revenue Up 265%", source: "CNBC", timeAgo: "1h ago", tickers: ["NVDA"], section: "earnings", summary: "Data center revenue surpasses expectations as AI infrastructure spending accelerates.", reads: 89300 },
  { id: "n3", headline: "Bitcoin Surges Past $52K After Spot ETF Inflows Hit Record", source: "CoinDesk", timeAgo: "2h ago", tickers: ["BTC", "IBIT", "COIN"], section: "crypto", summary: "Institutional demand through new spot Bitcoin ETFs driving historic inflows.", reads: 62100 },
  { id: "n4", headline: "Fed Signals Rate Cuts Could Begin This Summer", source: "Bloomberg", timeAgo: "3h ago", tickers: ["SPY", "TLT", "BND"], section: "top", summary: "Multiple Fed governors suggest cooling inflation may warrant policy easing.", reads: 71400 },
  { id: "n5", headline: "Tesla Announces New Affordable Model, Stock Jumps 8%", source: "MarketWatch", timeAgo: "4h ago", tickers: ["TSLA"], section: "trending", summary: "Sub-$30K vehicle expected to compete directly with mass-market EVs.", reads: 53800 },
  { id: "n6", headline: "Apple Vision Pro Sales Exceed Analyst Expectations", source: "The Verge", timeAgo: "5h ago", tickers: ["AAPL"], section: "trending", summary: "Spatial computing device sees strong enterprise adoption despite premium pricing.", reads: 38900 },
  { id: "n7", headline: "Ethereum Upgrade 'Dencun' Goes Live, Gas Fees Drop 90%", source: "CoinDesk", timeAgo: "6h ago", tickers: ["ETH", "COIN"], section: "crypto", summary: "Proto-danksharding dramatically reduces Layer 2 transaction costs.", reads: 41200 },
  { id: "n8", headline: "Pfizer Reports Mixed Q4, Guides Lower for 2025", source: "Reuters", timeAgo: "7h ago", tickers: ["PFE"], section: "earnings", summary: "Post-COVID revenue normalization weighs on outlook despite pipeline progress.", reads: 28500 },
  { id: "n9", headline: "Oil Prices Spike on Middle East Supply Concerns", source: "Bloomberg", timeAgo: "8h ago", tickers: ["XLE", "XOM", "CVX"], section: "top", summary: "Geopolitical tensions and shipping disruptions push crude above $80.", reads: 34600 },
  { id: "n10", headline: "SoFi Reports First Profitable Quarter, Stock Soars", source: "CNBC", timeAgo: "10h ago", tickers: ["SOFI"], section: "trending", summary: "Fintech company achieves profitability milestone ahead of schedule.", reads: 47100 },
  { id: "n11", headline: "Solana Network Activity Hits New Record, Surpasses Ethereum Transactions", source: "The Block", timeAgo: "11h ago", tickers: ["SOL"], section: "crypto", reads: 29800 },
  { id: "n12", headline: "Microsoft Azure Revenue Accelerates on AI Workloads", source: "MarketWatch", timeAgo: "14h ago", tickers: ["MSFT"], section: "earnings", summary: "Cloud segment growth re-accelerates as enterprises adopt Copilot.", reads: 52300 },
];

const sectionConfig: { key: NewsSection; label: string; icon: typeof Flame }[] = [
  { key: "top", label: "Top Stories", icon: Flame },
  { key: "trending", label: "Trending Stocks", icon: TrendingUp },
  { key: "crypto", label: "Crypto Highlights", icon: DollarSign },
  { key: "earnings", label: "Earnings & Company", icon: BarChart3 },
];

const formatReads = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;

const ArticleCard = memo(({ article }: { article: Article }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground leading-snug">{article.headline}</p>
        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="font-medium text-foreground/70">{article.source}</span>
          <span>·</span>
          <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{article.timeAgo}</span>
          <span>·</span>
          <span>{formatReads(article.reads)} reads</span>
        </div>
      </div>
    </div>

    {article.summary && (
      <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">{article.summary}</p>
    )}

    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {article.tickers.map(t => (
        <span key={t} className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">{t}</span>
      ))}
    </div>
  </div>
));
ArticleCard.displayName = "ArticleCard";

const NewsPage = () => {
  const [activeSection, setActiveSection] = useState<NewsSection | "all">("all");

  const articles = activeSection === "all" ? mockArticles : mockArticles.filter(a => a.section === activeSection);

  return (
    <div className="min-h-screen bg-background pb-24">
      <LeagueHeader />
      <main className="mx-auto max-w-2xl px-4 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            Market News
          </h2>
          <span className="text-[10px] text-muted-foreground">Updated live</span>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveSection("all")}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              activeSection === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            All
          </button>
          {sectionConfig.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                activeSection === key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>

        {/* Articles */}
        <div className="space-y-2.5">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        <p className="text-center text-[9px] text-muted-foreground py-4">
          For informational purposes only. Not financial advice.
        </p>
      </main>
    </div>
  );
};

export default NewsPage;
