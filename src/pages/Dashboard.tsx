import { lazy, Suspense, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import { motion } from "framer-motion";

type View = "overview" | "finance" | "content-planner" | "service-costs" | "health";

const OverviewView = lazy(() => import("@/components/dashboard/OverviewView"));
const FinanceView = lazy(() => import("@/components/dashboard/FinanceView"));
const ContentPlannerView = lazy(() => import("@/components/dashboard/ContentPlannerView"));
const ServiceCostsView = lazy(() => import("@/components/dashboard/ServiceCostsView"));
const HealthView = lazy(() => import("@/components/dashboard/HealthView"));

const DashboardLoading = () => (
  <div className="min-h-[50vh] bg-[hsl(var(--dash-bg))] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Dashboard = () => {
  const [view, setView] = useState<View>("overview");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login", { replace: true });
      else if (active) setLoading(false);
    });

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        if (!session) navigate("/login", { replace: true });
        else setLoading(false);
      } catch {
        if (active) navigate("/login", { replace: true });
      }
    };

    checkAuth();
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--dash-bg))] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>);

  }

  const renderView = () => {
    switch (view) {
      case "overview":return <OverviewView onNavigate={setView as any} />;
      case "finance":return <FinanceView />;
      case "content-planner":return <ContentPlannerView />;
      case "service-costs":return <ServiceCostsView />;
      case "health":return <HealthView />;
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
          <main className="flex-1 px-3 py-4 sm:px-6 md:px-6 md:py-6 overflow-auto pb-36 md:pb-6">
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}>
              
              <Suspense fallback={<DashboardLoading />}>
                {renderView()}
              </Suspense>
            </motion.div>
          </main>
        </div>
        {/* Mobile bottom nav */}
        <MobileBottomNav currentView={view} onViewChange={setView} />
      </div>
    </SidebarProvider>);

};

export default Dashboard;
