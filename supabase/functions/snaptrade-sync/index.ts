import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SNAPTRADE_API = "https://api.snaptrade.com/api/v1";

async function snaptradeRequest(
  method: string,
  path: string,
  queryParams: Record<string, string> = {},
  body?: Record<string, unknown>
) {
  const clientId = Deno.env.get("SNAPTRADE_CLIENT_ID")!;
  const consumerKey = Deno.env.get("SNAPTRADE_CONSUMER_KEY")!;
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const allParams = { clientId, timestamp, ...queryParams };
  const queryString = new URLSearchParams(allParams).toString();

  const requestData = body || {};
  const requestPath = `/api/v1${path}`;

  function sortedStringify(obj: unknown): string {
    if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
      return JSON.stringify(obj);
    }
    const sorted = Object.keys(obj as Record<string, unknown>).sort().map(
      k => `${JSON.stringify(k)}:${sortedStringify((obj as Record<string, unknown>)[k])}`
    );
    return `{${sorted.join(",")}}`;
  }

  const sigObject = { content: requestData, path: requestPath, query: queryString };
  const sigContent = sortedStringify(sigObject);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(consumerKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(sigContent));
  const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));

  const url = `${SNAPTRADE_API}${path}?${queryString}`;
  console.log(`SnapTrade ${method} ${path}`);

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Signature": sigBase64,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("SnapTrade API error:", res.status, JSON.stringify(data));
    throw new Error(`SNAPTRADE_API_ERROR:${res.status}`);
  }
  return data;
}

function guessSector(symbol: string, _description?: string): string {
  const techSymbols = ["AAPL", "MSFT", "GOOGL", "GOOG", "META", "NVDA", "AMD", "PLTR", "SOFI"];
  const healthSymbols = ["JNJ", "UNH", "PFE", "XLV", "MRNA"];
  const energySymbols = ["XOM", "XLE", "CVX", "NEE"];
  const cryptoSymbols = ["BTC", "ETH", "COIN", "MARA", "RIOT", "IBIT", "BITO"];
  const consumerSymbols = ["AMZN", "TSLA", "GME", "DKNG", "KO"];
  const finSymbols = ["JPM", "BAC", "GS", "BND", "MAIN", "SQ"];
  const intlSymbols = ["VXUS", "EFA", "BABA", "VWO"];
  const realEstateSymbols = ["VNQ", "O"];
  const etfSymbols = ["VOO", "VTI", "QQQ", "SPY", "SCHD", "JEPI", "JEPQ", "VYM", "ARKK"];

  const s = symbol.toUpperCase();
  if (etfSymbols.includes(s)) return "Index/ETF";
  if (techSymbols.includes(s)) return "Tech";
  if (healthSymbols.includes(s)) return "Healthcare";
  if (energySymbols.includes(s)) return "Energy";
  if (cryptoSymbols.includes(s)) return "Crypto";
  if (consumerSymbols.includes(s)) return "Consumer";
  if (finSymbols.includes(s)) return "Financials";
  if (intlSymbols.includes(s)) return "International";
  if (realEstateSymbols.includes(s)) return "Real Estate";
  return "Index/ETF";
}

// UUID v4 format validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { leagueId } = await req.json();

    // Validate leagueId format
    if (!leagueId || typeof leagueId !== "string") {
      throw new Error("Invalid leagueId");
    }

    // For non-UUID "current" placeholder, we need a real league ID
    if (leagueId !== "current" && !UUID_REGEX.test(leagueId)) {
      throw new Error("Invalid leagueId format");
    }

    // Verify user is a member of the league
    if (leagueId !== "current") {
      const { data: membership } = await supabase
        .from("league_members")
        .select("id")
        .eq("league_id", leagueId)
        .eq("user_id", user.id)
        .single();

      if (!membership) {
        throw new Error("Not a member of this league");
      }
    }

    // Get user's connected accounts
    const accounts = await snaptradeRequest("GET", `/accounts/${user.id}`);
    
    if (!accounts || accounts.length === 0) {
      return new Response(JSON.stringify({ error: "No connected brokerage accounts found. Please connect your brokerage first." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalSynced = 0;

    for (const account of accounts) {
      const positions = await snaptradeRequest(
        "GET",
        `/accounts/${user.id}/${account.id}/positions`
      );

      if (!positions || positions.length === 0) continue;

      const totalValue = positions.reduce((sum: number, p: any) => {
        return sum + (p.units * (p.price || p.averageEntryPrice || 0));
      }, 0);

      for (const pos of positions) {
        const symbol = pos.symbol?.symbol || pos.symbol || "UNKNOWN";
        const name = pos.symbol?.description || pos.symbol?.name || symbol;
        const shares = pos.units || 0;
        const currentPrice = pos.price || 0;
        const avgCost = pos.averageEntryPrice || currentPrice;
        const posValue = shares * currentPrice;
        const allocation = totalValue > 0 ? Math.round((posValue / totalValue) * 100) : 0;

        const { error: upsertError } = await supabase
          .from("holdings")
          .upsert(
            {
              user_id: user.id,
              league_id: leagueId,
              symbol,
              name,
              shares,
              avg_cost: avgCost,
              current_price: currentPrice,
              allocation,
              sector: guessSector(symbol, name),
              is_active: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,league_id,symbol", ignoreDuplicates: false }
          );

        if (upsertError) {
          console.error("Upsert error for", symbol, upsertError);
        } else {
          totalSynced++;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, synced: totalSynced }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("snaptrade-sync error:", error);
    
    let userMessage = "Sync failed. Please try again.";
    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes("Unauthorized")) {
        userMessage = "Authentication failed. Please sign in again.";
      } else if (msg.includes("Not a member")) {
        userMessage = "You are not a member of this league.";
      } else if (msg.includes("Invalid leagueId")) {
        userMessage = "Invalid league specified.";
      }
    }
    
    return new Response(JSON.stringify({ error: userMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
