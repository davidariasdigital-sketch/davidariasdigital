import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, DollarSign, Plus } from "lucide-react";
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[hsl(0,0%,12%)]">Dashboard</h1>
        <p className="text-sm text-[hsl(0,0%,50%)] mt-1">Bienvenido de vuelta, David</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Yellow highlight card */}
        <button
          onClick={() => onNavigate("invoices")}
          className="dash-card-highlight rounded-3xl p-7 text-left"
        >
          <DollarSign size={22} className="text-white/80" />
          <p className="text-4xl font-bold mt-4 text-white">{formatCOP(stats.pendingAmount)}</p>
          <p className="text-xs mt-2 text-white/70 font-medium">Por cobrar</p>
        </button>

        {/* White card */}
        <button
          onClick={() => onNavigate("clients")}
          className="dash-card rounded-3xl p-7 text-left"
        >
          <Users size={22} className="text-primary" />
          <p className="text-4xl font-bold mt-4 text-[hsl(0,0%,12%)]">{stats.clients}</p>
          <p className="text-xs mt-2 text-[hsl(0,0%,50%)] font-medium">Clientes</p>
        </button>

        {/* Dark card */}
        <button
          onClick={() => onNavigate("quotations")}
          className="dash-card-dark rounded-3xl p-7 text-left flex flex-col"
        >
          <div className="flex items-center justify-between w-full">
            <FileText size={22} className="text-white/60" />
            <Plus size={18} className="text-white/40" />
          </div>
          <p className="text-4xl font-bold mt-4 text-white">{stats.quotations}</p>
          <p className="text-xs mt-2 text-white/50 font-medium">Cotizaciones pendientes</p>
        </button>
      </div>

      <MonthlyCalendar />
    </div>
  );
};

export default OverviewView;
