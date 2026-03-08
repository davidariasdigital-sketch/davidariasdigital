import { LayoutDashboard, Users, FileText, CheckSquare, DollarSign, Palette, CalendarRange } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

type View = "overview" | "clients" | "quotations" | "tasks" | "invoices" | "content-planner";

const items = [
  { title: "Resumen", view: "overview" as View, icon: LayoutDashboard },
  { title: "Clientes", view: "clients" as View, icon: Users },
  { title: "Cotizaciones", view: "quotations" as View, icon: FileText },
  { title: "Cuentas por Cobrar", view: "invoices" as View, icon: DollarSign },
  { title: "Tareas", view: "tasks" as View, icon: CheckSquare },
  { title: "Planeador", view: "content-planner" as View, icon: CalendarRange },
];

interface Props {
  currentView: View;
  onViewChange: (view: View) => void;
}

const DashboardSidebar = ({ currentView, onViewChange }: Props) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 flex items-center justify-between">
          {!collapsed && <span className="text-sm font-bold text-foreground tracking-wide">Panel</span>}
          <SidebarTrigger />
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.view)}
                    isActive={currentView === item.view}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Herramientas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/style-guide">
                    <Palette className="h-4 w-4" />
                    {!collapsed && <span>Guía de Estilo</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
