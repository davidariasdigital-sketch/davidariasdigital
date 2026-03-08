import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, GripVertical, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  title: string;
  month: string;
  column_index: number;
  row_index: number;
  is_idea: boolean;
}

const ContentPlannerView = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [dragItem, setDragItem] = useState<ContentItem | null>(null);

  const fetchItems = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data, error } = await supabase
      .from("content_items")
      .select("*")
      .order("row_index", { ascending: true });
    if (error) {
      toast.error("Error cargando contenido");
      return;
    }
    setItems((data as ContentItem[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItem = async (colIndex: number, isIdea: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const existing = items.filter(
      (i) => i.column_index === colIndex && i.is_idea === isIdea && i.month === "GENERAL"
    );
    const { data, error } = await supabase
      .from("content_items")
      .insert({
        user_id: session.user.id,
        title: "",
        month: "GENERAL",
        column_index: colIndex,
        row_index: existing.length,
        is_idea: isIdea,
      })
      .select()
      .single();
    if (error) { toast.error("Error al crear"); return; }
    const newItem = data as ContentItem;
    setItems((prev) => [...prev, newItem]);
    setEditingId(newItem.id);
    setEditValue("");
  };

  const saveEdit = async (id: string) => {
    if (!editValue.trim()) { await deleteItem(id); return; }
    const { error } = await supabase
      .from("content_items")
      .update({ title: editValue.trim() })
      .eq("id", id);
    if (error) { toast.error("Error al guardar"); return; }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, title: editValue.trim() } : i)));
    setEditingId(null);
  };

  const deleteItem = async (id: string) => {
    await supabase.from("content_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setEditingId(null);
  };

  const handleDragStart = (item: ContentItem) => setDragItem(item);

  const handleDrop = async (targetCol: number, targetIsIdea: boolean) => {
    if (!dragItem) return;
    const existing = items.filter(
      (i) => i.column_index === targetCol && i.is_idea === targetIsIdea && i.month === "GENERAL" && i.id !== dragItem.id
    );
    const { error } = await supabase
      .from("content_items")
      .update({ column_index: targetCol, row_index: existing.length, is_idea: targetIsIdea, month: "GENERAL" })
      .eq("id", dragItem.id);
    if (error) { toast.error("Error al mover"); return; }
    setItems((prev) =>
      prev.map((i) =>
        i.id === dragItem.id
          ? { ...i, column_index: targetCol, row_index: existing.length, is_idea: targetIsIdea, month: "GENERAL" }
          : i
      )
    );
    setDragItem(null);
  };

  const getSlotItems = (colIndex: number, isIdea: boolean) =>
    items
      .filter((i) => i.column_index === colIndex && i.is_idea === isIdea && i.month === "GENERAL")
      .sort((a, b) => a.row_index - b.row_index);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-foreground">Planeador de Contenido</h1>

      {/* 4 Content columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((colIdx) => (
          <ContentColumn
            key={colIdx}
            label={`Contenido ${colIdx + 1}`}
            colIndex={colIdx}
            isIdea={false}
            items={getSlotItems(colIdx, false)}
            onAdd={() => addItem(colIdx, false)}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            editingId={editingId}
            editValue={editValue}
            onEditStart={(id, title) => { setEditingId(id); setEditValue(title); }}
            onEditChange={setEditValue}
            onEditSave={saveEdit}
            onDelete={deleteItem}
          />
        ))}
      </div>

      {/* Ideas section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Ideas Futuras</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1].map((colIdx) => (
            <ContentColumn
              key={`idea-${colIdx}`}
              label={`Ideas ${colIdx + 1}`}
              colIndex={colIdx}
              isIdea={true}
              items={getSlotItems(colIdx, true)}
              onAdd={() => addItem(colIdx, true)}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              editingId={editingId}
              editValue={editValue}
              onEditStart={(id, title) => { setEditingId(id); setEditValue(title); }}
              onEditChange={setEditValue}
              onEditSave={saveEdit}
              onDelete={deleteItem}
              isIdeaStyle
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface ContentColumnProps {
  label: string;
  colIndex: number;
  isIdea: boolean;
  items: ContentItem[];
  onAdd: () => void;
  onDrop: (colIndex: number, isIdea: boolean) => void;
  onDragStart: (item: ContentItem) => void;
  editingId: string | null;
  editValue: string;
  onEditStart: (id: string, title: string) => void;
  onEditChange: (val: string) => void;
  onEditSave: (id: string) => void;
  onDelete: (id: string) => void;
  isIdeaStyle?: boolean;
}

const ContentColumn = ({
  label, colIndex, isIdea, items, onAdd, onDrop, onDragStart,
  editingId, editValue, onEditStart, onEditChange, onEditSave, onDelete, isIdeaStyle,
}: ContentColumnProps) => {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`rounded-lg border border-border min-h-[160px] p-3 flex flex-col gap-2 transition-colors ${
        isIdeaStyle ? "bg-amber-500/5 border-amber-500/20" : "bg-muted/30"
      } ${dragOver ? "bg-primary/10 border-primary/40" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onDrop(colIndex, isIdea); }}
    >
      <span className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${
        isIdeaStyle ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
      }`}>
        {label}
      </span>

      {items.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => onDragStart(item)}
          className={`group relative rounded-md px-3 py-2 text-xs cursor-grab active:cursor-grabbing transition-all ${
            isIdeaStyle
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25"
              : "bg-primary/10 text-foreground hover:bg-primary/20"
          }`}
        >
          {editingId === item.id ? (
            <input
              autoFocus
              value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              onBlur={() => onEditSave(item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEditSave(item.id);
                if (e.key === "Escape") { onEditChange(item.title); onEditSave(item.id); }
              }}
              className="w-full bg-transparent outline-none text-xs"
            />
          ) : (
            <div className="flex items-start gap-1">
              <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-40 shrink-0 mt-0.5" />
              <span className="flex-1 cursor-text leading-tight" onClick={() => onEditStart(item.id, item.title)}>
                {item.title || "Sin título"}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="opacity-0 group-hover:opacity-60 hover:opacity-100 shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={onAdd}
        className="mt-auto flex items-center justify-center gap-1 text-[10px] text-muted-foreground py-1.5 rounded-md hover:bg-muted/50 opacity-50 hover:opacity-100 transition-opacity"
      >
        <Plus className="h-3 w-3" /> Agregar
      </button>
    </div>
  );
};

export default ContentPlannerView;
