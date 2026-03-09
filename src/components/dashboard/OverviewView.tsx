import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, DollarSign, Plus, Clock } from "lucide-react";
import MonthlyCalendar from "./MonthlyCalendar";

type View = "overview" | "clients" | "quotations" | "invoices";

interface Props {
  onNavigate: (view: View) => void;
}

const OverviewView = ({ onNavigate }: Props) => {
  const [stats, setStats] = useState({ clients: 0, quotations: 0, pendingAmount: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [c, q, inv] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("quotations").select("id", { count: "exact", head: true }).eq("status", "enviada"),
        supabase.from("invoices" as any).select("amount").eq("status", "pendiente"),
      ]);
      const invData = (inv.data ?? []) as any[];
      const pendingAmount = invData.reduce((sum: number, i: any) => sum + Number(i.amount), 0);
      setStats({ clients: c.count ?? 0, quotations: q.count ?? 0, pendingAmount });
    };
    fetchStats();
  }, []);

  const formatCOP = (v: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      {/* Bento Grid — 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Yellow card — Por cobrar */}
        <button
          onClick={() => onNavigate("invoices")}
          className="dash-tile-primary rounded-2xl p-6 text-left"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Por Cobrar</p>
          <p className="text-4xl font-display font-extrabold mt-3">{formatCOP(stats.pendingAmount)}</p>
          <div className="mt-4">
            <span className="btn-dark text-xs px-4 py-2 inline-block">Ver detalle</span>
          </div>
        </button>

        {/* White card — Clientes */}
        <button
          onClick={() => onNavigate("clients")}
          className="dash-tile rounded-2xl p-6 text-left"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">Clientes Activos</p>
            <Clock size={18} className="text-[hsl(var(--dash-text-muted))]" />
          </div>
          <p className="text-4xl font-display font-extrabold mt-3 text-[hsl(var(--dash-text))]">{stats.clients}</p>
        </button>

        {/* Dark card — Cotizaciones */}
        <button
          onClick={() => onNavigate("quotations")}
          className="dash-tile-dark rounded-2xl p-6 text-left"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(0,0%,55%)]">Nueva Cotización</p>
            <div className="w-8 h-8 rounded-full bg-[hsl(0,0%,25%)] flex items-center justify-center">
              <Plus size={16} className="text-white" />
            </div>
          </div>
          <p className="text-2xl font-display font-extrabold mt-3">Crear Cotización</p>
          <p className="text-xs text-[hsl(0,0%,45%)] mt-1">{stats.quotations} pendientes</p>
        </button>
      </div>

      {/* Calendar */}
      <MonthlyCalendar />
    </div>
  );
};

export default OverviewView;