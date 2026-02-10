import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Quote {
  symbol: string;
  c: number;  // current price
  d: number;  // change
  dp: number; // percent change
  h: number;  // high
  l: number;  // low
  o: number;  // open
  pc: number; // previous close
}

interface NewsArticle {
  id: number;
  category: string;
  datetime: number;
  headline: string;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface FormattedQuote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
}

export interface FormattedArticle {
  id: string;
  headline: string;
  source: string;
  summary: string;
  url: string;
  imageUrl: string;
  relatedTickers: string[];
  publishedAt: Date;
  category: string;
}

async function callFinnhub(action: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("finnhub-proxy", {
    body: { action, ...payload },
  });
  if (error) throw error;
  return data;
}

export function useStockQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<FormattedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    if (symbols.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await callFinnhub("quotes", { symbols });
      const formatted: FormattedQuote[] = (data.quotes as Quote[])
        .filter((q) => q.c > 0)
        .map((q) => ({
          symbol: q.symbol,
          price: q.c,
          change: q.d,
          changePct: q.dp,
          high: q.h,
          low: q.l,
          open: q.o,
          prevClose: q.pc,
        }));
      setQuotes(formatted);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch quotes");
    } finally {
      setLoading(false);
    }
  }, [symbols.join(",")]);

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60_000); // refresh every 60s
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  return { quotes, loading, error, refetch: fetchQuotes };
}

export function useMarketNews(category: string = "general") {
  const [articles, setArticles] = useState<FormattedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callFinnhub("news", { category });
      const formatted: FormattedArticle[] = (data.articles as NewsArticle[])
        .slice(0, 20)
        .map((a, i) => ({
          id: `${a.id || i}`,
          headline: a.headline,
          source: a.source,
          summary: a.summary,
          url: a.url,
          imageUrl: a.image,
          relatedTickers: a.related ? a.related.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
          publishedAt: new Date(a.datetime * 1000),
          category: a.category,
        }));
      setArticles(formatted);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60_000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [fetchNews]);

  return { articles, loading, error, refetch: fetchNews };
}

export function useSymbolSearch() {
  const [results, setResults] = useState<{ symbol: string; description: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await callFinnhub("search", { symbols: [query] });
      setResults(
        (data.results as { symbol: string; description: string }[]).slice(0, 8)
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, search };
}
