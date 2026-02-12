import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Users, ChevronRight, Settings as SettingsIcon } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import StockTicker from "@/components/StockTicker";
import { useLeague, type UserLeague } from "@/contexts/LeagueContext";
import { useMarketNews, type FormattedArticle } from "@/hooks/useFinnhub";
import { Clock, ExternalLink, Newspaper } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const LeagueCarousel = () => {
  const { leagues, setActiveLeague } = useLeague();
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const cards: ({ type: "league"; league: UserLeague } | { type: "cta" })[] = [
    { type: "cta" },
    ...leagues.map((l) => ({ type: "league" as const, league: l })),
  ];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  return (
    <div className="px-4">
      <div ref={emblaRef} className="overflow-hidden cursor-grab active:cursor-grabbing">
        <div className="flex">
          {cards.map((card, i) => {
            if (card.type === "cta") {
              return (
                <div key="cta" className="min-w-0 shrink-0 grow-0 basis-[85%] pr-3">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => navigate("/league-hub")}
                    className="w-full rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 flex flex-col items-center justify-center gap-3 active:bg-primary/10 transition-colors"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
                      <Plus className="h-7 w-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-display text-base font-bold text-foreground">Create or Join a League</p>
                      <p className="text-xs text-muted-foreground mt-1">Start competing with friends</p>
                    </div>
                  </motion.button>
                </div>
              );
            }

            return (
              <div key={card.league.leagueId} className="min-w-0 shrink-0 grow-0 basis-[85%] pr-3">
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setActiveLeague(card.league.leagueId);
                    navigate("/league");
                  }}
                  className="w-full rounded-2xl border border-border bg-card p-6 flex flex-col items-start gap-3 active:border-primary/40 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary glow-primary">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-display text-base font-bold text-foreground">{card.league.leagueName}</p>
                    <p className="text-xs text-muted-foreground mt-1">Tap to enter league</p>
                  </div>
                  <div className="flex items-center gap-1 text-primary text-xs font-semibold mt-auto">
                    View <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>
      {cards.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`rounded-full transition-all ${i === selectedIndex ? "h-2 w-5 bg-primary" : "h-2 w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const NewsPreview = () => {
  const { articles, loading } = useMarketNews("general");
  const navigate = useNavigate();

  if (loading && articles.length === 0) {
    return (
      <div className="px-4 space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          Market News
        </h2>
        <button onClick={() => navigate("/news")} className="text-xs text-primary font-semibold flex items-center gap-1">
          See all <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      {articles.slice(0, 5).map((article) => (
        <a
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/30"
        >
          <div className="flex items-start gap-3">
            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt=""
                className="h-14 w-20 shrink-0 rounded-lg object-cover bg-secondary"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{article.headline}</p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="font-medium text-foreground/70">{article.source}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {timeAgo(article.publishedAt)}
                </span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        {/* Top bar with settings */}
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary glow-primary">
                <span className="font-display text-sm font-bold text-primary-foreground">CL</span>
              </div>
              <h1 className="font-display text-lg font-bold tracking-wider text-foreground">Capital League</h1>
            </div>
            <button onClick={() => navigate("/settings")} className="rounded-lg p-2 text-muted-foreground hover:text-foreground active:bg-accent transition-colors">
              <SettingsIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Stock ticker bar */}
        <StockTicker />

        <main className="py-5 space-y-6 max-w-2xl mx-auto">
          {/* League carousel */}
          <LeagueCarousel />

          {/* Market news */}
          <NewsPreview />
        </main>
      </div>
    </PageTransition>
  );
};

export default Index;
