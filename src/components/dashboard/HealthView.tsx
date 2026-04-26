import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Apple, CalendarDays, Check, ChevronLeft, ChevronRight, Dumbbell, Plus, Scale, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type RoutineType = "food" | "exercise";

interface WeightEntry {
  id: string;
  entry_date: string;
  weight_kg: number;
  notes: string | null;
}

interface RoutineItem {
  id: string;
  routine_type: RoutineType;
  title: string;
  description: string | null;
  completed: boolean;
  sort_order: number;
}

interface TrainingDay {
  id: string;
  training_date: string;
}

const INITIAL_WEIGHTS = [
  ["2022-12-19", 70.3],
  ["2023-01-03", 70.2], ["2023-01-14", 70.3], ["2023-01-29", 70.1], ["2023-02-11", 70.4], ["2023-03-10", 70.3], ["2023-04-01", 70.7], ["2023-08-26", 72.8], ["2023-09-07", 73], ["2023-09-26", 71],
  ["2024-02-04", 64], ["2024-03-09", 65.1], ["2024-03-28", 67.8], ["2024-06-27", 65.2], ["2024-08-09", 64.4], ["2024-09-14", 65.5], ["2024-10-08", 66.5], ["2024-11-05", 64.2], ["2024-12-05", 66.6],
  ["2025-01-02", 67.1], ["2025-03-01", 69], ["2025-05-07", 68.9], ["2025-06-02", 68.1], ["2025-07-06", 70.2], ["2025-08-02", 68.6], ["2025-09-01", 69.4], ["2025-10-07", 70.8], ["2025-11-03", 70],
  ["2026-01-04", 68], ["2026-02-05", 68.6], ["2026-03-10", 68],
] as const;

const DEFAULT_ROUTINES: Record<RoutineType, string[]> = {
  food: ["Desayuno alto en proteína", "Almuerzo balanceado", "Agua durante el día"],
  exercise: ["Entrenamiento de fuerza", "Cardio suave", "Movilidad o estiramiento"],
};

const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });
const formatWeight = (value: number) => `${Number(value).toFixed(1)} kg`;
const toISODate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const WEEK_DAYS = ["L", "M", "X", "J", "V", "S", "D"];

