import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Briefcase, Film, Smartphone, Star, Calendar as CalIcon } from "lucide-react";

interface Priority {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  sort_order: number;
}

const ICONS: Record<string, any> = {
  briefcase: Briefcase,
  film: Film,
  smartphone: Smartphone,
  star: Star,
  calendar: CalIcon,
};

const ICON_KEYS = ["briefcase", "film", "smartphone", "star", "calendar"];

const tileStyles: Record<string, { bg: string; border: string; text: string; label: string; icon: string }> = {
  primary: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", label: "text-amber-600", icon: "text-amber-500" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", label: "text-blue-600", icon: "text-blue-500" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-900", label: "text-green-600", icon: "text-green-500" },
  red: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-900", label: "text-pink-600", icon: "text-pink-500" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-900", label: "text-purple-600", icon: "text-purple-500" },
};

const COLOR_KEYS = ["primary", "blue", "green", "red", "purple"];

const DEFAULTS = [
  { title: "Colombina", description: "Lunes a viernes, 8:00 am - 5:00 pm", icon: "briefcase", color: "red", sort_order: 0 },
  { title: "Solar", description: "Una producción cada dos meses", icon: "film", color: "primary", sort_order: 1 },
  { title: "Digital", description: "Contenido semanal en Instagram y TikTok", icon: "smartphone", color: "blue", sort_order: 2 },
];

const PrioritiesSection = () => {
  const [items, setItems] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("priorities")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data && data.length === 0) {
      // seed defaults
      const seeded = DEFAULTS.map(d => ({ ...d, user_id: user.id }));
      const { data: inserted } = await supabase.from("priorities").insert(seeded).select();
      if (inserted) setItems(inserted as Priority[]);
    } else if (data) {
      setItems(data as Priority[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const updateField = async (id: string, field: "title" | "description", value: string) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    await supabase.from("priorities").update({ [field]: value } as any).eq("id", id);
  };

  const cycleColor = async (item: Priority) => {
    const idx = COLOR_KEYS.indexOf(item.color);
    const next = COLOR_KEYS[(idx + 1) % COLOR_KEYS.length];
    setItems(prev => prev.map(p => p.id === item.id ? { ...p, color: next } : p));
    await supabase.from("priorities").update({ color: next } as any).eq("id", item.id);
  };

  const cycleIcon = async (item: Priority) => {
    const idx = ICON_KEYS.indexOf(item.icon);
    const next = ICON_KEYS[(idx + 1) % ICON_KEYS.length];
    setItems(prev => prev.map(p => p.id === item.id ? { ...p, icon: next } : p));
    await supabase.from("priorities").update({ icon: next } as any).eq("id", item.id);
  };

  const addPriority = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("priorities").insert({
      user_id: user.id,
      title: "Nueva prioridad",
      description: "Descripción...",
      icon: "star",
      color: "purple",
      sort_order: items.length,
    } as any).select().single();
    if (data) setItems(prev => [...prev, data as Priority]);
  };

  const removePriority = async (id: string) => {
    setItems(prev => prev.filter(p => p.id !== id));
    await supabase.from("priorities").delete().eq("id", id);
  };

  return (
    <div className="dash-tile rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">Prioridades</p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary">{items.length}</span>
          <button
            onClick={addPriority}
            className="p-1 rounded-lg hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors"
            title="Agregar prioridad"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[hsl(var(--dash-text-muted))] text-center py-6">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[hsl(var(--dash-text-muted))] text-center py-6">Sin prioridades. Agrega una para empezar.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => {
            const style = tileStyles[item.color] ?? tileStyles.primary;
            const Icon = ICONS[item.icon] ?? Briefcase;
            return (
              <div
                key={item.id}
                className={`${style.bg} ${style.border} border rounded-xl p-4 group relative transition-shadow hover:shadow-md min-h-[120px] flex flex-col`}
              >
                <button
                  onClick={() => removePriority(item.id)}
                  title="Eliminar"
                  className="absolute top-2 right-2 p-1 rounded-md bg-white/60 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} className={style.text} />
                </button>

                <button
                  onClick={() => cycleIcon(item)}
                  title="Cambiar icono"
                  className={`mb-2 ${style.icon} w-fit hover:scale-110 transition-transform`}
                >
                  <Icon size={20} />
                </button>

                <input
                  value={item.title}
                  onChange={(e) => setItems(prev => prev.map(p => p.id === item.id ? { ...p, title: e.target.value } : p))}
                  onBlur={(e) => updateField(item.id, "title", e.target.value)}
                  className={`bg-transparent border-none outline-none uppercase tracking-wide text-sm font-bold ${style.text} mb-1.5 w-full focus:bg-white/50 rounded px-1 -mx-1 transition-colors`}
                />

                <textarea
                  value={item.description ?? ""}
                  onChange={(e) => setItems(prev => prev.map(p => p.id === item.id ? { ...p, description: e.target.value } : p))}
                  onBlur={(e) => updateField(item.id, "description", e.target.value)}
                  rows={2}
                  className={`bg-transparent border-none outline-none resize-none text-xs leading-snug ${style.label} w-full focus:bg-white/50 rounded px-1 -mx-1 transition-colors flex-1`}
                />

                <button
                  onClick={() => cycleColor(item)}
                  title="Cambiar color"
                  className={`absolute bottom-2 right-2 w-3 h-3 rounded-full ${style.icon.replace("text-", "bg-")} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PrioritiesSection;
