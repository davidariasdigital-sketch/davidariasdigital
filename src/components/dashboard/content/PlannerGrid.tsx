import { useEffect, useState } from "react";
import { Plus, X, Sparkles, Clapperboard, Check, FileText } from "lucide-react";
import { readObjectives, readItemColors, writeItemColor, type Objective } from "./objectiveColors";

export const FORMATS = ["Reel", "Post", "Carrusel", "Historia", "Live", "Colaboración", "Short", "Podcast", "Tutorial", "Behind the Scenes"];
export const SOLAR_FORMATS = ["Cortometraje", "Videoclip"];

// Distinctive color per format (subtle pill style)
const FORMAT_COLORS: Record<string, string> = {
  "Reel": "bg-fuchsia-100 border-fuchsia-300 text-fuchsia-700",
  "Post": "bg-sky-100 border-sky-300 text-sky-700",
  "Carrusel": "bg-violet-100 border-violet-300 text-violet-700",
  "Historia": "bg-rose-100 border-rose-300 text-rose-700",
  "Live": "bg-red-100 border-red-300 text-red-700",
  "Colaboración": "bg-teal-100 border-teal-300 text-teal-700",
  "Short": "bg-cyan-100 border-cyan-300 text-cyan-700",
  "Podcast": "bg-purple-100 border-purple-300 text-purple-700",
  "Tutorial": "bg-emerald-100 border-emerald-300 text-emerald-700",
  "Behind the Scenes": "bg-amber-100 border-amber-300 text-amber-700",
  "Cortometraje": "bg-orange-100 border-orange-300 text-orange-700",
  "Videoclip": "bg-indigo-100 border-indigo-300 text-indigo-700",
};

