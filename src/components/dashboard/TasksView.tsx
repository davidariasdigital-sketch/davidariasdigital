import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Trash2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  priority: string;
  category: string;
  project_id: string | null;
  created_at: string;
}

const categoryColors: Record<string, string> = {
  personal: "bg-blue-100 text-blue-700",
  laboral: "bg-amber-100 text-amber-700",
};

const TasksView = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "laboral", due_date: "", estimated_time: "" });

  const fetchTasks = async () => {
    const { data } = await supabase.from("tasks").select("*").order("completed").order("created_at", { ascending: false });
    if (data) setTasks(data as Task[]);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("tasks").insert({
      title: form.title,
      category: form.category,
      due_date: form.due_date || null,
      user_id: user.id,
    } as any);
    setForm({ title: "", category: "laboral", due_date: "" });
    setShowForm(false);
    fetchTasks();
  };

  const toggleComplete = async (t: Task) => {
    await supabase.from("tasks").update({ completed: !t.completed }).eq("id", t.id);
    fetchTasks();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    fetchTasks();
  };

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Tareas</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-full hover:shadow-lg transition-all">
          <Plus size={16} /> Nueva
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="liquid-glass rounded-[var(--radius)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Nueva tarea</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título *" className="md:col-span-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="laboral">Laboral</option>
              <option value="personal">Personal</option>
            </select>
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <button type="submit" className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-full hover:shadow-lg transition-all">Crear</button>
        </form>
      )}

      <div className="space-y-2">
        {pending.map((t) => (
          <div key={t.id} className="liquid-glass rounded-[var(--radius)] p-4 flex items-center gap-4">
            <button onClick={() => toggleComplete(t)} className="w-5 h-5 rounded-md border-2 border-primary/50 hover:border-primary transition-colors flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
              {t.due_date && <p className="text-xs text-muted-foreground">{new Date(t.due_date).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}</p>}
            </div>
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${categoryColors[t.category] ?? categoryColors.laboral}`}>{t.category || "laboral"}</span>
            <button onClick={() => handleDelete(t.id)} className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      {completed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completadas ({completed.length})</p>
          {completed.map((t) => (
            <div key={t.id} className="liquid-glass rounded-[var(--radius)] p-4 flex items-center gap-4 opacity-50">
              <button onClick={() => toggleComplete(t)} className="w-5 h-5 rounded-md bg-primary/30 border-2 border-primary flex-shrink-0 flex items-center justify-center">
                <span className="text-primary text-xs">✓</span>
              </button>
              <p className="text-sm text-foreground line-through truncate flex-1">{t.title}</p>
              <button onClick={() => handleDelete(t.id)} className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {tasks.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No hay tareas aún</p>}
    </div>
  );
};

export default TasksView;
