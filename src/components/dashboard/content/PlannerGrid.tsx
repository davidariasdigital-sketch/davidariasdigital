import { useState } from "react";
import { Plus, X, Lightbulb, Instagram, Sun, Check, Video, FileText } from "lucide-react";

export const FORMATS = ["Reel", "Post", "Carrusel", "Historia", "Live", "Colaboración", "Short", "Podcast", "Tutorial", "Behind the Scenes"];
export const SOLAR_FORMATS = ["Cortometraje", "Videoclip"];

export interface ContentItem {
  id: string; title: string; month: string; column_index: number;
  row_index: number; is_idea: boolean; format: string | null; published: boolean;
  description: string;
}

export type Section = "instagram" | "ideas" | "solar" | "tiktok";

export const sectionKey = (section: Section) => {
  switch (section) {
    case "instagram": return "IG";
    case "solar": return "SOLAR";
    case "ideas": return "IDEAS";
    case "tiktok": return "TIKTOK";
  }
};

interface PlannerGridProps {
  items: ContentItem[];
  editingId: string | null;
  editValue: string;
  onAdd: (section: Section, colIndex: number) => void;
  onDragStart: (item: ContentItem) => void;
  onDrop: (section: Section, colIndex: number) => void;
  onEditStart: (id: string, title: string) => void;
  onEditChange: (val: string) => void;
  onEditSave: (id: string) => void;
  onDelete: (id: string) => void;
  onFormatChange: (id: string, format: string) => void;
  onTogglePublished: (id: string) => void;
  onOpenScript: (item: ContentItem) => void;
}

interface SectionTheme {
  // Module wrapper
  moduleBg: string;
  moduleBorder: string;
  // Header
  headerIconBg: string;
  headerIconText: string;
  headerLabel: string;
  // Slot (column)
  slotBg: string;
  slotBorder: string;
  // Card accents
  cardBorder: string;
  cardHoverBorder: string;
  addBtn: string;
}

const THEMES: Record<Section, SectionTheme> = {
  instagram: {
    moduleBg: "bg-gradient-to-br from-pink-50 via-rose-50/60 to-fuchsia-50",
    moduleBorder: "border-pink-200/70",
    headerIconBg: "bg-pink-500",
    headerIconText: "text-white",
    headerLabel: "text-pink-700",
    slotBg: "bg-white/70 backdrop-blur-sm",
    slotBorder: "border-pink-200/60",
    cardBorder: "border-pink-200",
    cardHoverBorder: "hover:border-pink-400",
    addBtn: "text-pink-400 hover:text-pink-600 hover:bg-pink-100/50",
  },
  tiktok: {
    moduleBg: "bg-gradient-to-br from-slate-50 via-zinc-50/60 to-cyan-50/40",
    moduleBorder: "border-slate-200/70",
    headerIconBg: "bg-gradient-to-br from-cyan-500 to-pink-500",
    headerIconText: "text-white",
    headerLabel: "text-slate-800",
    slotBg: "bg-white/70 backdrop-blur-sm",
    slotBorder: "border-slate-200/60",
    cardBorder: "border-slate-200",
    cardHoverBorder: "hover:border-slate-400",
    addBtn: "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50",
  },
  ideas: {
    moduleBg: "bg-gradient-to-br from-amber-50 via-yellow-50/60 to-orange-50/40",
    moduleBorder: "border-amber-200/70",
    headerIconBg: "bg-amber-400",
    headerIconText: "text-amber-900",
    headerLabel: "text-amber-800",
    slotBg: "bg-white/70 backdrop-blur-sm",
    slotBorder: "border-amber-200/60",
    cardBorder: "border-amber-200",
    cardHoverBorder: "hover:border-amber-400",
    addBtn: "text-amber-400 hover:text-amber-600 hover:bg-amber-100/50",
  },
  solar: {
    moduleBg: "bg-gradient-to-br from-orange-50 via-amber-50/60 to-red-50/40",
    moduleBorder: "border-orange-200/70",
    headerIconBg: "bg-orange-500",
    headerIconText: "text-white",
    headerLabel: "text-orange-700",
    slotBg: "bg-white/70 backdrop-blur-sm",
    slotBorder: "border-orange-200/60",
    cardBorder: "border-orange-200",
    cardHoverBorder: "hover:border-orange-400",
    addBtn: "text-orange-400 hover:text-orange-600 hover:bg-orange-100/50",
  },
};

