import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import OverviewView from "@/components/dashboard/OverviewView";
import ClientsView from "@/components/dashboard/ClientsView";
import QuotationsView from "@/components/dashboard/QuotationsView";
import ProjectsView from "@/components/dashboard/ProjectsView";
import TasksView from "@/components/dashboard/TasksView";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";

type View = "overview" | "clients" | "quotations" | "projects" | "tasks";

const Dashboard = () => {
  const [view, setView] = useState<View>("overview");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case "overview": return <OverviewView onNavigate={setView} />;
      case "clients": return <ClientsView />;
      case "quotations": return <QuotationsView />;
      case "projects": return <ProjectsView />;
      case "tasks": return <TasksView />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar currentView={view} onViewChange={setView} />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-14 flex items-center justify-between px-6 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground/70 capitalize">
              {view === "overview" ? "Resumen" : view === "clients" ? "Clientes" : view === "quotations" ? "Cotizaciones" : view === "projects" ? "Proyectos" : "Tareas"}
            </h2>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted/50">
              <LogOut size={16} />
            </button>
          </header>
          <main className="flex-1 p-6 overflow-auto">
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
