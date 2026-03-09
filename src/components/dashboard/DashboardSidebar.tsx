import { LayoutDashboard, Users, FileText, DollarSign, CalendarRange, LogOut, Palette } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

type View = "overview" | "clients" | "quotations" | "invoices" | "content-planner";

const items = [
  { title: "Resumen", view: "overview" as View, icon: LayoutDashboard },
  { title: "Clientes", view: "clients" as View, icon: Users },
  { title: "Cotizaciones", view: "quotations" as View, icon: FileText },
  { title: "Cuentas de Cobro", view: "invoices" as View, icon: DollarSign },
  { title: "Planeador", view: "content-planner" as View, icon: CalendarRange },
];

interface Props {
  currentView: View;
  onViewChange: (view: View) => void;
}

const DashboardSidebar = ({ currentView, onViewChange }: Props) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-none">
      <SidebarContent className="dash-sidebar flex flex-col justify-between py-4">
        <div>
          {/* Brand */}
          <div className="px-4 pt-4 pb-6 flex items-center gap-3">
            {!collapsed && (
              <div>
                <span className="text-lg font-display font-extrabold text-white tracking-tight">
                  David Arias
                </span>
                <p className="text-[10px] text-[hsl(0,0%,45%)] font-medium mt-0.5">Panel de gestión</p>
              </div>
            )}
            <SidebarTrigger className="text-[hsl(0,0%,40%)] hover:text-white ml-auto" />
          </div>

          {/* Nav items */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="px-2 space-y-1">
                {items.map((item) => {
                  const isActive = currentView === item.view;
                  return (
                    <SidebarMenuItem key={item.view}>
                      <SidebarMenuButton
                        onClick={() => onViewChange(item.view)}
                        className={`cursor-pointer transition-all ${
                          isActive
                            ? "dash-sidebar-active"
                            : "text-[hsl(0,0%,50%)] hover:text-white hover:bg-[hsl(0,0%,14%)] rounded-full"
                        }`}
                      >
                        <item.icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 1.5} />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Bottom */}
        <div className="px-2 pb-4 space-y-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-[hsl(0,0%,35%)] hover:text-white hover:bg-[hsl(0,0%,14%)] rounded-full">
                <Link to="/style-guide">
                  <Palette className="h-4 w-4" strokeWidth={1.5} />
                  {!collapsed && <span className="text-sm">Guía de Estilo</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="text-[hsl(0,0%,35%)] hover:text-white hover:bg-[hsl(0,0%,14%)] rounded-full cursor-pointer"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                {!collapsed && <span className="text-sm">Cerrar sesión</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;