import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import PlannerGrid, { ContentItem, Section, sectionKey } from "./content/PlannerGrid";
import ContentGoalsCard from "./content/ContentGoalsCard";
import ContentObjectivesCard from "./content/ContentObjectivesCard";

const ContentPlannerView = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [dragItem, setDragItem] = useState<ContentItem | null>(null);
  const [scriptItem, setScriptItem] = useState<ContentItem | null>(null);
  const [scriptValue, setScriptValue] = useState("");

  const fetchItems = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data, error } = await supabase.from("content_items").select("*").order("row_index", { ascending: true });
    if (error) { toast.error("Error cargando contenido"); return; }
    setItems((data as ContentItem[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItem = async (section: Section, colIndex: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const key = sectionKey(section);
    const existing = items.filter((i) => i.month === key && i.column_index === colIndex);
    const { data, error } = await supabase.from("content_items").insert({ user_id: session.user.id, title: "", month: key, column_index: colIndex, row_index: existing.length, is_idea: section === "ideas", format: null }).select().single();
    if (error) { toast.error("Error al crear"); return; }
    const newItem = data as ContentItem;
    setItems((prev) => [...prev, newItem]);
    setEditingId(newItem.id);
    setEditValue("");
  };

  const saveEdit = async (id: string) => {
    if (!editValue.trim()) { await deleteItem(id); return; }
    const { error } = await supabase.from("content_items").update({ title: editValue.trim() }).eq("id", id);
    if (error) { toast.error("Error al guardar"); return; }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, title: editValue.trim() } : i)));
    setEditingId(null);
  };

  const deleteItem = async (id: string) => {
    await supabase.from("content_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setEditingId(null);
  };

  const updateFormat = async (id: string, format: string) => {
    const { error } = await supabase.from("content_items").update({ format }).eq("id", id);
    if (error) { toast.error("Error al actualizar formato"); return; }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, format } : i)));
  };

  const togglePublished = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const { error } = await supabase.from("content_items").update({ published: !item.published }).eq("id", id);
    if (error) { toast.error("Error al actualizar"); return; }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, published: !i.published } : i)));
  };

  const handleDragStart = (item: ContentItem) => setDragItem(item);

  const handleDrop = async (section: Section, targetCol: number) => {
    if (!dragItem) return;
    const key = sectionKey(section);
    const existing = items.filter((i) => i.month === key && i.column_index === targetCol && i.id !== dragItem.id);
    const { error } = await supabase.from("content_items").update({ column_index: targetCol, row_index: existing.length, month: key, is_idea: section === "ideas" }).eq("id", dragItem.id);
    if (error) { toast.error("Error al mover"); return; }
    setItems((prev) => prev.map((i) => i.id === dragItem.id ? { ...i, column_index: targetCol, row_index: existing.length, month: key, is_idea: section === "ideas" } : i));
    setDragItem(null);
  };

  const openScript = (item: ContentItem) => {
    setScriptItem(item);
    setScriptValue(item.description || "");
  };

  const saveScript = async () => {
    if (!scriptItem) return;
    const { error } = await supabase.from("content_items").update({ description: scriptValue }).eq("id", scriptItem.id);
    if (error) { toast.error("Error al guardar guion"); return; }
    setItems((prev) => prev.map((i) => i.id === scriptItem.id ? { ...i, description: scriptValue } : i));
    setScriptItem(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* Left: planner */}
        <div className="min-w-0">
          <PlannerGrid
            items={items}
            editingId={editingId}
            editValue={editValue}
            onAdd={addItem}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onEditStart={(id, title) => { setEditingId(id); setEditValue(title); }}
            onEditChange={setEditValue}
            onEditSave={saveEdit}
            onDelete={deleteItem}
            onFormatChange={updateFormat}
            onTogglePublished={togglePublished}
            onOpenScript={openScript}
          />
        </div>

        {/* Right: goals sidebar */}
        <aside className="space-y-3 sm:space-y-4 lg:sticky lg:top-4 lg:self-start">
          <ContentGoalsCard />
          <ContentObjectivesCard />
        </aside>
      </div>

      {/* Script Dialog */}
      <Dialog open={!!scriptItem} onOpenChange={(open) => { if (!open) saveScript(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] bg-white text-gray-900 border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">{scriptItem?.title || "Sin título"} — Guion</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Escribe el guion del video aquí..."
            value={scriptValue}
            onChange={(e) => setScriptValue(e.target.value)}
            className="min-h-[400px] text-sm leading-relaxed bg-gray-50 text-gray-900 border-gray-200 placeholder:text-gray-400 resize-y"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentPlannerView;
