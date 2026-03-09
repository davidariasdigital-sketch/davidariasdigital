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
      <div className="min-h-screen dash-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full dash-bg">
        <DashboardSidebar currentView={view} onViewChange={setView} />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-14 flex items-center justify-between px-8">
            <h2 className="text-sm font-semibold text-[hsl(0,0%,40%)] tracking-wide">
              {viewLabels[view]}
            </h2>
          </header>
          <main className="flex-1 px-8 pb-8 overflow-auto">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderView()}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
