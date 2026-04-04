import { useEffect, useState, DragEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Circle, Plus, Clock, GripVertical } from "lucide-react";
import MonthlyCalendar from "./MonthlyCalendar";

type View = "overview" | "clients" | "quotations" | "invoices" | "content-planner";

interface Props {
  onNavigate: (view: View) => void;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  priority: string;
  category: string;
  estimated_time: number | null;
}

const OverviewView = ({ onNavigate }: Props) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("laboral");
  const [showAddTask, setShowAddTask] = useState(false);

  const fetchTasks = async () => {
    const t = await supabase.from("tasks").select("*").eq("completed", false).order("due_date", { ascending: true }).limit(8);
    if (t.data) setTasks(t.data as Task[]);
  };

  useEffect(() => { fetchTasks(); }, []);

  const toggleTask = async (id: string) => {
    await supabase.from("tasks").update({ completed: true } as any).eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("tasks").insert({
      title: newTaskTitle.trim(),
      user_id: user.id,
      category: newTaskCategory,
      estimated_time: newTaskTime ? parseInt(newTaskTime) : null,
    } as any);
    setNewTaskTitle("");
    setNewTaskTime("");
    setNewTaskCategory("laboral");
    setShowAddTask(false);
    fetchTasks();
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addTask();
    if (e.key === "Escape") { setShowAddTask(false); setNewTaskTitle(""); setNewTaskTime(""); }
  };

  const onTaskDragStart = (e: DragEvent, task: Task) => {
    e.dataTransfer.setData("taskDrag", JSON.stringify(task));
    e.dataTransfer.effectAllowed = "copy";
  };

  const categoryColors: Record<string, string> = {
    personal: "text-blue-500",
    laboral: "text-amber-500",
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="space-y-4">
      {/* Calendar on top */}
      <MonthlyCalendar />

      {/* Actividades pendientes — full width */}
      <div className="dash-tile rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">Actividades Pendientes</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary">{tasks.length}</span>
            <button onClick={() => setShowAddTask(true)} className="p-1 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors">
              <Plus size={14} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-[hsl(var(--dash-text-muted))] mb-3 italic">Arrastra una actividad al calendario para agendarla</p>
        <div className="space-y-2.5">
          {tasks.length === 0 && (
            <p className="text-sm text-[hsl(var(--dash-text-muted))] text-center py-4">Sin actividades pendientes 🎉</p>
          )}
          {tasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => onTaskDragStart(e, task)}
              className="flex items-start gap-2 group cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={14} className="mt-1 text-[hsl(var(--dash-text-muted))] opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
              <button
                onClick={() => toggleTask(task.id)}
                className="mt-0.5 text-[hsl(var(--dash-text-muted))] hover:text-primary transition-colors shrink-0"
              >
                <Circle size={16} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[hsl(var(--dash-text))] truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.due_date && (
                    <span className="text-[10px] text-[hsl(var(--dash-text-muted))]">
                      {new Date(task.due_date).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                    </span>
                  )}
                  {task.estimated_time && (
                    <span className="text-[10px] text-[hsl(var(--dash-text-muted))] flex items-center gap-0.5">
                      <Clock size={9} /> {formatTime(task.estimated_time)}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold uppercase ${categoryColors[task.category] ?? categoryColors.laboral}`}>
                    {task.category || "laboral"}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {showAddTask && (
            <div className="space-y-2 pl-6">
              <div className="flex items-center gap-2">
                <Circle size={16} className="text-[hsl(var(--dash-text-muted))] shrink-0 mt-0.5" />
                <input
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleAddKeyDown}
                  placeholder="Nueva actividad..."
                  className="flex-1 text-sm dash-input rounded-lg px-2 py-1"
                />
              </div>
              <div className="flex items-center gap-2 pl-6">
                <input
                  type="number"
                  min="1"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  onKeyDown={handleAddKeyDown}
                  placeholder="Min. estimados"
                  className="w-28 text-xs dash-input rounded-lg px-2 py-1"
                />
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  className="text-xs dash-input rounded-lg px-2 py-1"
                >
                  <option value="laboral">Laboral</option>
                  <option value="personal">Personal</option>
                </select>
                <button onClick={addTask} className="btn-dark text-xs px-3 py-1">Añadir</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
