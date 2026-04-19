import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Platform = "instagram" | "tiktok" | "solar";
const PLATFORMS: { id: Platform; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "solar", label: "Solar" },
];

interface Snapshot { id: string; platform: string; count: number; snapshot_date: string; }

const FollowerGrowthSection = () => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [tab, setTab] = useState<Platform>("instagram");
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState<Record<Platform, string>>({ instagram: "", tiktok: "", solar: "" });
  const [userId, setUserId] = useState<string | null>(null);

  const fetchSnapshots = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setUserId(session.user.id);
    const { data, error } = await supabase
      .from("follower_snapshots")
      .select("*")
      .order("snapshot_date", { ascending: true });
    if (error) { toast.error("Error cargando seguidores"); return; }
    setSnapshots((data as Snapshot[]) || []);
  }, []);

  useEffect(() => { fetchSnapshots(); }, [fetchSnapshots]);

  const chartData = useMemo(() => {
    const filtered = snapshots.filter((s) => s.platform === tab).slice(-30);
    return filtered.map((s) => ({
      date: new Date(s.snapshot_date).toLocaleDateString("es", { day: "numeric", month: "short" }),
      seguidores: s.count,
    }));
  }, [snapshots, tab]);

  const tableData = useMemo(() => {
    const filtered = snapshots.filter((s) => s.platform === tab).slice().reverse().slice(0, 8);
    return filtered.map((s, idx, arr) => {
      const prev = arr[idx + 1];
      const delta = prev ? s.count - prev.count : 0;
      return { ...s, delta };
    });
  }, [snapshots, tab]);

  const saveCounts = async () => {
    if (!userId) return;
    const today = new Date().toISOString().split("T")[0];
    const rows = (Object.entries(counts) as [Platform, string][])
      .filter(([, v]) => v.trim() !== "")
      .map(([platform, v]) => ({ user_id: userId, platform, count: parseInt(v, 10), snapshot_date: today }));
    if (rows.length === 0) { setOpen(false); return; }
    const { error } = await supabase.from("follower_snapshots").upsert(rows, { onConflict: "user_id,platform,snapshot_date" });
    if (error) { toast.error("Error al guardar"); return; }
    toast.success("Conteo registrado");
    setCounts({ instagram: "", tiktok: "", solar: "" });
    setOpen(false);
    fetchSnapshots();
  };

  return (
    <div className="dash-tile rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-base sm:text-lg font-display font-extrabold text-[hsl(var(--dash-text))]">Crecimiento de seguidores</h2>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" /> Registrar conteo
        </button>
      </div>

      {/* Tabs */}
      <div className="inline-flex gap-1 p-1 rounded-full bg-[hsl(0,0%,96%)] border border-[hsl(var(--dash-card-border))] mb-4">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setTab(p.id)}
            className={tab === p.id
              ? "bg-[hsl(var(--dash-card-bg))] text-[hsl(var(--dash-text))] shadow-sm rounded-full px-4 py-1.5 text-xs font-bold"
              : "text-[hsl(var(--dash-text-muted))] rounded-full px-4 py-1.5 text-xs font-semibold"}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[220px] -ml-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[hsl(var(--dash-text-muted))]">
            Aún no hay datos. Registra tu primer conteo.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--dash-card-border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--dash-card-border))" }} />
              <Area type="monotone" dataKey="seguidores" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#growthGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Table */}
      {tableData.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-[hsl(var(--dash-text-muted))]">
                <th className="py-2 font-semibold">Fecha</th>
                <th className="py-2 font-semibold text-right">Seguidores</th>
                <th className="py-2 font-semibold text-right">Δ</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((r) => (
                <tr key={r.id} className="border-t border-[hsl(var(--dash-card-border))]">
                  <td className="py-2 text-[hsl(var(--dash-text))]">{new Date(r.snapshot_date).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="py-2 text-right tabular-nums font-semibold text-[hsl(var(--dash-text))]">{r.count.toLocaleString()}</td>
                  <td className={`py-2 text-right tabular-nums font-semibold ${r.delta > 0 ? "text-emerald-600" : r.delta < 0 ? "text-red-500" : "text-[hsl(var(--dash-text-muted))]"}`}>
                    <span className="inline-flex items-center gap-1">
                      {r.delta > 0 && <TrendingUp className="h-3 w-3" />}
                      {r.delta < 0 && <TrendingDown className="h-3 w-3" />}
                      {r.delta > 0 ? "+" : ""}{r.delta}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white text-gray-900 sm:max-w-md">
          <DialogHeader><DialogTitle>Registrar conteo de hoy</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {PLATFORMS.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-gray-700">{p.label}</label>
                <Input
                  type="number" min={0} placeholder="0"
                  value={counts[p.id]}
                  onChange={(e) => setCounts({ ...counts, [p.id]: e.target.value })}
                  className="w-32 text-right"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={saveCounts}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FollowerGrowthSection;
