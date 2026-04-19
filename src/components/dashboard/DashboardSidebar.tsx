import { LayoutDashboard, Users, FileText, DollarSign, CalendarRange, LogOut, Palette, Receipt } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import davidImg from "@/assets/david-navbar.jpg";

type View = "overview" | "clients" | "quotations" | "invoices" | "content-planner" | "service-costs";

const items = [
  { title: "Dashboard", view: "overview" as View, icon: LayoutDashboard },
  { title: "Clientes", view: "clients" as View, icon: Users },
  { title: "Cotizaciones", view: "quotations" as View, icon: FileText },
  { title: "Cuentas de Cobro", view: "invoices" as View, icon: DollarSign },
  { title: "Planeador", view: "content-planner" as View, icon: CalendarRange },
  { title: "Costos", view: "service-costs" as View, icon: Receipt },
];

interface Props {
  currentView: View;
  onViewChange: (view: View) => void;
}

const DashboardSidebar = ({ currentView, onViewChange }: Props) => {
  const { setOpenMobile, isMobile } = useSidebar();
  const navigate = useNavigate();

  const handleNavClick = (view: View) => {
    onViewChange(view);
    if (isMobile) setOpenMobile(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Sidebar
      collapsible="offcanvas"
      // Override default 16rem width → narrow icon-only rail on desktop
      style={{ ["--sidebar-width" as any]: "4rem" }}
      className="border-none"
    >
      <SidebarContent className="dash-sidebar flex flex-col justify-between py-2 border-r border-[hsl(var(--dash-card-border))] items-center">
        <div className="w-full flex flex-col items-center">
          {/* Brand: avatar only */}
          <div className="pt-4 pb-6 flex justify-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={davidImg} alt="DA" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">DA</AvatarFallback>
            </Avatar>
          </div>

          {/* Nav: icon-only */}
          <SidebarGroup className="w-full">
            <SidebarGroupContent>
              <SidebarMenu className="px-2 space-y-1">
                {items.map((item) => {
                  const isActive = currentView === item.view;
                  return (
                    <SidebarMenuItem key={item.view}>
                      <SidebarMenuButton
                        onClick={() => handleNavClick(item.view)}
                        tooltip={item.title}
                        className={`cursor-pointer transition-all justify-center !w-10 !h-10 mx-auto p-0 rounded-xl ${
                          isActive
                            ? "dash-sidebar-active"
                            : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(0,0%,96%)]"
                        }`}
                      >
                        <item.icon className="!h-[18px] !w-[18px]" strokeWidth={isActive ? 2.5 : 1.5} />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Bottom */}
        <div className="w-full px-2 pb-3 space-y-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Guía de Estilo"
                className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(0,0%,96%)] rounded-xl justify-center !w-10 !h-10 mx-auto p-0"
              >
                <Link to="/style-guide">
                  <Palette className="!h-[18px] !w-[18px]" strokeWidth={1.5} />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip="Cerrar Sesión"
                className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(0,0%,96%)] rounded-xl cursor-pointer justify-center !w-10 !h-10 mx-auto p-0"
              >
                <LogOut className="!h-[18px] !w-[18px]" strokeWidth={1.5} />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
