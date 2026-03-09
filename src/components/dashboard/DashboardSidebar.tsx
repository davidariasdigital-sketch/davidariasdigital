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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import davidImg from "@/assets/david-navbar.jpg";

type View = "overview" | "clients" | "quotations" | "invoices" | "content-planner";

const items = [
  { title: "Dashboard", view: "overview" as View, icon: LayoutDashboard },
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
      <SidebarContent className="dash-sidebar flex flex-col justify-between py-2 border-r border-[hsl(var(--dash-card-border))]">
        <div>
          {/* Brand */}
          <div className="px-4 pt-5 pb-8 flex items-center gap-3">
            {!collapsed ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={davidImg} alt="David Arias" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">DA</AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-display font-extrabold text-[hsl(0,0%,10%)] leading-tight block">
                    David Arias
                  </span>
                  <p className="text-[10px] text-[hsl(var(--dash-text-muted))] font-medium uppercase tracking-wider">
                    Productor
                  </p>
                </div>
              </div>
            ) : (
              <Avatar className="h-8 w-8 mx-auto">
                <AvatarImage src={davidImg} alt="DA" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">DA</AvatarFallback>
              </Avatar>
            )}
            {!collapsed && <SidebarTrigger className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] ml-auto" />}
          </div>

          {/* Nav */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="px-3 space-y-1">
                {items.map((item) => {
                  const isActive = currentView === item.view;
                  return (
                    <SidebarMenuItem key={item.view}>
                      <SidebarMenuButton
                        onClick={() => onViewChange(item.view)}
                        className={`cursor-pointer transition-all py-2.5 ${
                          isActive
                            ? "dash-sidebar-active"
                            : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(0,0%,96%)] rounded-xl"
                        }`}
                      >
                        <item.icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.5 : 1.5} />
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
        <div className="px-3 pb-4 space-y-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(0,0%,96%)] rounded-xl">
                <Link to="/style-guide">
                  <Palette className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  {!collapsed && <span className="text-sm">Guía de Estilo</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(0,0%,96%)] rounded-xl cursor-pointer"
              >
                <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
                {!collapsed && <span className="text-sm">Cerrar Sesión</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;