import { useEffect, useState } from "react";
import { Plus, X, Target } from "lucide-react";

interface Objective {
  id: string;
  label: string;
  subLabel?: string;
  color: string;
}

const STORAGE_KEY = "content_objectives_v1";

const DEFAULT_PALETTE = [
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#a855f7", // purple
  "#f97316", // orange
  "#06b6d4", // cyan
  "#ef4444", // red
];

const DEFAULTS: Objective[] = [
  { id: "1", label: "Marca personal", color: "#ec4899" },
  { id: "2", label: "Engagement", color: "#f59e0b" },
  { id: "3", label: "Ventas", color: "#10b981" },
  { id: "4", label: "Educación", color: "#3b82f6" },
];

const ContentObjectivesCard = () => {
  const [objectives, setObjectives] = useState<Objective[]>(DEFAULTS);
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setObjectives(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: Objective[]) => {
    setObjectives(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const updateLabel = (id: string, label: string) => {
    persist(objectives.map((o) => (o.id === id ? { ...o, label } : o)));
  };

  const updateSubLabel = (id: string, subLabel: string) => {
    persist(objectives.map((o) => (o.id === id ? { ...o, subLabel } : o)));
  };

  const updateColor = (id: string, color: string) => {
    persist(objectives.map((o) => (o.id === id ? { ...o, color } : o)));
    setPickerOpen(null);
  };

  const addObjective = () => {
    const used = objectives.map((o) => o.color);
    const next = DEFAULT_PALETTE.find((c) => !used.includes(c)) || DEFAULT_PALETTE[0];
    persist([
      ...objectives,
      { id: Date.now().toString(), label: "Nuevo objetivo", color: next },
    ]);
  };

  const removeObjective = (id: string) => {
    persist(objectives.filter((o) => o.id !== id));
  };

  return (
    <div className="dash-tile rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))] flex items-center gap-1.5">
            <Target className="h-3 w-3" />
            Objetivos por color
          </h3>
          <p className="text-[11px] text-[hsl(var(--dash-text-muted))] mt-1">
            Define el objetivo de cada contenido.
          </p>
        </div>
        <button
          onClick={addObjective}
          className="flex-shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:scale-105 transition-transform"
          title="Añadir objetivo"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        {objectives.map((o) => (
          <div
            key={o.id}
            className="group relative flex items-center gap-2 rounded-xl border border-[hsl(0,0%,92%)] bg-white/60 px-2.5 py-2"
          >
            <button
              onClick={() => setPickerOpen(pickerOpen === o.id ? null : o.id)}
              className="flex-shrink-0 h-6 w-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
              style={{ backgroundColor: o.color }}
              title="Cambiar color"
            />
            <input
              value={o.label}
              onChange={(e) => updateLabel(o.id, e.target.value)}
              className="flex-1 min-w-0 bg-transparent outline-none text-xs font-medium text-[hsl(var(--dash-text))] focus:bg-[hsl(0,0%,96%)] rounded px-1 py-0.5"
            />
            <button
              onClick={() => removeObjective(o.id)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-[hsl(var(--dash-text-muted))] hover:text-red-500 transition-all"
              title="Eliminar"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {pickerOpen === o.id && (
              <div className="absolute top-full left-0 mt-1 z-20 flex flex-wrap gap-1.5 p-2 rounded-xl bg-white border border-[hsl(0,0%,92%)] shadow-lg">
                {DEFAULT_PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateColor(o.id, c)}
                    className="h-5 w-5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        {objectives.length === 0 && (
          <p className="text-[11px] text-[hsl(var(--dash-text-muted))] text-center py-3">
            Añade tu primer objetivo
          </p>
        )}
      </div>
    </div>
  );
};

export default ContentObjectivesCard;
