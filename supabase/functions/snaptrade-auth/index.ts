import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SNAPTRADE_API = "https://api.snaptrade.com/api/v1";
const VALID_ACTIONS = ["register", "connect"];
const ALLOWED_REDIRECT_ORIGINS = [
  "https://gridiron-grow-game.lovable.app",
  "https://id-preview--80f0a26c-bb9e-400b-9274-981c5ca4290c.lovable.app",
];

function isValidRedirectUri(uri: string): boolean {
  try {
    const url = new URL(uri);
    return ALLOWED_REDIRECT_ORIGINS.some(origin => url.origin === origin);
  } catch {
    return false;
  }
}

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

function safeErrorResponse(error: unknown): Response {
  console.error("snaptrade-auth error:", error);
  
  let userMessage = "Something went wrong. Please try again.";
  
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes("Unauthorized") || msg.includes("authorization")) {
      userMessage = "Authentication failed. Please sign in again.";
    } else if (msg.includes("already exist") || msg.includes("1010")) {
      userMessage = "Account connection already exists. Try connecting again.";
    } else if (msg.includes("No SnapTrade user secret")) {
      userMessage = "Please register your brokerage account first.";
    } else if (msg.includes("Invalid")) {
      userMessage = "Invalid request. Please check your input.";
    }
  }
  
  return new Response(JSON.stringify({ error: userMessage }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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
    if (!authHeader) throw new Error("Unauthorized");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const { action, redirectUri, userSecret } = body;

    // Validate action
    if (!action || !VALID_ACTIONS.includes(action)) {
      throw new Error("Invalid action");
    }

    // Validate redirectUri if provided
    if (redirectUri && !isValidRedirectUri(redirectUri)) {
      throw new Error("Invalid redirect URI");
    }

    // Validate userSecret format if provided
    if (userSecret && (typeof userSecret !== "string" || userSecret.length > 200)) {
      throw new Error("Invalid userSecret");
    }

    if (action === "register") {
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

      try {
        const result = await snaptradeRequest(
          "POST",
          "/snapTrade/registerUser",
          {},
          { userId: user.id }
        );

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
          console.log("User already registered. Deleting and re-registering...");
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

    throw new Error("Invalid action");
  } catch (error) {
    return safeErrorResponse(error);
  }
});
