import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Briefcase, Film, Smartphone, Star, Calendar as CalIcon, Check } from "lucide-react";

interface Priority {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  sort_order: number;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  priority_id: string | null;
  color: string;
}

const ICONS: Record<string, any> = {
  briefcase: Briefcase,
  film: Film,
  smartphone: Smartphone,
  star: Star,
  calendar: CalIcon,
};

const ICON_KEYS = ["briefcase", "film", "smartphone", "star", "calendar"];

const tileStyles: Record<string, { bg: string; border: string; text: string; label: string; icon: string; chipBg: string; chipText: string; dot: string }> = {
  primary: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", label: "text-amber-600", icon: "text-amber-500", chipBg: "bg-amber-100/70", chipText: "text-amber-800", dot: "bg-amber-400" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", label: "text-blue-600", icon: "text-blue-500", chipBg: "bg-blue-100/70", chipText: "text-blue-800", dot: "bg-blue-400" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-900", label: "text-green-600", icon: "text-green-500", chipBg: "bg-green-100/70", chipText: "text-green-800", dot: "bg-green-400" },
  red: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-900", label: "text-pink-600", icon: "text-pink-500", chipBg: "bg-pink-100/70", chipText: "text-pink-800", dot: "bg-pink-400" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-900", label: "text-purple-600", icon: "text-purple-500", chipBg: "bg-purple-100/70", chipText: "text-purple-800", dot: "bg-purple-400" },
};

const COLOR_KEYS = ["primary", "blue", "green", "red", "purple"];

const DEFAULTS = [
  { title: "Colombina", description: "", icon: "briefcase", color: "red", sort_order: 0 },
  { title: "Solar", description: "", icon: "film", color: "primary", sort_order: 1 },
  { title: "Digital", description: "", icon: "smartphone", color: "blue", sort_order: 2 },
];

const SLOTS = 3;

const formatDue = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" });

