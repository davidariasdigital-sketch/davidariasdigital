import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, DollarSign, Plus, TrendingUp } from "lucide-react";
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
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-extrabold text-white">Dashboard</h1>
        <p className="text-sm text-[hsl(0,0%,45%)] mt-1">Bienvenido de vuelta, David</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Primary tile — Por cobrar */}
        <button
          onClick={() => onNavigate("invoices")}
          className="dash-tile-primary rounded-3xl p-7 text-left group"
        >
          <div className="flex items-center justify-between">
            <DollarSign size={20} className="opacity-70" />
            <TrendingUp size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-4xl font-display font-extrabold mt-5">{formatCOP(stats.pendingAmount)}</p>
          <p className="text-xs mt-2 opacity-60 font-medium">Por cobrar</p>
        </button>

        {/* Dark tile — Clientes */}
        <button
          onClick={() => onNavigate("clients")}
          className="dash-tile rounded-3xl p-7 text-left"
        >
          <Users size={20} className="text-primary" />
          <p className="text-4xl font-display font-extrabold mt-5 text-white">{stats.clients}</p>
          <p className="text-xs mt-2 text-[hsl(0,0%,45%)] font-medium">Clientes activos</p>
        </button>

        {/* Dark tile — Cotizaciones */}
        <button
          onClick={() => onNavigate("quotations")}
          className="dash-tile rounded-3xl p-7 text-left group"
        >
          <div className="flex items-center justify-between w-full">
            <FileText size={20} className="text-[hsl(0,0%,55%)]" />
            <Plus size={16} className="text-[hsl(0,0%,30%)] group-hover:text-primary transition-colors" />
          </div>
          <p className="text-4xl font-display font-extrabold mt-5 text-white">{stats.quotations}</p>
          <p className="text-xs mt-2 text-[hsl(0,0%,45%)] font-medium">Cotizaciones pendientes</p>
        </button>
      </div>

      {/* Calendar */}
      <MonthlyCalendar />
    </div>
  );
};

export default OverviewView;