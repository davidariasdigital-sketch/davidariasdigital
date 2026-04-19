import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import OverviewView from "@/components/dashboard/OverviewView";
import ClientsView from "@/components/dashboard/ClientsView";
import QuotationsView from "@/components/dashboard/QuotationsView";
import InvoicesView from "@/components/dashboard/InvoicesView";
import ContentPlannerView from "@/components/dashboard/ContentPlannerView";
import ServiceCostsView from "@/components/dashboard/ServiceCostsView";
import { motion } from "framer-motion";

type View = "overview" | "clients" | "quotations" | "invoices" | "content-planner" | "service-costs";

const Dashboard = () => {
  const [view, setView] = useState<View>("overview");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {navigate("/login");return;}
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
      </div>);

  }

  const renderView = () => {
    switch (view) {
      case "overview":return <OverviewView onNavigate={setView} />;
      case "clients":return <ClientsView />;
      case "quotations":return <QuotationsView />;
      case "invoices":return <InvoicesView />;
      case "content-planner":return <ContentPlannerView />;
      case "service-costs":return <ServiceCostsView />;
    }
  };

  return (
    <SidebarProvider style={{ ["--sidebar-width" as any]: "4rem" }}>
      <div className="min-h-screen flex w-full bg-[hsl(var(--dash-bg))]">
        {/* Desktop sidebar (hidden on mobile) */}
        <div className="hidden md:block">
          <DashboardSidebar currentView={view} onViewChange={setView} />
        </div>
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Content */}
          <main className="flex-1 px-3 py-4 sm:px-6 md:px-6 md:py-6 overflow-auto pb-24 md:pb-6">
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}>
              
              {renderView()}
            </motion.div>
          </main>
        </div>
        {/* Mobile bottom nav */}
        <MobileBottomNav currentView={view} onViewChange={setView} />
      </div>
    </SidebarProvider>);

};

export default Dashboard;