const PrioritiesSection = () => {
  const [items, setItems] = useState<Priority[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, { title: string; due_date: string }>>({});
  const [activeInput, setActiveInput] = useState<string | null>(null); // priority.id

  const fetchAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    let { data: priorities } = await supabase
      .from("priorities")
      .select("*")
      .order("sort_order", { ascending: true });

    if (priorities && priorities.length === 0) {
      const seeded = DEFAULTS.map(d => ({ ...d, user_id: user.id }));
      const { data: inserted } = await supabase.from("priorities").insert(seeded).select();
      priorities = inserted ?? [];
    }

    const { data: taskData } = await supabase
      .from("tasks")
      .select("id, title, completed, due_date, priority_id, color")
      .eq("completed", false)
      .order("due_date", { ascending: true, nullsFirst: false });

    setItems((priorities ?? []) as Priority[]);
    setTasks((taskData ?? []) as Task[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const updateTitle = async (id: string, value: string) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, title: value } : p));
    await supabase.from("priorities").update({ title: value } as any).eq("id", id);
  };

  const cycleColor = async (item: Priority) => {
    const idx = COLOR_KEYS.indexOf(item.color);
    const next = COLOR_KEYS[(idx + 1) % COLOR_KEYS.length];
    setItems(prev => prev.map(p => p.id === item.id ? { ...p, color: next } : p));
    await supabase.from("priorities").update({ color: next } as any).eq("id", item.id);
  };

  const cycleIcon = async (item: Priority) => {
    const idx = ICON_KEYS.indexOf(item.icon);
    const next = ICON_KEYS[(idx + 1) % ICON_KEYS.length];
    setItems(prev => prev.map(p => p.id === item.id ? { ...p, icon: next } : p));
    await supabase.from("priorities").update({ icon: next } as any).eq("id", item.id);
  };

  const addPriority = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("priorities").insert({
      user_id: user.id,
      title: "Nueva prioridad",
      description: "",
      icon: "star",
      color: "purple",
      sort_order: items.length,
    } as any).select().single();
    if (data) setItems(prev => [...prev, data as Priority]);
  };

  const removePriority = async (id: string) => {
    setItems(prev => prev.filter(p => p.id !== id));
    await supabase.from("priorities").delete().eq("id", id);
  };

  const tasksFor = (priorityId: string) =>
    tasks.filter(t => t.priority_id === priorityId).slice(0, SLOTS);

  const setDraft = (pid: string, patch: Partial<{ title: string; due_date: string }>) =>
    setDrafts(prev => ({ ...prev, [pid]: { title: "", due_date: "", ...prev[pid], ...patch } }));

  const submitTask = async (priority: Priority) => {
    const draft = drafts[priority.id];
    if (!draft?.title?.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("tasks").insert({
      title: draft.title.trim(),
      due_date: draft.due_date || null,
      priority_id: priority.id,
      color: priority.color,
      user_id: user.id,
    } as any).select().single();
    if (data) setTasks(prev => [...prev, data as Task]);
    setDrafts(prev => ({ ...prev, [priority.id]: { title: "", due_date: "" } }));
    setActiveInput(null);
  };

  const completeTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await supabase.from("tasks").update({ completed: true } as any).eq("id", id);
  };

  return (
    <div className="dash-tile rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">Prioridades & Pendientes</p>
          <p className="text-[10px] text-[hsl(var(--dash-text-muted))] italic mt-0.5">Hasta {SLOTS} tareas pendientes por prioridad</p>
        </div>
        <button
          onClick={addPriority}
          className="p-1.5 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors"
          title="Agregar prioridad"
        >
          <Plus size={14} />
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[hsl(var(--dash-text-muted))] text-center py-6">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[hsl(var(--dash-text-muted))] text-center py-6">Sin prioridades. Agrega una para empezar.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => {
            const style = tileStyles[item.color] ?? tileStyles.primary;
            const Icon = ICONS[item.icon] ?? Briefcase;
            const pTasks = tasksFor(item.id);
            const emptySlots = Math.max(0, SLOTS - pTasks.length);
            const draft = drafts[item.id] ?? { title: "", due_date: "" };
            const isAdding = activeInput === item.id;

            return (
              <div
                key={item.id}
                className={`${style.bg} ${style.border} border rounded-2xl p-4 group relative transition-shadow hover:shadow-md flex flex-col`}
              >
                <button
                  onClick={() => removePriority(item.id)}
                  title="Eliminar prioridad"
                  className="absolute top-2 right-2 p-1 rounded-md bg-white/60 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X size={10} className={style.text} />
                </button>

                {/* Header: icon + title */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => cycleIcon(item)}
                    title="Cambiar icono"
                    className={`${style.icon} hover:scale-110 transition-transform shrink-0`}
                  >
                    <Icon size={18} />
                  </button>
                  <input
                    value={item.title}
                    onChange={(e) => setItems(prev => prev.map(p => p.id === item.id ? { ...p, title: e.target.value } : p))}
                    onBlur={(e) => updateTitle(item.id, e.target.value)}
                    className={`bg-transparent border-none outline-none uppercase tracking-wide text-sm font-bold ${style.text} flex-1 focus:bg-white/50 rounded px-1 -mx-1 transition-colors`}
                  />
                  <button
                    onClick={() => cycleColor(item)}
                    title="Cambiar color"
                    className={`w-3 h-3 rounded-full ${style.dot} opacity-0 group-hover:opacity-100 transition-opacity shrink-0`}
                  />
                </div>

                {/* Task slots */}
                <div className="space-y-1.5 flex-1">
                  {pTasks.map((t) => (
                    <div
                      key={t.id}
                      className={`${style.chipBg} rounded-lg px-2.5 py-1.5 flex items-center gap-2 group/task`}
                    >
                      <button
                        onClick={() => completeTask(t.id)}
                        title="Completar"
                        className="w-3.5 h-3.5 rounded border border-current/40 hover:bg-white flex items-center justify-center shrink-0"
                      >
                        <Check size={9} className={`${style.chipText} opacity-0 group-hover/task:opacity-100`} />
                      </button>
                      <p className={`text-[11px] font-semibold leading-tight ${style.chipText} flex-1 truncate`}>
                        {t.title}
                      </p>
                      {t.due_date && (
                        <span className={`text-[9px] font-bold ${style.chipText} opacity-70 shrink-0`}>
                          {formatDue(t.due_date)}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Empty slot placeholders */}
                  {!isAdding && Array.from({ length: emptySlots }).map((_, idx) => (
                    <button
                      key={`empty-${idx}`}
                      onClick={() => { setActiveInput(item.id); setDraft(item.id, {}); }}
                      className={`w-full rounded-lg px-2.5 py-1.5 flex items-center gap-2 border border-dashed border-current/20 ${style.label} opacity-40 hover:opacity-100 hover:bg-white/40 transition-all`}
                    >
                      <Plus size={10} />
                      <span className="text-[10px] font-medium">Añadir tarea</span>
                    </button>
                  ))}

                  {/* Inline add form */}
                  {isAdding && (
                    <div className={`bg-white/70 rounded-lg p-2 space-y-1.5 border ${style.border}`}>
                      <input
                        autoFocus
                        placeholder="Título de la tarea"
                        value={draft.title}
                        onChange={(e) => setDraft(item.id, { title: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitTask(item);
                          if (e.key === "Escape") { setActiveInput(null); }
                        }}
                        className={`w-full bg-transparent text-[11px] font-semibold outline-none ${style.text} placeholder:opacity-40`}
                      />
                      <div className="flex items-center gap-1.5">
                        <input
                          type="date"
                          value={draft.due_date}
                          onChange={(e) => setDraft(item.id, { due_date: e.target.value })}
                          className={`flex-1 bg-white/60 rounded px-1.5 py-0.5 text-[10px] outline-none ${style.text}`}
                        />
                        <button
                          onClick={() => submitTask(item)}
                          disabled={!draft.title.trim()}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${style.chipBg} ${style.chipText} disabled:opacity-30`}
                        >
                          Crear
                        </button>
                        <button
                          onClick={() => setActiveInput(null)}
                          className="p-0.5 rounded text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PrioritiesSection;
