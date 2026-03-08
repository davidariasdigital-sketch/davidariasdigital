import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, GripVertical, Lightbulb } from "lucide-react";
import { toast } from "sonner";

const MONTHS = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

const COLUMNS_PER_MONTH = 4;

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

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (month: string, colIndex: number, isIdea: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const existingInSlot = items.filter(
      (i) => i.month === month && i.column_index === colIndex && i.is_idea === isIdea
    );
    const newRow = existingInSlot.length;
    const { data, error } = await supabase
      .from("content_items")
      .insert({
        user_id: session.user.id,
        title: "",
        month,
        column_index: colIndex,
        row_index: newRow,
        is_idea: isIdea,
      })
      .select()
      .single();
    if (error) {
      toast.error("Error al crear");
      return;
    }
    const newItem = data as ContentItem;
    setItems((prev) => [...prev, newItem]);
    setEditingId(newItem.id);
    setEditValue("");
  };

  const saveEdit = async (id: string) => {
    if (!editValue.trim()) {
      await deleteItem(id);
      return;
    }
    const { error } = await supabase
      .from("content_items")
      .update({ title: editValue.trim() })
      .eq("id", id);
    if (error) {
      toast.error("Error al guardar");
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, title: editValue.trim() } : i))
    );
    setEditingId(null);
  };

  const deleteItem = async (id: string) => {
    await supabase.from("content_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setEditingId(null);
  };

  const handleDragStart = (item: ContentItem) => {
    setDragItem(item);
  };

  const handleDrop = async (
    targetMonth: string,
    targetCol: number,
    targetIsIdea: boolean
  ) => {
    if (!dragItem) return;
    const existingInSlot = items.filter(
      (i) =>
        i.month === targetMonth &&
        i.column_index === targetCol &&
        i.is_idea === targetIsIdea &&
        i.id !== dragItem.id
    );
    const newRow = existingInSlot.length;

    const { error } = await supabase
      .from("content_items")
      .update({
        month: targetMonth,
        column_index: targetCol,
        row_index: newRow,
        is_idea: targetIsIdea,
      })
      .eq("id", dragItem.id);

    if (error) {
      toast.error("Error al mover");
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === dragItem.id
          ? {
              ...i,
              month: targetMonth,
              column_index: targetCol,
              row_index: newRow,
              is_idea: targetIsIdea,
            }
          : i
      )
    );
    setDragItem(null);
  };

  const getItemsForSlot = (
    month: string,
    colIndex: number,
    isIdea: boolean
  ) =>
    items
      .filter(
        (i) =>
          i.month === month &&
          i.column_index === colIndex &&
          i.is_idea === isIdea
      )
      .sort((a, b) => a.row_index - b.row_index);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Planeador de Contenido</h1>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[1200px]">
          {/* Header row */}
          <div className="grid grid-cols-[180px_repeat(4,1fr)_8px_repeat(2,1fr)] gap-0">
            <div className="bg-muted/50 border border-border px-3 py-2 text-xs font-bold text-foreground/60 uppercase tracking-wider">
              Mes
            </div>
            {Array.from({ length: COLUMNS_PER_MONTH }).map((_, i) => (
              <div
                key={i}
                className="bg-muted/50 border border-border px-3 py-2 text-xs font-bold text-foreground/60 uppercase tracking-wider text-center"
              >
                Contenido {i + 1}
              </div>
            ))}
            <div />
            <div
              className="bg-amber-500/20 border border-amber-500/30 px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-center col-span-2 flex items-center justify-center gap-1"
            >
              <Lightbulb className="h-3 w-3" />
              Ideas
            </div>
          </div>

          {/* Month rows */}
          {MONTHS.map((month) => (
            <div
              key={month}
              className="grid grid-cols-[180px_repeat(4,1fr)_8px_repeat(2,1fr)] gap-0"
            >
              {/* Month label */}
              <div className="bg-primary/10 border border-border px-3 py-3 flex items-start">
                <span className="text-xs font-bold text-primary tracking-wider">
                  {month}
                </span>
              </div>

              {/* Content columns */}
              {Array.from({ length: COLUMNS_PER_MONTH }).map((_, colIdx) => (
                <DroppableCell
                  key={`${month}-${colIdx}`}
                  month={month}
                  colIndex={colIdx}
                  isIdea={false}
                  items={getItemsForSlot(month, colIdx, false)}
                  onAdd={() => addItem(month, colIdx, false)}
                  onDrop={handleDrop}
                  onDragStart={handleDragStart}
                  editingId={editingId}
                  editValue={editValue}
                  onEditStart={(id, title) => {
                    setEditingId(id);
                    setEditValue(title);
                  }}
                  onEditChange={setEditValue}
                  onEditSave={saveEdit}
                  onDelete={deleteItem}
                  isDragging={!!dragItem}
                />
              ))}

              {/* Spacer */}
              <div className="bg-background" />

              {/* Ideas columns */}
              {Array.from({ length: 2 }).map((_, colIdx) => (
                <DroppableCell
                  key={`${month}-idea-${colIdx}`}
                  month={month}
                  colIndex={colIdx}
                  isIdea={true}
                  items={getItemsForSlot(month, colIdx, true)}
                  onAdd={() => addItem(month, colIdx, true)}
                  onDrop={handleDrop}
                  onDragStart={handleDragStart}
                  editingId={editingId}
                  editValue={editValue}
                  onEditStart={(id, title) => {
                    setEditingId(id);
                    setEditValue(title);
                  }}
                  onEditChange={setEditValue}
                  onEditSave={saveEdit}
                  onDelete={deleteItem}
                  isDragging={!!dragItem}
                  isIdeaStyle
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface DroppableCellProps {
  month: string;
  colIndex: number;
  isIdea: boolean;
  items: ContentItem[];
  onAdd: () => void;
  onDrop: (month: string, colIndex: number, isIdea: boolean) => void;
  onDragStart: (item: ContentItem) => void;
  editingId: string | null;
  editValue: string;
  onEditStart: (id: string, title: string) => void;
  onEditChange: (val: string) => void;
  onEditSave: (id: string) => void;
  onDelete: (id: string) => void;
  isDragging: boolean;
  isIdeaStyle?: boolean;
}

const DroppableCell = ({
  month,
  colIndex,
  isIdea,
  items,
  onAdd,
  onDrop,
  onDragStart,
  editingId,
  editValue,
  onEditStart,
  onEditChange,
  onEditSave,
  onDelete,
  isDragging,
  isIdeaStyle,
}: DroppableCellProps) => {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`border border-border min-h-[80px] p-1.5 flex flex-col gap-1 transition-colors ${
        isIdeaStyle ? "bg-amber-500/5" : "bg-background"
      } ${dragOver ? "bg-primary/10 border-primary/40" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onDrop(month, colIndex, isIdea);
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => onDragStart(item)}
          className={`group relative rounded px-2 py-1.5 text-xs cursor-grab active:cursor-grabbing transition-all ${
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
                if (e.key === "Escape") {
                  onEditChange(item.title);
                  onEditSave(item.id);
                }
              }}
              className="w-full bg-transparent outline-none text-xs"
            />
          ) : (
            <div className="flex items-start gap-1">
              <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-40 shrink-0 mt-0.5" />
              <span
                className="flex-1 cursor-text leading-tight"
                onClick={() => onEditStart(item.id, item.title)}
              >
                {item.title || "Sin título"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
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
        className="mt-auto opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-40 transition-opacity flex items-center justify-center gap-1 text-[10px] text-muted-foreground py-1 rounded hover:bg-muted/50"
        style={{ opacity: items.length === 0 ? 0.4 : undefined }}
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
};

export default ContentPlannerView;
