import { LayoutDashboard, Wallet, CalendarRange, LogOut, Palette, Receipt } from "lucide-react";
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

type View = "overview" | "finance" | "content-planner" | "service-costs";

const items = [
  { title: "Dashboard", view: "overview" as View, icon: LayoutDashboard },
  { title: "Finanzas", view: "finance" as View, icon: Wallet },
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
    <Sidebar collapsible="offcanvas" className="border-none">
      <SidebarContent className="dash-sidebar flex flex-col justify-between py-3 border-r border-[hsl(var(--dash-card-border))]">
        <div className="flex flex-col items-center w-full">
          {/* Brand: avatar only */}
          <div className="pt-1 pb-5 flex justify-center w-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={davidImg} alt="DA" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">DA</AvatarFallback>
            </Avatar>
          </div>

          {/* Nav: icon-only */}
          <SidebarGroup className="w-full p-0">
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 items-center">
                {items.map((item) => {
                  const isActive = currentView === item.view;
                  return (
                    <SidebarMenuItem key={item.view} className="w-auto">
                      <SidebarMenuButton
                        onClick={() => handleNavClick(item.view)}
                        tooltip={item.title}
                        className={`cursor-pointer transition-all !w-10 !h-10 !p-0 flex items-center justify-center rounded-xl ${
                          isActive
                            ? "dash-sidebar-active"
                            : "text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(0,0%,96%)]"
                        }`}
                      >
                        <item.icon className="!h-[18px] !w-[18px] shrink-0" strokeWidth={isActive ? 2.5 : 1.5} />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Bottom */}
        <div className="w-full pb-1">
          <SidebarMenu className="space-y-1 items-center">
            <SidebarMenuItem className="w-auto">
              <SidebarMenuButton
                asChild
                tooltip="Guía de Estilo"
                className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(0,0%,96%)] rounded-xl !w-10 !h-10 !p-0 flex items-center justify-center"
              >
                <Link to="/style-guide">
                  <Palette className="!h-[18px] !w-[18px] shrink-0" strokeWidth={1.5} />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="w-auto">
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip="Cerrar Sesión"
                className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] hover:bg-[hsl(0,0%,96%)] rounded-xl cursor-pointer !w-10 !h-10 !p-0 flex items-center justify-center"
              >
                <LogOut className="!h-[18px] !w-[18px] shrink-0" strokeWidth={1.5} />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
