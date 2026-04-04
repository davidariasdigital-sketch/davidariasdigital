import { useEffect, useState, useRef, DragEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Clock, X, Check, CalendarIcon } from "lucide-react";
import MonthlyCalendar from "./MonthlyCalendar";

type View = "overview" | "clients" | "quotations" | "invoices" | "content-planner";

interface Props {
  onNavigate: (view: View) => void;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  priority: string;
  category: string;
  estimated_time: number | null;
  color: string;
}

const COLORS = [
  { value: "primary", label: "Mostaza" },
  { value: "blue", label: "Azul" },
  { value: "green", label: "Verde" },
  { value: "red", label: "Rojo" },
  { value: "purple", label: "Morado" },
];

const colorClasses: Record<string, string> = {
  primary: "bg-amber-100 text-amber-800 border-amber-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  green: "bg-green-100 text-green-800 border-green-200",
  red: "bg-pink-100 text-pink-800 border-pink-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
};

const tileStyles: Record<string, { bg: string; border: string; text: string; label: string }> = {
  primary: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", label: "text-amber-500" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", label: "text-blue-400" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-900", label: "text-green-500" },
  red: { bg: "bg-pink-100", border: "border-pink-200", text: "text-pink-900", label: "text-pink-400" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-900", label: "text-purple-400" },
};

const colorDots: Record<string, string> = {
  primary: "bg-amber-400",
  blue: "bg-blue-400",
  green: "bg-green-400",
  red: "bg-pink-400",
  purple: "bg-purple-400",
};

const OverviewView = ({ onNavigate }: Props) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [form, setForm] = useState({ title: "", estimated_time: "", color: "primary", due_date: "" });
  const popupRef = useRef<HTMLDivElement>(null);

  const fetchTasks = async () => {
    const t = await supabase.from("tasks").select("*").eq("completed", false).order("due_date", { ascending: true }).limit(9);
    if (t.data) setTasks(t.data as Task[]);
  };

  useEffect(() => { fetchTasks(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setShowAddPopup(false);
    };
    if (showAddPopup) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAddPopup]);

  const toggleTask = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await supabase.from("tasks").update({ completed: true } as any).eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addTask = async () => {
    if (!form.title.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("tasks").insert({
      title: form.title.trim(),
      user_id: user.id,
      color: form.color,
      estimated_time: form.estimated_time ? parseInt(form.estimated_time) : null,
      due_date: form.due_date || null,
    } as any);
    setForm({ title: "", estimated_time: "", color: "primary", due_date: "" });
    setShowAddPopup(false);
    fetchTasks();
  };

  const onTaskDragStart = (e: DragEvent, task: Task) => {
    e.dataTransfer.setData("taskDrag", JSON.stringify(task));
    e.dataTransfer.effectAllowed = "copy";
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  };

  const inputCls = "w-full dash-input rounded-lg px-3 py-2 text-sm";

  return (
    <div className="space-y-4">
      <MonthlyCalendar />

      {/* Actividades pendientes — grid */}
      <div className="dash-tile rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">Actividades Pendientes</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary">{tasks.length}</span>
            <button onClick={() => setShowAddPopup(true)} className="p-1 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors">
              <Plus size={14} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-[hsl(var(--dash-text-muted))] mb-4 italic">Arrastra una actividad al calendario para agendarla</p>

        {tasks.length === 0 ? (
          <p className="text-sm text-[hsl(var(--dash-text-muted))] text-center py-6">Sin actividades pendientes 🎉</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tasks.map((task) => {
              const style = tileStyles[task.color] ?? tileStyles.primary;
              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => onTaskDragStart(e, task)}
                  className={`${style.bg} ${style.border} border rounded-xl p-3 flex flex-col justify-between cursor-grab active:cursor-grabbing group relative transition-shadow hover:shadow-md min-h-[90px]`}
                >
                  {/* Complete button */}
                  <button
                    onClick={(e) => toggleTask(task.id, e)}
                    title="Completar"
                    className="absolute top-2 right-2 p-1 rounded-md bg-white/60 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Check size={10} className={style.text} />
                  </button>

                  <p className={`text-[11px] sm:text-xs font-bold leading-tight ${style.text} pr-6`}>
                    {task.title}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {task.due_date && (
                      <span className={`text-[9px] font-semibold ${style.label} flex items-center gap-0.5`}>
                        <CalendarIcon size={8} />
                        {new Date(task.due_date + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                      </span>
                    )}
                    {task.estimated_time && (
                      <span className={`text-[9px] font-semibold ${style.label} flex items-center gap-0.5`}>
                        <Clock size={8} /> {formatTime(task.estimated_time)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add task popup */}
      {showAddPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div ref={popupRef} className="bg-[hsl(var(--dash-card-bg))] rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--dash-card-border))]">
              <h3 className="font-display font-bold text-[hsl(var(--dash-text))]">Nueva Actividad</h3>
              <button onClick={() => setShowAddPopup(false)} className="p-1.5 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <input
                autoFocus
                placeholder="Título *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputCls}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="1"
                  placeholder="Min. estimados"
                  value={form.estimated_time}
                  onChange={(e) => setForm({ ...form, estimated_time: e.target.value })}
                  className={inputCls}
                />
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[hsl(var(--dash-text-muted))]">Color:</span>
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setForm({ ...form, color: c.value })}
                    className={`w-6 h-6 rounded-full ${colorDots[c.value]} transition-transform ${form.color === c.value ? "ring-2 ring-[hsl(var(--dash-text))] scale-110" : "opacity-40 hover:opacity-70"}`}
                    title={c.label}
                  />
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={addTask} disabled={!form.title.trim()} className="btn-dark text-sm px-5 py-2.5 disabled:opacity-40">
                  Crear
                </button>
                <button onClick={() => setShowAddPopup(false)} className="text-sm px-4 py-2.5 rounded-full text-[hsl(var(--dash-text-muted))] hover:bg-[hsl(0,0%,96%)] transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewView;
