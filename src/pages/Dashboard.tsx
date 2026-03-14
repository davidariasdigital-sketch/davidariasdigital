import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
      <div className="min-h-screen bg-[hsl(var(--dash-bg))] flex items-center justify-center">
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
      <div className="min-h-screen flex w-full bg-[hsl(var(--dash-bg))]">
        <DashboardSidebar currentView={view} onViewChange={setView} />
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-8">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]" />
              <h2 className="text-xl font-display font-extrabold text-[hsl(var(--dash-text))]">
                Dashboard
              </h2>
              <p className="text-sm text-[hsl(var(--dash-text-muted))] hidden sm:block">
                Bienvenido de vuelta, David.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--dash-text-muted))]" />
                <input
                  type="text"
                  placeholder="Buscar archivo..."
                  className="dash-input pl-9 pr-4 py-2 rounded-full text-sm w-48 focus:w-60 transition-all"
                />
              </div>
              <button className="relative p-2.5 rounded-full hover:bg-[hsl(0,0%,92%)] transition-colors">
                <Bell size={18} className="text-[hsl(var(--dash-text))]" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <Avatar className="h-10 w-10 ring-2 ring-[hsl(var(--dash-card-border))]">
                <AvatarImage src={davidImg} alt="David Arias" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">DA</AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 px-8 py-4 overflow-auto">
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
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;