import { LayoutDashboard, Users, FileText, DollarSign, CalendarRange, Receipt, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type View = "overview" | "clients" | "quotations" | "invoices" | "content-planner" | "service-costs";

const items = [
  { title: "Inicio", view: "overview" as View, icon: LayoutDashboard },
  { title: "Clientes", view: "clients" as View, icon: Users },
  { title: "Cotiz.", view: "quotations" as View, icon: FileText },
  { title: "Cobros", view: "invoices" as View, icon: DollarSign },
  { title: "Plan", view: "content-planner" as View, icon: CalendarRange },
  { title: "Costos", view: "service-costs" as View, icon: Receipt },
];

interface Props {
  currentView: View;
  onViewChange: (view: View) => void;
}

const MobileBottomNav = ({ currentView, onViewChange }: Props) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[hsl(var(--dash-card-bg))] border-t border-[hsl(var(--dash-card-border))] shadow-[0_-4px_16px_-4px_hsl(0_0%_0%/0.08)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch overflow-x-auto no-scrollbar">
        {items.map((item) => {
          const isActive = currentView === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`flex-1 min-w-[64px] flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]"
              }`}
            >
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                  isActive ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider leading-none ${isActive ? "text-[hsl(var(--dash-text))]" : ""}`}>
                {item.title}
              </span>
            </button>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex-1 min-w-[64px] flex flex-col items-center justify-center gap-0.5 py-2 text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl">
            <LogOut size={18} strokeWidth={2} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider leading-none">Salir</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
