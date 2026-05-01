import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CACHE_MINUTES = 15;

async function fetchInstagram(accountId: string, token: string): Promise<number> {
  const url = `https://graph.facebook.com/v21.0/${accountId}?fields=followers_count&access_token=${token}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(`Instagram: ${JSON.stringify(data)}`);
  return data.followers_count ?? 0;
}

async function fetchTikTok(token: string): Promise<number> {
  const res = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=follower_count",
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`TikTok: ${JSON.stringify(data)}`);
  return data?.data?.user?.follower_count ?? 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    const { data: accounts, error } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", user.id);
    if (error) throw error;

    const results: Record<string, { username: string; count: number | null; lastSynced: string | null; status: string; error?: string }> = {};
    const now = Date.now();

    for (const acc of accounts ?? []) {
      const lastMs = acc.last_synced_at ? new Date(acc.last_synced_at).getTime() : 0;
      const fresh = now - lastMs < CACHE_MINUTES * 60_000;

      if (!acc.access_token) {
        results[acc.platform] = {
          username: acc.username,
          count: acc.follower_count,
          lastSynced: acc.last_synced_at,
          status: "no_token",
        };
        continue;
      }

      if (fresh && !force) {
        results[acc.platform] = {
          username: acc.username,
          count: acc.follower_count,
          lastSynced: acc.last_synced_at,
          status: "cached",
        };
        continue;
      }

      try {
        let count = 0;
        if (acc.platform === "instagram") {
          if (!acc.account_id) throw new Error("Falta Instagram account_id");
          count = await fetchInstagram(acc.account_id, acc.access_token);
        } else if (acc.platform === "tiktok") {
          count = await fetchTikTok(acc.access_token);
        }
        const syncedAt = new Date().toISOString();
        await supabase
          .from("social_accounts")
          .update({ follower_count: count, last_synced_at: syncedAt })
          .eq("id", acc.id);
        results[acc.platform] = {
          username: acc.username,
          count,
          lastSynced: syncedAt,
          status: "live",
        };
      } catch (e) {
        results[acc.platform] = {
          username: acc.username,
          count: acc.follower_count,
          lastSynced: acc.last_synced_at,
          status: "error",
          error: e instanceof Error ? e.message : String(e),
        };
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
