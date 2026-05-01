import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Music2, RefreshCw, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const HANDLE = "davidariasdigital";

interface Result {
  username: string;
  count: number | null;
  lastSynced: string | null;
  status: "live" | "cached" | "no_token" | "error";
  error?: string;
}

const formatNumber = (n: number | null) => {
  if (n === null || n === undefined) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
};

const timeAgo = (iso: string | null) => {
  if (!iso) return "nunca";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return new Date(iso).toLocaleDateString("es");
};

const LiveFollowersCard = () => {
  const [results, setResults] = useState<Record<string, Result>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const ensureAccounts = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    // upsert placeholder rows so the username shows up; tokens added later
    await supabase.from("social_accounts").upsert(
      [
        { user_id: session.user.id, platform: "instagram", username: HANDLE },
        { user_id: session.user.id, platform: "tiktok", username: HANDLE },
      ],
      { onConflict: "user_id,platform", ignoreDuplicates: true },
    );
  }, []);

  const load = useCallback(async (force = false) => {
    if (force) setRefreshing(true);
    const { data, error } = await supabase.functions.invoke("fetch-followers", {
      body: { force },
    });
    if (error) {
      toast.error("No se pudo consultar seguidores");
    } else if (data?.results) {
      setResults(data.results);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    (async () => {
      await ensureAccounts();
      await load(false);
    })();
  }, [ensureAccounts, load]);

  const platforms = [
    { key: "instagram", name: "Instagram", Icon: Instagram, accent: "text-pink-500", ring: "ring-pink-500/20" },
    { key: "tiktok", name: "TikTok", Icon: Music2, accent: "text-[hsl(var(--dash-text))]", ring: "ring-[hsl(var(--dash-text))]/15" },
  ] as const;

  return (
    <div className="dash-tile rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">
            Seguidores en vivo
          </h3>
          <p className="text-[11px] text-[hsl(var(--dash-text-muted))] mt-1">
            Actualizado {Object.values(results)[0]?.lastSynced ? timeAgo(Object.values(results)[0].lastSynced) : "—"}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[hsl(0,0%,96%)] hover:bg-[hsl(0,0%,92%)] transition-colors disabled:opacity-50"
          aria-label="Actualizar"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[hsl(var(--dash-text))] ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-2.5">
        {platforms.map(({ key, name, Icon, accent, ring }) => {
          const r = results[key];
          const isError = r?.status === "error";
          const noToken = r?.status === "no_token" || (!loading && !r);
          return (
            <div
              key={key}
              className={`rounded-xl border border-[hsl(0,0%,92%)] bg-white/60 p-3 ring-1 ${ring}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(0,0%,96%)] ${accent} shrink-0`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[hsl(var(--dash-text))] truncate">
                      {name}
                    </div>
                    <div className="text-[10.5px] text-[hsl(var(--dash-text-muted))] truncate">
                      @{r?.username || HANDLE}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {loading ? (
                    <div className="h-5 w-12 bg-[hsl(0,0%,94%)] rounded animate-pulse" />
                  ) : (
                    <div className="flex items-center gap-1 justify-end">
                      <Users className="h-3 w-3 text-[hsl(var(--dash-text-muted))]" />
                      <span className="text-base font-bold tabular-nums text-[hsl(var(--dash-text))]">
                        {formatNumber(r?.count ?? null)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {noToken && !loading && (
                <div className="mt-2 flex items-start gap-1.5 text-[10.5px] text-amber-700 bg-amber-50 rounded-md px-2 py-1.5">
                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>Pendiente de conectar API oficial</span>
                </div>
              )}
              {isError && (
                <div className="mt-2 flex items-start gap-1.5 text-[10.5px] text-red-600 bg-red-50 rounded-md px-2 py-1.5">
                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                  <span className="truncate">{r?.error || "Error al consultar"}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveFollowersCard;
