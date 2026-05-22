import { useEffect, useState } from "react";
import { Plus, X, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DEFAULT_PALETTE, DEFAULT_OBJECTIVES, type Objective } from "./objectiveColors";

const emitChanged = () => window.dispatchEvent(new CustomEvent("content-objectives-changed"));

const ContentObjectivesCard = () => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data, error } = await supabase
      .from("content_objectives")
      .select("*")
      .order("position", { ascending: true });
    if (error) { toast.error("Error cargando objetivos"); return; }

    if (!data || data.length === 0) {
      // Seed defaults the first time
      const seed = DEFAULT_OBJECTIVES.map((o) => ({ ...o, user_id: session.user.id }));
      const { data: inserted } = await supabase.from("content_objectives").insert(seed).select();
      setObjectives((inserted as Objective[]) || []);
    } else {
      setObjectives(data as Objective[]);
    }
    setLoading(false);
    emitChanged();
  };

  useEffect(() => { load(); }, []);

  const updateField = async (id: string, patch: Partial<Objective>) => {
    setObjectives((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    const { error } = await supabase.from("content_objectives").update(patch).eq("id", id);
    if (error) toast.error("Error al guardar");
    else emitChanged();
  };

  const addObjective = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const used = objectives.map((o) => o.color);
    const color = DEFAULT_PALETTE.find((c) => !used.includes(c)) || DEFAULT_PALETTE[0];
    const { data, error } = await supabase
      .from("content_objectives")
      .insert({ user_id: session.user.id, label: "Nuevo objetivo", color, position: objectives.length })
      .select()
      .single();
    if (error) { toast.error("Error al crear"); return; }
    setObjectives((prev) => [...prev, data as Objective]);
    emitChanged();
  };

  const removeObjective = async (id: string) => {
    setObjectives((prev) => prev.filter((o) => o.id !== id));
    await supabase.from("content_objectives").delete().eq("id", id);
    emitChanged();
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
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <input
                value={o.label}
                onChange={(e) => updateField(o.id, { label: e.target.value })}
                placeholder="Objetivo"
                className="flex-1 min-w-0 bg-transparent outline-none text-xs font-medium text-[hsl(var(--dash-text))] focus:bg-[hsl(0,0%,96%)] rounded px-1 py-0.5"
              />
              <span className="text-[hsl(var(--dash-text-muted))] text-[10px]">·</span>
              <input
                value={o.sub_label || ""}
                onChange={(e) => updateField(o.id, { sub_label: e.target.value })}
                placeholder="Subobjetivo"
                className="flex-1 min-w-0 bg-transparent outline-none text-[11px] text-[hsl(var(--dash-text-muted))] italic focus:bg-[hsl(0,0%,96%)] rounded px-1 py-0.5"
              />
            </div>
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
                    onClick={() => { updateField(o.id, { color: c }); setPickerOpen(null); }}
                    className="h-5 w-5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        {!loading && objectives.length === 0 && (
          <p className="text-[11px] text-[hsl(var(--dash-text-muted))] text-center py-3">
            Añade tu primer objetivo
          </p>
        )}
      </div>
    </div>
  );
};

export default ContentObjectivesCard;
