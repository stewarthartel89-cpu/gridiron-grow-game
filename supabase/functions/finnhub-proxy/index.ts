import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FINNHUB_BASE = "https://finnhub.io/api/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Authenticate the caller
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("FINNHUB_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "FINNHUB_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { action, symbols, category, ...payload } = await req.json();

    if (action === "quotes") {
      // Fetch quotes for multiple symbols
      const quotePromises = (symbols as string[]).map(async (symbol: string) => {
        const res = await fetch(`${FINNHUB_BASE}/quote?symbol=${symbol}&token=${apiKey}`);
        const data = await res.json();
        return { symbol, ...data };
      });
      const quotes = await Promise.all(quotePromises);
      return new Response(JSON.stringify({ quotes }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "news") {
      // Fetch market news by category (general, forex, crypto, merger)
      const cat = category || "general";
      const res = await fetch(`${FINNHUB_BASE}/news?category=${cat}&token=${apiKey}`);
      const articles = await res.json();
      return new Response(JSON.stringify({ articles }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "company-news") {
      // Fetch company-specific news
      const symbol = symbols?.[0];
      if (!symbol) {
        return new Response(JSON.stringify({ error: "Symbol required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const now = new Date();
      const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const toStr = now.toISOString().split("T")[0];
      const fromStr = from.toISOString().split("T")[0];
      const res = await fetch(
        `${FINNHUB_BASE}/company-news?symbol=${symbol}&from=${fromStr}&to=${toStr}&token=${apiKey}`
      );
      const articles = await res.json();
      return new Response(JSON.stringify({ articles }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "search") {
      const query = symbols?.[0] || "";
      const res = await fetch(`${FINNHUB_BASE}/search?q=${query}&token=${apiKey}`);
      const data = await res.json();
      return new Response(JSON.stringify({ results: data.result || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "candle") {
      const symbol = symbols?.[0];
      if (!symbol) {
        return new Response(JSON.stringify({ error: "Symbol required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { resolution, from: fromTs, to: toTs } = payload || {};
      const res = await fetch(
        `${FINNHUB_BASE}/stock/candle?symbol=${symbol}&resolution=${resolution || "D"}&from=${fromTs}&to=${toTs}&token=${apiKey}`
      );
      const data = await res.json();
      return new Response(JSON.stringify({ candle: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "profile") {
      const symbol = symbols?.[0];
      if (!symbol) {
        return new Response(JSON.stringify({ error: "Symbol required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const res = await fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${symbol}&token=${apiKey}`);
      const data = await res.json();
      return new Response(JSON.stringify({ profile: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Finnhub proxy error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
