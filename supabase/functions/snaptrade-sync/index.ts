import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SNAPTRADE_API = "https://api.snaptrade.com/api/v1";

async function snaptradeRequest(method: string, path: string, body?: Record<string, unknown>) {
  const clientId = Deno.env.get("SNAPTRADE_CLIENT_ID")!;
  const consumerKey = Deno.env.get("SNAPTRADE_CONSUMER_KEY")!;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(consumerKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const dataToSign = `/api/v1${path}${timestamp}`;
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(dataToSign));
  const sigHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  const res = await fetch(`${SNAPTRADE_API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "clientId": clientId,
      "Signature": sigHex,
      "timestamp": timestamp,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("SnapTrade API error:", res.status, JSON.stringify(data));
    throw new Error(`SnapTrade API error [${res.status}]: ${JSON.stringify(data)}`);
  }
  return data;
}

// Simple sector mapping based on common stock sectors
function guessSector(symbol: string, description?: string): string {
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
  return "Index/ETF"; // default fallback
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { leagueId } = await req.json();
    if (!leagueId) throw new Error("leagueId is required");

    // 1. Get user's connected accounts
    const accounts = await snaptradeRequest("GET", `/accounts/${user.id}`);
    
    if (!accounts || accounts.length === 0) {
      return new Response(JSON.stringify({ error: "No connected brokerage accounts found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalSynced = 0;

    for (const account of accounts) {
      // 2. Get positions for each account
      const positions = await snaptradeRequest(
        "GET",
        `/accounts/${user.id}/${account.id}/positions`
      );

      if (!positions || positions.length === 0) continue;

      // 3. Calculate total value for allocation percentages
      const totalValue = positions.reduce((sum: number, p: any) => {
        return sum + (p.units * (p.price || p.averageEntryPrice || 0));
      }, 0);

      // 4. Upsert each position into holdings
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
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