// Refined monochrome glyphs (no generic brand icons)
const IGGlyph = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
  </svg>
);
const TTGlyph = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M14 4c.4 2.4 2 4 4.5 4.3" />
  </svg>
);

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
      <section className={`relative rounded-3xl border ${theme.moduleBorder} ${theme.moduleBg} p-3 shadow-sm`}>
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
        <div className={`grid grid-cols-2 ${count > 4 ? "sm:grid-cols-4" : "grid-cols-2"} gap-2`}>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {renderModule("instagram", "Instagram", <IGGlyph />, 4, FORMATS)}
        {renderModule("solar", "Solar", <Clapperboard className="h-4 w-4" />, 4, SOLAR_FORMATS)}
      </div>
      {renderModule("ideas", "Ideas Futuras", <Sparkles className="h-4 w-4" />, 16, FORMATS)}
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
  const [colors, setColors] = useState<Record<string, string>>(() => readItemColors());
  useEffect(() => {
    const refresh = () => setColors(readItemColors());
    window.addEventListener("storage", refresh);
    window.addEventListener("content-item-colors-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("content-item-colors-changed", refresh);
    };
  }, []);

  return (
    <div
      className={`group/col rounded-xl min-h-[120px] p-1.5 flex flex-col gap-1.5 transition-all border ${theme.slotBorder} ${theme.slotBg} ${dragOver ? "ring-2 ring-primary/40 scale-[1.02]" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onDrop(section, colIndex); }}
    >
      {items.map((item) => {
        const itemColor = colors[item.id];
        return (
        <div
          key={item.id}
          draggable
          onDragStart={() => onDragStart(item)}
          onClick={() => { if (editingId !== item.id) onEditStart(item.id, item.title); }}
          style={itemColor ? { borderLeftColor: itemColor, borderLeftWidth: 3 } : undefined}
          className={`group relative rounded-lg px-1.5 pt-2 pb-1.5 text-xs cursor-grab active:cursor-grabbing transition-all border shadow-sm flex-1 overflow-hidden ${
            item.published
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : `bg-white ${theme.cardBorder} ${theme.cardHoverBorder} text-[hsl(var(--dash-text))]`
          }`}
        >
          {itemColor && (
            <span
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: itemColor }}
            />
          )}
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
            <div className="flex flex-col items-stretch gap-1 h-full">
              <span className="text-[10.5px] leading-tight font-semibold text-center w-full break-words px-0.5 flex-1">
                {item.title || "Sin título"}
              </span>
              {showFormat && (
                <div className="flex items-center gap-1">
                  <ObjectiveColorPicker itemId={item.id} />
                  <div className="flex-1 min-w-0">
                    <FormatSelector value={item.format} onChange={(f) => onFormatChange(item.id, f)} formats={formats} />
                  </div>
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onOpenScript(item); }}
                className={`w-full flex items-center justify-center gap-1 rounded-md px-1 py-0.5 text-[9.5px] font-medium transition-all border ${
                  item.description
                    ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
                title="Guion"
              >
                <FileText className="h-2.5 w-2.5" />
                <span>Guion</span>
              </button>
            </div>
          )}
        </div>
        );
      })}
      {items.length === 0 && (
        <button onClick={onAdd} className={`flex-1 flex items-center justify-center rounded-xl transition-all min-h-[80px] ${theme.addBtn}`}>
          <Plus className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

const FormatSelector = ({ value, onChange, formats }: { value: string | null; onChange: (f: string) => void; formats: string[] }) => {
  const colorClass = value && FORMAT_COLORS[value]
    ? FORMAT_COLORS[value]
    : "bg-gray-50 border-gray-200 text-[hsl(var(--dash-text-muted))]";
  return (
    <select
      value={value ?? ""}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => { e.stopPropagation(); onChange(e.target.value); }}
      className={`w-full text-[10px] font-medium rounded-full px-2 py-0.5 border outline-none cursor-pointer transition-colors ${colorClass}`}
    >
      <option value="" disabled>Formato</option>
      {formats.map((f) => <option key={f} value={f}>{f}</option>)}
    </select>
  );
};

const ObjectiveColorPicker = ({ itemId }: { itemId: string }) => {
  const [open, setOpen] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>(() => readObjectives());
  const [color, setColor] = useState<string | null>(() => readItemColors()[itemId] ?? null);

  useEffect(() => {
    const refresh = () => {
      setObjectives(readObjectives());
      setColor(readItemColors()[itemId] ?? null);
    };
    window.addEventListener("storage", refresh);
    window.addEventListener("content-item-colors-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("content-item-colors-changed", refresh);
    };
  }, [itemId]);

  const select = (c: string | null) => {
    setColor(c);
    writeItemColor(itemId, c);
    setOpen(false);
  };

  const current = color ? objectives.find((o) => o.color === color) : null;

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="h-5 w-5 rounded-full shadow-sm hover:scale-110 transition-transform ring-1 ring-inset ring-gray-200"
        style={color ? { backgroundColor: color, boxShadow: `0 0 0 2px #fff, 0 0 0 3px ${color}` } : { backgroundImage: "repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%)", backgroundSize: "8px 8px" }}
        title={current ? `Objetivo: ${current.label}` : "Asignar objetivo"}
      />

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full left-0 mt-1 z-30 p-2 rounded-xl bg-white border border-gray-200 shadow-lg min-w-[140px]"
          >
            <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 px-0.5">Objetivos</div>
            <div className="space-y-1">
              {objectives.map((o) => (
                <button
                  key={o.id}
                  onClick={() => select(o.color)}
                  className="w-full flex items-center gap-1.5 px-1.5 py-1 rounded-md hover:bg-gray-50 text-left"
                >
                  <span className="h-3 w-3 rounded-full flex-shrink-0 border border-white shadow-sm" style={{ backgroundColor: o.color }} />
                  <span className="text-[10px] font-medium text-gray-700 truncate">{o.label}</span>
                </button>
              ))}
              {objectives.length === 0 && (
                <p className="text-[10px] text-gray-400 py-1 px-1">Crea objetivos en el panel</p>
              )}
              {color && (
                <button
                  onClick={() => select(null)}
                  className="w-full flex items-center gap-1.5 px-1.5 py-1 rounded-md hover:bg-gray-50 text-left border-t border-gray-100 mt-1 pt-1.5"
                >
                  <X className="h-3 w-3 text-gray-400" />
                  <span className="text-[10px] font-medium text-gray-500">Quitar</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PlannerGrid;
