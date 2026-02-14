import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Users, ChevronRight, Settings as SettingsIcon, MessageCircle, Trophy } from "lucide-react";
import { useUnreadCount } from "@/hooks/useChat";
import PageTransition from "@/components/PageTransition";
import StockTicker from "@/components/StockTicker";
import { useLeague, type UserLeague } from "@/contexts/LeagueContext";
import { useMarketNews, type FormattedArticle } from "@/hooks/useFinnhub";
import { Clock, ExternalLink, Newspaper } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import pogroLogo from "@/assets/pogro-logo.png";
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
                  <div key="cta" className="min-w-0 shrink-0 grow-0 basis-[46%] pr-2.5">
                    <motion.button
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        boxShadow: [
                          "0 0 12px hsl(152 100% 45% / 0.08), 0 4px 16px hsl(0 0% 0% / 0.12)",
                          "0 0 28px hsl(152 100% 45% / 0.2), 0 4px 16px hsl(0 0% 0% / 0.12)",
                          "0 0 12px hsl(152 100% 45% / 0.08), 0 4px 16px hsl(0 0% 0% / 0.12)",
                        ],
                      }}
                      transition={{
                        boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                      }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate("/league-hub")}
                      className="group relative w-full overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-card p-5 flex flex-col items-center justify-center text-center gap-2.5 transition-all active:border-primary/60 aspect-square"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/4 pointer-events-none" />

                      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
                        <Plus className="h-7 w-7 text-primary" />
                      </div>

                      <p className="relative font-display text-base font-bold text-foreground tracking-wide">Create or Join</p>

                      <p className="relative text-[10px] text-muted-foreground font-medium">
                        Start competing with friends
                      </p>
                    </motion.button>
                  </div>
                );
              }

              return (
                <div key={card.league.leagueId} className="min-w-0 shrink-0 grow-0 basis-[46%] pr-2.5">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      setActiveLeague(card.league.leagueId);
                      navigate("/league");
                    }}
                    className="group relative w-full overflow-hidden rounded-2xl border border-primary/30 bg-card p-5 flex flex-col items-center justify-center text-center gap-2.5 transition-all active:border-primary/60 aspect-square"
                    style={{
                      boxShadow: "0 0 20px hsl(152 100% 45% / 0.1), 0 4px 16px hsl(0 0% 0% / 0.18)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-primary/6 pointer-events-none" />
                    <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary glow-primary">
                      <Trophy className="h-7 w-7 text-primary-foreground" />
                    </div>

                    <p className="relative font-display text-base font-bold text-foreground tracking-wide leading-tight truncate max-w-[130px]">{card.league.leagueName}</p>

                    <div className="relative flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span className="font-semibold">{card.league.memberCount}/{card.league.maxMembers} members</span>
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
  const unreadCount = useUnreadCount();

  return (
    <PageTransition>
      <div className="min-h-[100dvh] bg-background pb-28">
        {/* Top bar with settings */}
        <header className="border-b border-border bg-card safe-area-top">
          <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
            <button onClick={() => navigate("/settings")} className="rounded-lg p-2 text-muted-foreground hover:text-foreground active:bg-accent transition-colors">
              <SettingsIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <img src={pogroLogo} alt="Pogro" className="h-9 w-9 rounded-lg" />
              <h1 className="font-display text-lg font-bold tracking-wider text-foreground">Pogro</h1>
            </div>
            <button onClick={() => navigate("/chat")} className="relative rounded-lg p-2 text-muted-foreground hover:text-foreground active:bg-accent transition-colors">
              <MessageCircle className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
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
