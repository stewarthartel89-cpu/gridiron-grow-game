import { useState, memo } from "react";
import LeagueHeader from "@/components/LeagueHeader";
import PageTransition from "@/components/PageTransition";
import { Newspaper, Clock, RefreshCw, ExternalLink, AlertCircle } from "lucide-react";
import { useMarketNews, type FormattedArticle } from "@/hooks/useFinnhub";

type NewsCategory = "general" | "forex" | "crypto" | "merger";

const categoryConfig: { key: NewsCategory; label: string }[] = [
  { key: "general", label: "General" },
  { key: "crypto", label: "Crypto" },
  { key: "forex", label: "Forex" },
  { key: "merger", label: "M&A" },
];

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const ArticleCard = memo(({ article }: { article: FormattedArticle }) => (
  <a
    href={article.url}
    target="_blank"
    rel="noopener noreferrer"
    className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
  >
    <div className="flex items-start gap-3">
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt=""
          className="h-16 w-24 shrink-0 rounded-lg object-cover bg-secondary"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{article.headline}</p>
        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="font-medium text-foreground/70">{article.source}</span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {timeAgo(article.publishedAt)}
          </span>
        </div>
      </div>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-1" />
    </div>

    {article.summary && (
      <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{article.summary}</p>
    )}

    {article.relatedTickers.length > 0 && (
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {article.relatedTickers.slice(0, 5).map((t) => (
          <span key={t} className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">{t}</span>
        ))}
      </div>
    )}
  </a>
));
ArticleCard.displayName = "ArticleCard";

const NewsPage = () => {
  const [category, setCategory] = useState<NewsCategory>("general");
  const { articles, loading, error, refetch } = useMarketNews(category);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <LeagueHeader />
        <main className="mx-auto max-w-2xl px-4 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              Market News
            </h2>
            <button onClick={refetch} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary">
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Updating..." : "Refresh"}
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categoryConfig.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  category === key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-loss/30 bg-loss/10 p-3 text-[11px] text-loss">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Articles */}
          {loading && articles.length === 0 ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-secondary" />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
              {articles.length === 0 && !loading && (
                <div className="py-12 text-center">
                  <Newspaper className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No news articles available</p>
                </div>
              )}
            </div>
          )}

          <p className="text-center text-[9px] text-muted-foreground py-4">
            Live data from Finnhub. For informational purposes only. Not financial advice.
          </p>
        </main>
      </div>
    </PageTransition>
  );
};

export default NewsPage;
