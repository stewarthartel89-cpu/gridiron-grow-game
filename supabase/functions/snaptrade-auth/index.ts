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

  // Build query string with clientId and timestamp
  const allParams = { clientId, timestamp, ...queryParams };
  const queryString = new URLSearchParams(allParams).toString();

  // Signature = HMAC-SHA256(consumerKey, JSON.stringify({content, path, query}))
  // content = request body object (or empty object), path = full API path, query = query string
  const requestData = body || {};
  const requestPath = `/api/v1${path}`;
  const sigObject = { content: requestData, path: requestPath, query: queryString };
  const sigContent = JSON.stringify(sigObject);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(consumerKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(sigContent));
  // SnapTrade expects base64-encoded signature
  const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));

  const url = `${SNAPTRADE_API}${path}?${queryString}`;
  console.log(`SnapTrade ${method} ${path} query=${queryString}`);

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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { action, redirectUri, userSecret } = await req.json();

    if (action === "register") {
      // Check if user already has a stored secret
      const { data: profile } = await supabase
        .from("profiles")
        .select("snaptrade_user_secret")
        .eq("user_id", user.id)
        .single();

      if (profile?.snaptrade_user_secret) {
        return new Response(JSON.stringify({ success: true, userSecret: profile.snaptrade_user_secret }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Register new user with SnapTrade
      try {
        const result = await snaptradeRequest(
          "POST",
          "/snapTrade/registerUser",
          {},
          { userId: user.id }
        );

        // Store the secret
        await supabase
          .from("profiles")
          .update({ snaptrade_user_secret: result.userSecret })
          .eq("user_id", user.id);

        return new Response(JSON.stringify({ success: true, userSecret: result.userSecret }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (regError) {
        const errMsg = regError instanceof Error ? regError.message : "";
        if (errMsg.includes("1010") || errMsg.includes("already exist")) {
          // User exists but we lost the secret — need to delete and re-register
          console.log("User already registered but secret not stored. Deleting and re-registering...");
          await snaptradeRequest("DELETE", `/snapTrade/deleteUser`, {}, { userId: user.id });
          const result = await snaptradeRequest("POST", "/snapTrade/registerUser", {}, { userId: user.id });
          await supabase.from("profiles").update({ snaptrade_user_secret: result.userSecret }).eq("user_id", user.id);
          return new Response(JSON.stringify({ success: true, userSecret: result.userSecret }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw regError;
      }
    }

    if (action === "connect") {
      // Get stored secret
      let secret = userSecret;
      if (!secret) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("snaptrade_user_secret")
          .eq("user_id", user.id)
          .single();
        secret = profile?.snaptrade_user_secret;
      }
      if (!secret) throw new Error("No SnapTrade user secret found. Please register first.");

      const result = await snaptradeRequest(
        "POST",
        "/snapTrade/login",
        { userId: user.id, userSecret: secret },
        {
          broker: "ROBINHOOD",
          immediateRedirect: true,
          redirectURI: redirectUri || "https://gridiron-grow-game.lovable.app/settings",
          connectionType: "read",
        }
      );

      return new Response(
        JSON.stringify({ redirectUrl: result.redirectURI || result.loginLink }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