const PlannerGrid = (props: PlannerGridProps) => {
  const getSlotItems = (section: Section, colIndex: number) =>
    props.items.filter((i) => i.month === sectionKey(section) && i.column_index === colIndex).sort((a, b) => a.row_index - b.row_index);

  const renderModule = (
    section: Section,
    label: string,
    icon: React.ReactNode,
    count: number,
    formats: string[],
  ) => {
    const theme = THEMES[section];
    const totalItems = props.items.filter((i) => i.month === sectionKey(section)).length;
    return (
      <section className={`relative rounded-3xl border ${theme.moduleBorder} ${theme.moduleBg} p-4 sm:p-5 shadow-sm`}>
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className={`flex items-center justify-center h-8 w-8 rounded-xl ${theme.headerIconBg} ${theme.headerIconText} shadow-sm`}>
              {icon}
            </span>
            <div className="flex flex-col">
              <h2 className={`text-sm font-bold tracking-tight ${theme.headerLabel}`}>{label}</h2>
              <span className="text-[10px] uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">
                {totalItems} {totalItems === 1 ? "contenido" : "contenidos"}
              </span>
            </div>
          </div>
        </header>
        <div className={`grid grid-cols-2 ${count === 8 ? "sm:grid-cols-4" : "sm:grid-cols-4"} gap-2.5 sm:gap-3`}>
          {Array.from({ length: count }).map((_, colIdx) => (
            <ContentColumn
              key={`${section}-${colIdx}`}
              section={section}
              colIndex={colIdx}
              items={getSlotItems(section, colIdx)}
              onAdd={() => props.onAdd(section, colIdx)}
              onDrop={props.onDrop}
              onDragStart={props.onDragStart}
              editingId={props.editingId}
              editValue={props.editValue}
              onEditStart={props.onEditStart}
              onEditChange={props.onEditChange}
              onEditSave={props.onEditSave}
              onDelete={props.onDelete}
              onFormatChange={props.onFormatChange}
              onTogglePublished={props.onTogglePublished}
              onOpenScript={props.onOpenScript}
              theme={theme}
              formats={formats}
              showFormat
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {renderModule("instagram", "Instagram", <Instagram className="h-4 w-4" />, 4, FORMATS)}
        {renderModule("tiktok", "TikTok", <Video className="h-4 w-4" />, 4, FORMATS)}
        {renderModule("solar", "Solar", <Sun className="h-4 w-4" />, 4, SOLAR_FORMATS)}
      </div>
      {renderModule("ideas", "Ideas Futuras", <Lightbulb className="h-4 w-4" />, 8, FORMATS)}
    </div>
  );
};

interface ContentColumnProps {
  section: Section; colIndex: number; items: ContentItem[]; onAdd: () => void;
  onDrop: (section: Section, colIndex: number) => void; onDragStart: (item: ContentItem) => void;
  editingId: string | null; editValue: string; onEditStart: (id: string, title: string) => void;
  onEditChange: (val: string) => void; onEditSave: (id: string) => void; onDelete: (id: string) => void;
  onFormatChange: (id: string, format: string) => void; onTogglePublished: (id: string) => void;
  onOpenScript: (item: ContentItem) => void;
  theme: SectionTheme; formats: string[]; showFormat?: boolean;
}

const ContentColumn = ({
  section, colIndex, items, onAdd, onDrop, onDragStart,
  editingId, editValue, onEditStart, onEditChange, onEditSave, onDelete,
  onFormatChange, onTogglePublished, onOpenScript, theme, formats, showFormat,
}: ContentColumnProps) => {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`group/col rounded-2xl min-h-[110px] p-2.5 flex flex-col gap-2 transition-all border ${theme.slotBorder} ${theme.slotBg} ${dragOver ? "ring-2 ring-primary/40 scale-[1.02]" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onDrop(section, colIndex); }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => onDragStart(item)}
          onClick={() => { if (editingId !== item.id) onEditStart(item.id, item.title); }}
          className={`group relative rounded-xl px-2.5 pt-2.5 pb-2 text-xs cursor-grab active:cursor-grabbing transition-all border shadow-sm ${
            item.published
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : `bg-white ${theme.cardBorder} ${theme.cardHoverBorder} text-[hsl(var(--dash-text))]`
          }`}
        >
          {/* Top action bar (always visible on hover) */}
          {editingId !== item.id && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-full px-1 py-0.5 shadow-md z-10">
              <button
                onClick={(e) => { e.stopPropagation(); onTogglePublished(item.id); }}
                className={`rounded-full p-1 transition-all ${item.published ? "text-emerald-600 bg-emerald-50" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
                title={item.published ? "Marcar como no publicado" : "Marcar como publicado"}
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="rounded-full p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                title="Eliminar"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {editingId === item.id ? (
            <input
              autoFocus value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              onBlur={() => onEditSave(item.id)}
              onKeyDown={(e) => { if (e.key === "Enter") onEditSave(item.id); if (e.key === "Escape") { onEditChange(item.title); onEditSave(item.id); } }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent outline-none text-xs text-center font-medium py-1"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] leading-snug font-semibold text-center w-full break-words">
                {item.title || "Sin título"}
              </span>
              {showFormat && <FormatSelector value={item.format} onChange={(f) => onFormatChange(item.id, f)} formats={formats} />}
              {/* Guion button - bottom, full width, well placed */}
              <button
                onClick={(e) => { e.stopPropagation(); onOpenScript(item); }}
                className={`mt-0.5 w-full flex items-center justify-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all border ${
                  item.description
                    ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
                title="Guion"
              >
                <FileText className="h-3 w-3" />
                <span>{item.description ? "Ver guion" : "Guion"}</span>
              </button>
            </div>
          )}
        </div>
      ))}
      {items.length === 0 && (
        <button onClick={onAdd} className={`flex-1 flex items-center justify-center rounded-xl transition-all min-h-[80px] ${theme.addBtn}`}>
          <Plus className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

const FormatSelector = ({ value, onChange, formats }: { value: string | null; onChange: (f: string) => void; formats: string[] }) => (
  <select
    value={value ?? ""}
    onClick={(e) => e.stopPropagation()}
    onChange={(e) => { e.stopPropagation(); onChange(e.target.value); }}
    className="w-full text-[10px] rounded-full px-2 py-0.5 bg-gray-50 border border-gray-200 text-[hsl(var(--dash-text))] outline-none cursor-pointer hover:bg-gray-100 transition-colors"
  >
    <option value="" disabled>Formato</option>
    {formats.map((f) => <option key={f} value={f}>{f}</option>)}
  </select>
);

export default PlannerGrid;
