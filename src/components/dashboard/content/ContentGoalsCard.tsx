import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ContentItem } from "./PlannerGrid";

interface Goals { ig_goal: number; tiktok_goal: number; solar_goal: number; ideas_goal: number; }

const DEFAULT_GOALS: Goals = { ig_goal: 15, tiktok_goal: 10, solar_goal: 3, ideas_goal: 20 };

const ContentGoalsCard = ({ items }: { items: ContentItem[] }) => {
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Goals>(DEFAULT_GOALS);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);
      const { data } = await supabase.from("content_goals").select("*").eq("user_id", session.user.id).maybeSingle();
      if (data) {
        const g = { ig_goal: data.ig_goal, tiktok_goal: data.tiktok_goal, solar_goal: data.solar_goal, ideas_goal: data.ideas_goal };
        setGoals(g); setDraft(g);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const inMonth = (i: ContentItem) => true; // count all current planner items as monthly
    const ig = items.filter((i) => i.month === "IG" && i.published && inMonth(i)).length;
    const tt = items.filter((i) => i.month === "TIKTOK" && i.published && inMonth(i)).length;
    const sol = items.filter((i) => i.month === "SOLAR" && i.published && inMonth(i)).length;
    const ideas = items.filter((i) => i.month === "IDEAS").length;
    const published = items.filter((i) => i.published).length;
    const queue = items.filter((i) => !i.published && !i.is_idea).length;
    const total = published + queue;
    const rate = total > 0 ? Math.round((published / total) * 100) : 0;
    return { ig, tt, sol, ideas, published, queue, rate };
  }, [items]);

  const save = async () => {
    if (!userId) return;
    const { error } = await supabase.from("content_goals").upsert({ user_id: userId, ...draft });
    if (error) { toast.error("Error al guardar metas"); return; }
    setGoals(draft);
    setOpen(false);
    toast.success("Metas actualizadas");
  };

  return (
    <>
      {/* KPIs 2x2 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Kpi label="Publicados" value={stats.published} />
        <Kpi label="En cola" value={stats.queue} />
        <Kpi label="Ideas" value={stats.ideas} />
        <Kpi label="Tasa pub." value={`${stats.rate}%`} />
      </div>

      {/* Metas */}
      <div className="dash-tile rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">Metas del mes</h3>
          <button onClick={() => { setDraft(goals); setOpen(true); }} className="rounded-full p-1.5 hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))]">
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
        <GoalBar label="Instagram" current={stats.ig} target={goals.ig_goal} color="bg-pink-400" />
        <GoalBar label="TikTok" current={stats.tt} target={goals.tiktok_goal} color="bg-[hsl(var(--dash-text))]" />
        <GoalBar label="Solar" current={stats.sol} target={goals.solar_goal} color="bg-orange-400" />
        <GoalBar label="Ideas" current={stats.ideas} target={goals.ideas_goal} color="bg-amber-400" />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white text-gray-900 sm:max-w-md">
          <DialogHeader><DialogTitle>Editar metas mensuales</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { key: "ig_goal", label: "Instagram" },
              { key: "tiktok_goal", label: "TikTok" },
              { key: "solar_goal", label: "Solar" },
              { key: "ideas_goal", label: "Ideas" },
            ].map((f) => (
              <div key={f.key} className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-gray-700">{f.label}</label>
                <Input
                  type="number" min={0}
                  value={(draft as any)[f.key]}
                  onChange={(e) => setDraft({ ...draft, [f.key]: parseInt(e.target.value || "0", 10) })}
                  className="w-24 text-right"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Kpi = ({ label, value }: { label: string; value: number | string }) => (
  <div className="dash-tile rounded-2xl p-3 sm:p-4">
    <div className="text-[10px] uppercase tracking-wider font-semibold text-[hsl(var(--dash-text-muted))]">{label}</div>
    <div className="text-2xl sm:text-3xl font-bold text-[hsl(var(--dash-text))] mt-1">{value}</div>
  </div>
);

const GoalBar = ({ label, current, target, color }: { label: string; current: number; target: number; color: string }) => {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="font-semibold text-[hsl(var(--dash-text))]">{label}</span>
        <span className="text-[hsl(var(--dash-text-muted))] tabular-nums">{current}/{target}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[hsl(0,0%,94%)] overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default ContentGoalsCard;
