import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SNAPTRADE_API = "https://api.snaptrade.com/api/v1";

async function snaptradeRequest(
  method: string,
  path: string,
  body?: Record<string, unknown>
) {
  const clientId = Deno.env.get("SNAPTRADE_CLIENT_ID")!;
  const consumerKey = Deno.env.get("SNAPTRADE_CONSUMER_KEY")!;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "clientId": clientId,
  };

  // SnapTrade uses a signature-based auth — for partner-level keys,
  // the consumer key is sent as the Signature header
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // Build signature using HMAC
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

  headers["Signature"] = sigHex;
  headers["timestamp"] = timestamp;

  const url = `${SNAPTRADE_API}${path}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("SnapTrade API error:", res.status, JSON.stringify(data));
    throw new Error(`SnapTrade API error [${res.status}]: ${JSON.stringify(data)}`);
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { action, redirectUri } = await req.json();

    if (action === "register") {
      // Register user with SnapTrade
      const result = await snaptradeRequest("POST", "/snapTrade/registerUser", {
        userId: user.id,
      });

      return new Response(JSON.stringify({ success: true, userSecret: result.userSecret }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "connect") {
      // Generate redirect URL for SnapTrade connection portal
      const result = await snaptradeRequest(
        "POST",
        `/snapTrade/login/${user.id}`,
        {
          broker: "ROBINHOOD",
          immediateRedirect: true,
          redirectURI: redirectUri || "https://gridiron-grow-game.lovable.app/settings",
          connectionType: "read",
        }
      );

      return new Response(JSON.stringify({ redirectUrl: result.redirectURI || result.loginLink }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error("snaptrade-auth error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
