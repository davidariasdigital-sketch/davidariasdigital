import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, GripVertical, Lightbulb, Instagram, Youtube, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const FORMATS = ["Reel", "Post", "Carrusel", "Historia", "Live", "Colaboración"];

interface ContentItem {
  id: string;
  title: string;
  month: string;
  column_index: number;
  row_index: number;
  is_idea: boolean;
  format: string | null;
  published: boolean;
}

type Section = "instagram" | "youtube" | "ideas";

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
    if (error) { toast.error("Error cargando contenido"); return; }
    setItems((data as ContentItem[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // section encoded in month field: "IG", "YT", "IDEAS"
  const sectionKey = (section: Section) => section === "instagram" ? "IG" : section === "youtube" ? "YT" : "IDEAS";

  const addItem = async (section: Section, colIndex: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const key = sectionKey(section);
    const existing = items.filter((i) => i.month === key && i.column_index === colIndex);
    const { data, error } = await supabase
      .from("content_items")
      .insert({
        user_id: session.user.id,
        title: "",
        month: key,
        column_index: colIndex,
        row_index: existing.length,
        is_idea: section === "ideas",
        format: null,
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

  const updateFormat = async (id: string, format: string) => {
    const { error } = await supabase
      .from("content_items")
      .update({ format })
      .eq("id", id);
    if (error) { toast.error("Error al actualizar formato"); return; }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, format } : i)));
  };

  const handleDragStart = (item: ContentItem) => setDragItem(item);

  const handleDrop = async (section: Section, targetCol: number) => {
    if (!dragItem) return;
    const key = sectionKey(section);
    const existing = items.filter((i) => i.month === key && i.column_index === targetCol && i.id !== dragItem.id);
    const { error } = await supabase
      .from("content_items")
      .update({ column_index: targetCol, row_index: existing.length, month: key, is_idea: section === "ideas" })
      .eq("id", dragItem.id);
    if (error) { toast.error("Error al mover"); return; }
    setItems((prev) =>
      prev.map((i) =>
        i.id === dragItem.id
          ? { ...i, column_index: targetCol, row_index: existing.length, month: key, is_idea: section === "ideas" }
          : i
      )
    );
    setDragItem(null);
  };

  const getSlotItems = (section: Section, colIndex: number) =>
    items.filter((i) => i.month === sectionKey(section) && i.column_index === colIndex)
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

      {/* Instagram */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Instagram className="h-4 w-4 text-pink-500" />
          <h2 className="text-sm font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">Instagram</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((colIdx) => (
            <ContentColumn
              key={colIdx}
              section="instagram"
              colIndex={colIdx}
              items={getSlotItems("instagram", colIdx)}
              onAdd={() => addItem("instagram", colIdx)}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              editingId={editingId}
              editValue={editValue}
              onEditStart={(id, title) => { setEditingId(id); setEditValue(title); }}
              onEditChange={setEditValue}
              onEditSave={saveEdit}
              onDelete={deleteItem}
              onFormatChange={updateFormat}
              accentClass="bg-pink-500/10 border-pink-500/20"
              chipClass="bg-pink-500/15 text-pink-700 dark:text-pink-300 hover:bg-pink-500/25"
            />
          ))}
        </div>
      </div>

      {/* YouTube */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Youtube className="h-4 w-4 text-red-500" />
          <h2 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">YouTube</h2>
        </div>
        <ContentColumn
          section="youtube"
          colIndex={0}
          items={getSlotItems("youtube", 0)}
          onAdd={() => addItem("youtube", 0)}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          editingId={editingId}
          editValue={editValue}
          onEditStart={(id, title) => { setEditingId(id); setEditValue(title); }}
          onEditChange={setEditValue}
          onEditSave={saveEdit}
          onDelete={deleteItem}
          onFormatChange={updateFormat}
          accentClass="bg-red-500/10 border-red-500/20"
          chipClass="bg-red-500/15 text-red-700 dark:text-red-300 hover:bg-red-500/25"
        />
      </div>

      {/* Ideas */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Ideas Futuras</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1].map((colIdx) => (
            <ContentColumn
              key={`idea-${colIdx}`}
              section="ideas"
              colIndex={colIdx}
              items={getSlotItems("ideas", colIdx)}
              onAdd={() => addItem("ideas", colIdx)}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              editingId={editingId}
              editValue={editValue}
              onEditStart={(id, title) => { setEditingId(id); setEditValue(title); }}
              onEditChange={setEditValue}
              onEditSave={saveEdit}
              onDelete={deleteItem}
              onFormatChange={updateFormat}
              accentClass="bg-amber-500/5 border-amber-500/20"
              chipClass="bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface ContentColumnProps {
  section: Section;
  colIndex: number;
  items: ContentItem[];
  onAdd: () => void;
  onDrop: (section: Section, colIndex: number) => void;
  onDragStart: (item: ContentItem) => void;
  editingId: string | null;
  editValue: string;
  onEditStart: (id: string, title: string) => void;
  onEditChange: (val: string) => void;
  onEditSave: (id: string) => void;
  onDelete: (id: string) => void;
  onFormatChange: (id: string, format: string) => void;
  accentClass: string;
  chipClass: string;
}

const ContentColumn = ({
  section, colIndex, items, onAdd, onDrop, onDragStart,
  editingId, editValue, onEditStart, onEditChange, onEditSave, onDelete,
  onFormatChange, accentClass, chipClass,
}: ContentColumnProps) => {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`rounded-lg border min-h-[120px] p-3 flex flex-col gap-2 transition-colors ${accentClass} ${
        dragOver ? "bg-primary/10 border-primary/40" : ""
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onDrop(section, colIndex); }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => onDragStart(item)}
          className={`group relative rounded-md px-3 py-2 text-xs cursor-grab active:cursor-grabbing transition-all ${chipClass}`}
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
            <div className="flex flex-col gap-1.5">
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
              <FormatSelector
                value={item.format}
                onChange={(f) => onFormatChange(item.id, f)}
              />
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

const FormatSelector = ({ value, onChange }: { value: string | null; onChange: (f: string) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1 text-[10px] opacity-70 hover:opacity-100 transition-opacity rounded px-1.5 py-0.5 bg-background/50"
      >
        {value || "Formato"}
        <ChevronDown className="h-2.5 w-2.5" />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-popover border border-border rounded-md shadow-md py-1 min-w-[100px]">
          {FORMATS.map((f) => (
            <button
              key={f}
              onClick={(e) => { e.stopPropagation(); onChange(f); setOpen(false); }}
              className={`block w-full text-left px-3 py-1 text-[11px] hover:bg-muted/50 transition-colors ${
                value === f ? "font-semibold text-primary" : "text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentPlannerView;
