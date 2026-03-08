import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Trash2, Edit2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Project {
  id: string;
  title: string;
  status: string;
  progress: number;
  start_date: string | null;
  due_date: string | null;
  notes: string | null;
  client_id: string | null;
  created_at: string;
  clients?: { name: string } | null;
}

interface Client { id: string; name: string; }

const statusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completado: "Completado",
};

const statusColors: Record<string, string> = {
  pendiente: "bg-muted text-muted-foreground",
  en_progreso: "bg-primary/20 text-primary",
  completado: "bg-green-500/20 text-green-400",
};

const ProjectsView = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ title: "", client_id: "", status: "pendiente", progress: 0, start_date: "", due_date: "", notes: "" });

  const fetchData = async () => {
    const [p, c] = await Promise.all([
      supabase.from("projects").select("*, clients(name)").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name"),
    ]);
    if (p.data) setProjects(p.data as unknown as Project[]);
    if (c.data) setClients(c.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      title: form.title,
      client_id: form.client_id || null,
      status: form.status as any,
      progress: Number(form.progress),
      start_date: form.start_date || null,
      due_date: form.due_date || null,
      notes: form.notes || null,
      user_id: user.id,
    };

    if (editing) {
      const { user_id, ...updatePayload } = payload;
      await supabase.from("projects").update(updatePayload).eq("id", editing.id);
    } else {
      await supabase.from("projects").insert(payload);
    }
    resetForm();
    fetchData();
  };

  const resetForm = () => {
    setForm({ title: "", client_id: "", status: "pendiente", progress: 0, start_date: "", due_date: "", notes: "" });
    setShowForm(false);
    setEditing(null);
  };

  const handleEdit = (p: Project) => {
    setEditing(p);
    setForm({ title: p.title, client_id: p.client_id ?? "", status: p.status, progress: p.progress, start_date: p.start_date ?? "", due_date: p.due_date ?? "", notes: p.notes ?? "" });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Proyectos</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); resetForm(); }} className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-full hover:shadow-lg transition-all">
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="liquid-glass rounded-[var(--radius)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{editing ? "Editar proyecto" : "Nuevo proyecto"}</h3>
            <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título *" className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">Sin cliente</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="completado">Completado</option>
            </select>
            <div className="flex items-center gap-3">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Progreso: {form.progress}%</label>
              <input type="range" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} className="flex-1 accent-[hsl(var(--primary))]" />
            </div>
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[60px]" />
          <button type="submit" className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-full hover:shadow-lg transition-all">
            {editing ? "Guardar" : "Crear"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="liquid-glass rounded-[var(--radius)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-sm">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.clients?.name ?? "Sin cliente"}{p.due_date ? ` · Entrega: ${new Date(p.due_date).toLocaleDateString()}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${statusColors[p.status] ?? ""}`}>{statusLabels[p.status]}</span>
                <button onClick={() => handleEdit(p)} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/50"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={p.progress} className="h-2 flex-1" />
              <span className="text-xs text-muted-foreground font-medium">{p.progress}%</span>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No hay proyectos aún</p>}
      </div>
    </div>
  );
};

export default ProjectsView;
