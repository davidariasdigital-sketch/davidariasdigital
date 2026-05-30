import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import QuotationsView from "./QuotationsView";
import InvoicesView from "./InvoicesView";
import ServiceCostsView from "./ServiceCostsView";

type Tab = "quotations" | "invoices" | "costs";

const tabs: { id: Tab; label: string }[] = [
  { id: "quotations", label: "Cotizaciones" },
  { id: "invoices", label: "Cuentas por cobrar" },
  { id: "costs", label: "Estructura de costos" },
];

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v);

const FinanceView = () => {
  const [tab, setTab] = useState<Tab>("quotations");
  const [triggerNewQ, setTriggerNewQ] = useState(0);
  const [triggerNewI, setTriggerNewI] = useState(0);
  const [stats, setStats] = useState({ pending: 0, paid: 0, accepted: 0, totalQ: 0 });

  const fetchStats = async () => {
    const [inv, qt] = await Promise.all([
      supabase.from("invoices").select("amount, status"),
      supabase.from("quotations").select("status"),
    ]);
    const invs = (inv.data ?? []) as { amount: number; status: string }[];
    const qts = (qt.data ?? []) as { status: string }[];
    setStats({
      pending: invs.filter(i => i.status === "pendiente").reduce((s, i) => s + Number(i.amount), 0),
      paid: invs.filter(i => i.status === "pagada").reduce((s, i) => s + Number(i.amount), 0),
      accepted: qts.filter(q => q.status === "aceptada").length,
      totalQ: qts.length,
    });
  };

  useEffect(() => { fetchStats(); }, []);

  const handleNew = () => {
    if (tab === "quotations") setTriggerNewQ(n => n + 1);
    else setTriggerNewI(n => n + 1);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="dash-tile-primary rounded-2xl p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Pendiente por cobrar</p>
          <p className="text-xl sm:text-2xl font-display font-extrabold mt-2">{formatCOP(stats.pending)}</p>
        </div>
        <div className="dash-tile rounded-2xl p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">Total cobrado</p>
          <p className="text-xl sm:text-2xl font-display font-extrabold mt-2 text-emerald-600">{formatCOP(stats.paid)}</p>
        </div>
        <div className="dash-tile rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">Cotizaciones aceptadas</p>
            <p className="text-xl sm:text-2xl font-display font-extrabold mt-2 text-[hsl(var(--dash-text))]">
              {stats.accepted}<span className="text-sm text-[hsl(var(--dash-text-muted))] font-bold"> / {stats.totalQ}</span>
            </p>
          </div>
          {tab !== "costs" && (
            <button
              onClick={handleNew}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-full hover:shadow-lg transition-all mt-3 w-full"
            >
              <Plus size={14} /> {tab === "quotations" ? "Nueva cotización" : "Nueva cuenta"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs (pill style) */}
      <div className="flex">
        <div className="inline-flex gap-1 p-1 rounded-full bg-[hsl(0,0%,96%)] border border-[hsl(var(--dash-card-border))] overflow-x-auto no-scrollbar max-w-full">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                tab === t.id
                  ? "bg-[hsl(var(--dash-card-bg))] text-[hsl(var(--dash-text))] shadow-sm rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all"
                  : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors"
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active tab content */}
      <div>
        {tab === "quotations" && <QuotationsView embedded triggerNew={triggerNewQ} onMutate={fetchStats} />}
        {tab === "invoices" && <InvoicesView embedded triggerNew={triggerNewI} onMutate={fetchStats} />}
        {tab === "costs" && <ServiceCostsView />}
      </div>
    </div>
  );
};

export default FinanceView;
