import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import OverviewView from "@/components/dashboard/OverviewView";
import ClientsView from "@/components/dashboard/ClientsView";
import QuotationsView from "@/components/dashboard/QuotationsView";
import InvoicesView from "@/components/dashboard/InvoicesView";
import ContentPlannerView from "@/components/dashboard/ContentPlannerView";
import { motion } from "framer-motion";
import { Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import davidImg from "@/assets/david-navbar.jpg";

type View = "overview" | "clients" | "quotations" | "invoices" | "content-planner";

const viewLabels: Record<View, string> = {
  overview: "Resumen",
  clients: "Clientes",
  quotations: "Cotizaciones",
  invoices: "Cuentas por Cobrar",
  "content-planner": "Planeador de Contenido",
};

const Dashboard = () => {
  const [view, setView] = useState<View>("overview");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }
      setLoading(false);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="frame-outer flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case "overview": return <OverviewView onNavigate={setView} />;
      case "clients": return <ClientsView />;
      case "quotations": return <QuotationsView />;
      case "invoices": return <InvoicesView />;
      case "content-planner": return <ContentPlannerView />;
    }
  };

  return (
    <div className="frame-outer">
      <div className="frame-container-dark flex">
        <SidebarProvider>
          <DashboardSidebar currentView={view} onViewChange={setView} />
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-8 border-b border-[hsl(0,0%,15%)]">
              <h2 className="text-sm font-display font-bold text-[hsl(0,0%,55%)] tracking-wide">
                {viewLabels[view]}
              </h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(0,0%,40%)]" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="dash-input pl-9 pr-4 py-2 rounded-full text-sm w-44 focus:w-56 transition-all"
                  />
                </div>
                <button className="p-2 rounded-full text-[hsl(0,0%,45%)] hover:text-[hsl(0,0%,80%)] transition-colors">
                  <Bell size={18} />
                </button>
                <Avatar className="h-9 w-9 ring-2 ring-[hsl(0,0%,20%)]">
                  <AvatarImage src={davidImg} alt="David Arias" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">DA</AvatarFallback>
                </Avatar>
              </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-8 py-6 overflow-auto">
              <motion.div
                key={view}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                {renderView()}
              </motion.div>
            </main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default Dashboard;