const HealthView = () => {
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [trainingMonth, setTrainingMonth] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [weightForm, setWeightForm] = useState({ entry_date: new Date().toISOString().slice(0, 10), weight_kg: "" });
  const [routineDrafts, setRoutineDrafts] = useState<Record<RoutineType, string>>({ food: "", exercise: "" });

  const fetchHealth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setUserId(session.user.id);
    const { data: weightData, error: weightError } = await supabase
      .from("health_weight_entries" as any)
      .select("id, entry_date, weight_kg, notes")
      .order("entry_date", { ascending: true });

    if (weightError) {
      toast.error("Error cargando salud");
      setLoading(false);
      return;
    }

    if (!weightData || weightData.length === 0) {
      const seedRows = INITIAL_WEIGHTS.map(([entry_date, weight_kg]) => ({ user_id: session.user.id, entry_date, weight_kg, notes: "Historial inicial" }));
      const { error } = await supabase.from("health_weight_entries" as any).upsert(seedRows, { onConflict: "user_id,entry_date" });
      if (error) toast.error("No se pudo cargar el historial inicial");
    }

    const { data: routineData } = await supabase
      .from("health_routine_items" as any)
      .select("id, routine_type, title, description, completed, sort_order")
      .order("sort_order", { ascending: true });

    if (!routineData || routineData.length === 0) {
      const defaults = (Object.entries(DEFAULT_ROUTINES) as [RoutineType, string[]][]).flatMap(([routine_type, titles]) =>
        titles.map((title, sort_order) => ({ user_id: session.user.id, routine_type, title, sort_order }))
      );
      await supabase.from("health_routine_items" as any).insert(defaults);
    }

    const [freshWeights, freshRoutines, freshTrainingDays] = await Promise.all([
      supabase.from("health_weight_entries" as any).select("id, entry_date, weight_kg, notes").order("entry_date", { ascending: true }),
      supabase.from("health_routine_items" as any).select("id, routine_type, title, description, completed, sort_order").order("sort_order", { ascending: true }),
      supabase.from("health_training_days" as any).select("id, training_date").order("training_date", { ascending: true }),
    ]);

    setWeights(((freshWeights.data || []) as any[]).map((w) => ({ ...w, weight_kg: Number(w.weight_kg) })) as WeightEntry[]);
    setRoutines((freshRoutines.data || []) as unknown as RoutineItem[]);
    setTrainingDays((freshTrainingDays.data || []) as unknown as TrainingDay[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  const stats = useMemo(() => {
    const first = weights[0];
    const latest = weights[weights.length - 1];
    const previous = weights[weights.length - 2];
    const recent = weights.slice(-6);
    const recentAvg = recent.length ? recent.reduce((sum, item) => sum + item.weight_kg, 0) / recent.length : 0;
    return {
      current: latest?.weight_kg ?? 0,
      totalChange: latest && first ? latest.weight_kg - first.weight_kg : 0,
      lastChange: latest && previous ? latest.weight_kg - previous.weight_kg : 0,
      recentAvg,
      latestDate: latest?.entry_date,
    };
  }, [weights]);

  const chartData = useMemo(() => weights.map((item) => ({
    date: new Date(`${item.entry_date}T00:00:00`).toLocaleDateString("es", { month: "short", year: "2-digit" }),
    peso: Number(item.weight_kg.toFixed(1)),
  })), [weights]);

  const saveWeight = async () => {
    if (!userId) return;
    const weight = Number(weightForm.weight_kg.replace(",", "."));
    if (!weightForm.entry_date || !Number.isFinite(weight) || weight <= 0 || weight >= 400) {
      toast.error("Ingresa una fecha y un peso válido");
      return;
    }

    const { error } = await supabase.from("health_weight_entries" as any).upsert(
      { user_id: userId, entry_date: weightForm.entry_date, weight_kg: weight, notes: "Registro manual" },
      { onConflict: "user_id,entry_date" }
    );

    if (error) { toast.error("Error al guardar el peso"); return; }
    toast.success("Peso guardado");
    setWeightForm({ entry_date: new Date().toISOString().slice(0, 10), weight_kg: "" });
    fetchHealth();
  };

  const addRoutine = async (routine_type: RoutineType) => {
    if (!userId) return;
    const title = routineDrafts[routine_type].trim().slice(0, 120);
    if (!title) return;
    const sort_order = routines.filter((item) => item.routine_type === routine_type).length;
    const { error } = await supabase.from("health_routine_items" as any).insert({ user_id: userId, routine_type, title, sort_order });
    if (error) { toast.error("Error al añadir rutina"); return; }
    setRoutineDrafts((prev) => ({ ...prev, [routine_type]: "" }));
    fetchHealth();
  };

  const toggleRoutine = async (item: RoutineItem) => {
    await supabase.from("health_routine_items" as any).update({ completed: !item.completed }).eq("id", item.id);
    setRoutines((prev) => prev.map((r) => r.id === item.id ? { ...r, completed: !r.completed } : r));
  };

  const deleteRoutine = async (id: string) => {
    await supabase.from("health_routine_items" as any).delete().eq("id", id);
    setRoutines((prev) => prev.filter((item) => item.id !== id));
  };

  const RoutineCard = ({ type, title, icon: Icon }: { type: RoutineType; title: string; icon: typeof Apple }) => {
    const items = routines.filter((item) => item.routine_type === type);
    return (
      <div className="dash-tile rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[hsl(var(--primary)/0.18)] text-[hsl(var(--primary-foreground))] flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </div>
          <h2 className="font-display font-extrabold text-[hsl(var(--dash-text))]">{title}</h2>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-xl border border-[hsl(var(--dash-card-border))] bg-[hsl(0_0%_98%)] px-3 py-2">
              <button onClick={() => toggleRoutine(item)} className={`w-6 h-6 shrink-0 rounded-full border flex items-center justify-center transition-colors ${item.completed ? "bg-[hsl(var(--primary))] border-[hsl(var(--primary))]" : "border-[hsl(var(--dash-card-border))]"}`}>
                {item.completed && <Check className="h-3.5 w-3.5 text-[hsl(var(--primary-foreground))]" strokeWidth={3} />}
              </button>
              <span className={`flex-1 text-sm text-[hsl(var(--dash-text))] ${item.completed ? "line-through opacity-60" : ""}`}>{item.title}</span>
              <button onClick={() => deleteRoutine(item.id)} className="p-1.5 rounded-lg text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(0_0%_94%)] transition-colors" aria-label="Eliminar">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <input
            value={routineDrafts[type]}
            onChange={(e) => setRoutineDrafts((prev) => ({ ...prev, [type]: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter") addRoutine(type); }}
            placeholder="Añadir elemento"
            maxLength={120}
            className="dash-input rounded-xl px-3 py-2 text-sm w-full"
          />
          <button onClick={() => addRoutine(type)} className="w-10 h-10 shrink-0 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center justify-center hover:opacity-90 transition-opacity" aria-label="Añadir">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-extrabold text-[hsl(var(--dash-text))]">Salud</h1>
        <p className="text-xs sm:text-sm text-[hsl(var(--dash-text-muted))] mt-0.5">Peso, estadísticas y rutinas de comida y ejercicio.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Peso actual", value: formatWeight(stats.current), sub: stats.latestDate ? formatDate(stats.latestDate) : "Sin registros", icon: Scale },
          { label: "Cambio total", value: `${stats.totalChange > 0 ? "+" : ""}${stats.totalChange.toFixed(1)} kg`, sub: "Desde 2022", icon: stats.totalChange > 0 ? TrendingUp : TrendingDown },
          { label: "Último cambio", value: `${stats.lastChange > 0 ? "+" : ""}${stats.lastChange.toFixed(1)} kg`, sub: "Vs registro anterior", icon: Activity },
          { label: "Promedio reciente", value: formatWeight(stats.recentAvg), sub: "Últimos 6 registros", icon: CalendarDays },
        ].map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="dash-tile rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[hsl(var(--dash-text-muted))]">{label}</p>
                <p className="mt-2 text-xl sm:text-2xl font-display font-extrabold text-[hsl(var(--dash-text))] tabular-nums">{value}</p>
                <p className="mt-1 text-xs text-[hsl(var(--dash-text-muted))]">{sub}</p>
              </div>
              <Icon className="h-5 w-5 text-[hsl(var(--primary-foreground))]" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4 sm:gap-5 items-start">
        <div className="dash-tile rounded-2xl p-4 sm:p-5 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-display font-extrabold text-[hsl(var(--dash-text))]">Evolución de peso</h2>
            <span className="text-xs font-semibold text-[hsl(var(--dash-text-muted))]">{weights.length} registros</span>
          </div>
          <div className="h-[260px] sm:h-[320px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="healthWeightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--dash-card-border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={38} domain={["dataMin - 1", "dataMax + 1"]} />
                <Tooltip formatter={(value) => [`${value} kg`, "Peso"]} contentStyle={{ fontSize: 11, borderRadius: 10, border: "1px solid hsl(var(--dash-card-border))" }} />
                <Area type="monotone" dataKey="peso" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#healthWeightGradient)" dot={{ r: 2 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <aside className="dash-tile rounded-2xl p-4 sm:p-5">
          <h2 className="font-display font-extrabold text-[hsl(var(--dash-text))] mb-4">Registrar peso mensual</h2>
          <div className="space-y-3">
            <input type="date" value={weightForm.entry_date} onChange={(e) => setWeightForm({ ...weightForm, entry_date: e.target.value })} className="dash-input rounded-xl px-3 py-2 text-sm w-full" />
            <div className="relative">
              <input type="number" min="1" max="399" step="0.1" value={weightForm.weight_kg} onChange={(e) => setWeightForm({ ...weightForm, weight_kg: e.target.value })} placeholder="68.0" className="dash-input rounded-xl px-3 py-2 pr-10 text-sm w-full" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[hsl(var(--dash-text-muted))]">kg</span>
            </div>
            <button onClick={saveWeight} className="w-full rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity">Guardar peso</button>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <RoutineCard type="food" title="Rutina de comida" icon={Apple} />
        <RoutineCard type="exercise" title="Rutina de ejercicios" icon={Dumbbell} />
      </div>

      <div className="dash-tile rounded-2xl p-4 sm:p-5">
        <h2 className="font-display font-extrabold text-[hsl(var(--dash-text))] mb-3">Historial de pesajes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-[hsl(var(--dash-text-muted))]">
                <th className="py-2 font-bold">Fecha</th>
                <th className="py-2 font-bold text-right">Peso</th>
                <th className="py-2 font-bold text-right">Cambio</th>
              </tr>
            </thead>
            <tbody>
              {weights.slice().reverse().map((item, index, arr) => {
                const previous = arr[index + 1];
                const delta = previous ? item.weight_kg - previous.weight_kg : 0;
                return (
                  <tr key={item.id} className="border-t border-[hsl(var(--dash-card-border))]">
                    <td className="py-2.5 text-[hsl(var(--dash-text))]">{formatDate(item.entry_date)}</td>
                    <td className="py-2.5 text-right tabular-nums font-bold text-[hsl(var(--dash-text))]">{formatWeight(item.weight_kg)}</td>
                    <td className={`py-2.5 text-right tabular-nums font-bold ${delta > 0 ? "text-[hsl(12_70%_45%)]" : delta < 0 ? "text-[hsl(150_55%_34%)]" : "text-[hsl(var(--dash-text-muted))]"}`}>{delta > 0 ? "+" : ""}{delta.toFixed(1)} kg</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HealthView;