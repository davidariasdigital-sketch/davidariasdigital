import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, FolderKanban, CheckSquare } from "lucide-react";

type View = "overview" | "clients" | "quotations" | "projects" | "tasks";

interface Props {
  onNavigate: (view: View) => void;
}

const OverviewView = ({ onNavigate }: Props) => {
  const [stats, setStats] = useState({ clients: 0, quotations: 0, projects: 0, tasks: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [c, q, p, t] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("quotations").select("id", { count: "exact", head: true }).eq("status", "enviada"),
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "en_progreso"),
        supabase.from("tasks").select("id", { count: "exact", head: true }).eq("completed", false),
      ]);
      setStats({
        clients: c.count ?? 0,
        quotations: q.count ?? 0,
        projects: p.count ?? 0,
        tasks: t.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Clientes", value: stats.clients, icon: Users, view: "clients" as View, color: "text-primary" },
    { label: "Cotizaciones pendientes", value: stats.quotations, icon: FileText, view: "quotations" as View, color: "text-primary" },
    { label: "Proyectos activos", value: stats.projects, icon: FolderKanban, view: "projects" as View, color: "text-primary" },
    { label: "Tareas pendientes", value: stats.tasks, icon: CheckSquare, view: "tasks" as View, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Bienvenido</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => onNavigate(card.view)}
            className="liquid-glass rounded-[var(--radius)] p-6 text-left hover:scale-[1.02] transition-transform"
          >
            <card.icon size={20} className={card.color} />
            <p className="text-3xl font-bold text-foreground mt-3">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OverviewView;
