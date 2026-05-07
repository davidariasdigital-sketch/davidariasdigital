import { LayoutDashboard, Wallet, CalendarRange, LogOut, HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type View = "overview" | "finance" | "content-planner" | "service-costs" | "health";

const items = [
  { title: "Inicio", view: "overview" as View, icon: LayoutDashboard },
  { title: "Finanzas", view: "finance" as View, icon: Wallet },
  { title: "Plan", view: "content-planner" as View, icon: CalendarRange },
  { title: "Salud", view: "health" as View, icon: HeartPulse },
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
    <div
      className="md:hidden fixed left-3 right-3 z-40"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
    >
      <nav className="rounded-2xl border border-[hsl(var(--dash-card-border))] bg-[hsl(var(--dash-card-bg))]/95 backdrop-blur-md shadow-[0_8px_28px_-8px_hsl(0_0%_0%/0.18)]">
        <div className="flex items-stretch overflow-x-auto no-scrollbar px-2 py-2">
          {items.map((item) => {
            const isActive = currentView === item.view;
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                className={`flex-1 min-w-[64px] flex flex-col items-center justify-center gap-1 py-1.5 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
                    isActive ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10.5px] font-bold uppercase tracking-wider leading-none ${isActive ? "text-[hsl(var(--dash-text))]" : ""}`}>
                  {item.title}
                </span>
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex-1 min-w-[58px] flex flex-col items-center justify-center gap-0.5 py-1 text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl">
              <LogOut size={18} strokeWidth={2} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider leading-none">Salir</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MobileBottomNav;
