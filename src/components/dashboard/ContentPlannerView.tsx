import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Lightbulb, Instagram, Youtube, Check } from "lucide-react";
import { toast } from "sonner";

const FORMATS = ["Reel", "Post", "Carrusel", "Historia", "Live", "Colaboración", "Short", "Podcast", "Tutorial", "Behind the Scenes"];

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

  const togglePublished = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const { error } = await supabase
      .from("content_items")
      .update({ published: !item.published })
      .eq("id", id);
    if (error) { toast.error("Error al actualizar"); return; }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, published: !i.published } : i)));
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
      {/* Top row: Instagram 2x2 + YouTube */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5 items-start">
        {/* Instagram 2x2 */}
        <div>
          <SectionHeader icon={<Instagram className="h-5 w-5" />} label="Instagram" colorClass="text-pink-500" />
          <div className="grid grid-cols-2 gap-3">
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
                onTogglePublished={togglePublished}
                accentClass="border-pink-500/20"
                publishedClass="bg-emerald-500/15 border-emerald-500/30"
                chipClass="bg-pink-500/10 hover:bg-pink-500/15"
              />
            ))}
          </div>
        </div>

        {/* YouTube - single module to the right */}
        <div className="w-full">
          <SectionHeader icon={<Youtube className="h-5 w-5" />} label="YouTube" colorClass="text-red-500" />
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
            onTogglePublished={togglePublished}
            accentClass="border-red-500/20"
            publishedClass="bg-emerald-500/15 border-emerald-500/30"
            chipClass="bg-red-500/10 hover:bg-red-500/15"
          />
        </div>
      </div>

      {/* Ideas Futuras - below */}
      <div>
        <SectionHeader icon={<Lightbulb className="h-5 w-5" />} label="Ideas Futuras" colorClass="text-amber-500" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((colIdx) => (
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
              onTogglePublished={togglePublished}
              accentClass="border-amber-500/20"
              publishedClass="bg-emerald-500/15 border-emerald-500/30"
              chipClass="bg-amber-500/10 hover:bg-amber-500/15"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ icon, label, colorClass }: { icon: React.ReactNode; label: string; colorClass: string }) => (
  <div className="flex items-center gap-2.5 mb--6">
    <span className={colorClass}>{icon}</span>
    <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/70">{label}</h2>
  </div>
);

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
  onTogglePublished: (id: string) => void;
  accentClass: string;
  publishedClass: string;
  chipClass: string;
}

const ContentColumn = ({
  section, colIndex, items, onAdd, onDrop, onDragStart,
  editingId, editValue, onEditStart, onEditChange, onEditSave, onDelete,
  onFormatChange, onTogglePublished, accentClass, publishedClass, chipClass,
}: ContentColumnProps) => {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`group/col liquid-glass rounded-[var(--radius)] min-h-[100px] p-3 flex flex-col gap-2.5 transition-all ${
        dragOver ? "scale-[1.01] ring-1 ring-primary/30" : ""
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
          className={`group relative rounded-[var(--radius)] px-3 py-3 text-xs cursor-grab active:cursor-grabbing transition-all border backdrop-blur-sm ${
            item.published
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:text-emerald-200"
              : "bg-background/60 border-border/40 text-foreground hover:border-border/70"
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
              className="w-full bg-transparent outline-none text-xs text-center font-medium"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 relative">
              {/* Action buttons - top right corner */}
              <div className="absolute -top-1 -right-1 flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); onTogglePublished(item.id); }}
                  className={`rounded-full p-0.5 transition-all ${
                    item.published ? "text-emerald-600 opacity-100" : "hover:bg-muted"
                  }`}
                >
                  <Check className="h-2.5 w-2.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  className="rounded-full p-0.5 hover:bg-destructive/10 transition-all"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
              {/* Title centered */}
              <span
                className="text-[11px] leading-snug font-medium cursor-text text-center w-full"
                onClick={() => onEditStart(item.id, item.title)}
              >
                {item.title || "Sin título"}
              </span>
              {/* Format centered - hidden for YouTube */}
              {section !== "youtube" && (
                <FormatSelector
                  value={item.format}
                  onChange={(f) => onFormatChange(item.id, f)}
                />
              )}
            </div>
          )}
        </div>
      ))}

      {items.length === 0 && (
        <button
          onClick={onAdd}
          className="flex-1 flex items-center justify-center text-muted-foreground rounded-lg hover:bg-muted/50 opacity-30 hover:opacity-80 transition-all"
        >
          <Plus className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

const FormatSelector = ({ value, onChange }: { value: string | null; onChange: (f: string) => void }) => {
  return (
    <select
      value={value ?? ""}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
      className="text-[10px] opacity-80 hover:opacity-100 transition-opacity rounded-full px-2 py-0.5 bg-background/60 border border-border/50 text-foreground outline-none"
    >
      <option value="" disabled>
        Formato
      </option>
      {FORMATS.map((f) => (
        <option key={f} value={f}>
          {f}
        </option>
      ))}
    </select>
  );
};

export default ContentPlannerView;
