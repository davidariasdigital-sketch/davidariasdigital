import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, CheckCircle2, Circle, Plus } from "lucide-react";
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
}

const OverviewView = ({ onNavigate }: Props) => {
  const [pendingAmount, setPendingAmount] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);

  const fetchTasks = async () => {
    const t = await supabase.from("tasks").select("*").eq("completed", false).order("due_date", { ascending: true }).limit(8);
    if (t.data) setTasks(t.data as Task[]);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [inv, t] = await Promise.all([
        supabase.from("invoices" as any).select("amount").eq("status", "pendiente"),
        supabase.from("tasks").select("*").eq("completed", false).order("due_date", { ascending: true }).limit(8),
      ]);
      const invData = (inv.data ?? []) as any[];
      setPendingAmount(invData.reduce((sum: number, i: any) => sum + Number(i.amount), 0));
      setPendingInvoices(invData.length);
      if (t.data) setTasks(t.data as Task[]);
    };
    fetchData();
  }, []);

  const toggleTask = async (id: string) => {
    await supabase.from("tasks").update({ completed: true } as any).eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("tasks").insert({ title: newTaskTitle.trim(), user_id: user.id } as any);
    setNewTaskTitle("");
    setShowAddTask(false);
    fetchTasks();
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addTask();
    if (e.key === "Escape") { setShowAddTask(false); setNewTaskTitle(""); }
  };

  const formatCOP = (v: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v);

  const priorityColors: Record<string, string> = {
    alta: "text-destructive",
    media: "text-amber-500",
    baja: "text-[hsl(var(--dash-text-muted))]",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_280px] gap-4 items-start">
      {/* Calendar left */}
      <MonthlyCalendar />

      {/* Right column */}
      <div className="space-y-4">
        {/* Por cobrar */}
        <button
          onClick={() => onNavigate("invoices")}
          className="dash-tile-primary rounded-2xl p-6 text-left w-full"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Por Cobrar</p>
            <DollarSign size={18} className="opacity-60" />
          </div>
          <p className="text-3xl font-display font-extrabold mt-3">{formatCOP(pendingAmount)}</p>
          <p className="text-xs mt-2 opacity-70">{pendingInvoices} cuenta{pendingInvoices !== 1 ? "s" : ""} pendiente{pendingInvoices !== 1 ? "s" : ""}</p>
          <div className="mt-4">
            <span className="btn-dark text-xs px-4 py-2 inline-block">Ver detalle</span>
          </div>
        </button>

        {/* Actividades pendientes */}
        <div className="dash-tile rounded-2xl p-6">
           <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">Actividades Pendientes</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary">{tasks.length}</span>
              <button onClick={() => setShowAddTask(true)} className="p-1 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="space-y-2.5">
            {tasks.length === 0 && (
              <p className="text-sm text-[hsl(var(--dash-text-muted))] text-center py-4">Sin actividades pendientes 🎉</p>
            )}
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-2.5 group">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 text-[hsl(var(--dash-text-muted))] hover:text-primary transition-colors shrink-0"
                >
                  <Circle size={16} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[hsl(var(--dash-text))] truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.due_date && (
                      <span className="text-[10px] text-[hsl(var(--dash-text-muted))]">
                        {new Date(task.due_date).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold uppercase ${priorityColors[task.priority] ?? ""}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {showAddTask && (
              <div className="flex items-center gap-2.5">
                <Circle size={16} className="text-[hsl(var(--dash-text-muted))] shrink-0 mt-0.5" />
                <input
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleAddKeyDown}
                  onBlur={() => { if (!newTaskTitle.trim()) { setShowAddTask(false); } }}
                  placeholder="Nueva actividad..."
                  className="flex-1 text-sm dash-input rounded-lg px-2 py-1"
                />
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
