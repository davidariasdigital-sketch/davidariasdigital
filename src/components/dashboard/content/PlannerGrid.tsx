import { useState } from "react";
import { Plus, X, Lightbulb, Instagram, Sun, Check, Music2, FileText, MoreHorizontal } from "lucide-react";

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

// Format → soft color chip mapping (visual identity per format)
const FORMAT_COLORS: Record<string, string> = {
  Reel: "bg-pink-50 text-pink-600 border-pink-100",
  Post: "bg-blue-50 text-blue-600 border-blue-100",
  Carrusel: "bg-indigo-50 text-indigo-600 border-indigo-100",
  Historia: "bg-purple-50 text-purple-600 border-purple-100",
  Live: "bg-red-50 text-red-600 border-red-100",
  Colaboración: "bg-teal-50 text-teal-600 border-teal-100",
  Short: "bg-rose-50 text-rose-600 border-rose-100",
  Podcast: "bg-amber-50 text-amber-700 border-amber-100",
  Tutorial: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Behind the Scenes": "bg-slate-50 text-slate-600 border-slate-200",
  Cortometraje: "bg-orange-50 text-orange-600 border-orange-100",
  Videoclip: "bg-yellow-50 text-yellow-700 border-yellow-100",
};
const formatChip = (f: string | null) =>
  f ? FORMAT_COLORS[f] || "bg-gray-50 text-gray-600 border-gray-200" : "bg-transparent text-[hsl(var(--dash-text-muted))] border-dashed border-[hsl(var(--dash-card-border))]";

interface Platform {
  section: Section;
  name: string;
  objective: string;
  icon: React.ReactNode;
  accent: string;        // text color
  dot: string;           // bg color for dot
  border: string;        // left border color of card
  ring: string;          // ring color when drag-over
  formats: string[];
  capacity: number;      // total slots
}

const PLATFORMS: Platform[] = [
  {
    section: "instagram",
    name: "Instagram",
    objective: "Marca personal · portafolio",
    icon: <Instagram className="h-4 w-4" />,
    accent: "text-pink-500",
    dot: "bg-pink-500",
    border: "border-l-pink-400",
    ring: "ring-pink-300/40",
    formats: FORMATS,
    capacity: 4,
  },
  {
    section: "tiktok",
    name: "TikTok",
    objective: "Día a día sin filtros",
    icon: <Music2 className="h-4 w-4" />,
    accent: "text-[hsl(var(--dash-text))]",
    dot: "bg-[hsl(var(--dash-text))]",
    border: "border-l-gray-700",
    ring: "ring-gray-400/30",
    formats: FORMATS,
    capacity: 4,
  },
  {
    section: "solar",
    name: "Solar",
    objective: "Producciones cinematográficas",
    icon: <Sun className="h-4 w-4" />,
    accent: "text-orange-500",
    dot: "bg-orange-500",
    border: "border-l-orange-400",
    ring: "ring-orange-300/40",
    formats: SOLAR_FORMATS,
    capacity: 4,
  },
  {
    section: "ideas",
    name: "Ideas",
    objective: "Banco de ideas futuras",
    icon: <Lightbulb className="h-4 w-4" />,
    accent: "text-amber-500",
    dot: "bg-amber-400",
    border: "border-l-amber-400",
    ring: "ring-amber-300/40",
    formats: FORMATS,
    capacity: 8,
  },
];

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

const PlannerGrid = (props: PlannerGridProps) => {
  const getItemsFor = (section: Section) =>
    props.items
      .filter((i) => i.month === sectionKey(section))
      .sort((a, b) => a.column_index - b.column_index || a.row_index - b.row_index);

  const nextColIndex = (section: Section) => {
    const list = getItemsFor(section);
    return list.length === 0 ? 0 : Math.max(...list.map((i) => i.column_index)) + 1;
  };

  return (
    <div className="-mx-3 sm:mx-0">
      {/* Horizontal board with snap-scroll on mobile */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory sm:snap-none scrollbar-thin px-3 sm:px-0 pb-2">
        {PLATFORMS.map((p) => {
          const list = getItemsFor(p.section);
          const published = list.filter((i) => i.published).length;
          const total = Math.max(list.length, 1);
          const pct = (published / total) * 100;

          return (
            <PlatformColumn
              key={p.section}
              platform={p}
              items={list}
              published={published}
              progressPct={pct}
              {...props}
              onAdd={() => props.onAdd(p.section, nextColIndex(p.section))}
              onDrop={() => props.onDrop(p.section, nextColIndex(p.section))}
            />
          );
        })}
      </div>
    </div>
  );
};

interface ColumnProps extends PlannerGridProps {
  platform: Platform;
  items: ContentItem[];
  published: number;
  progressPct: number;
  onAdd: () => void;
  onDrop: () => void;
}

const PlatformColumn = ({
  platform, items, published, progressPct, onAdd, onDrop,
  editingId, editValue, onDragStart,
  onEditStart, onEditChange, onEditSave, onDelete,
  onFormatChange, onTogglePublished, onOpenScript,
}: ColumnProps) => {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`flex-shrink-0 snap-start w-[85vw] sm:w-72 md:w-80 flex flex-col rounded-2xl bg-[hsl(0,0%,98%)] border border-[hsl(var(--dash-card-border))] transition-all ${
        dragOver ? `ring-2 ${platform.ring}` : ""
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onDrop(); }}
    >
      {/* Column header */}
      <div className="px-4 pt-4 pb-3 border-b border-[hsl(var(--dash-card-border))]">
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-white border border-[hsl(var(--dash-card-border))] ${platform.accent}`}>
            {platform.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[hsl(var(--dash-text))] truncate">{platform.name}</h3>
              <span className="text-[10px] font-medium text-[hsl(var(--dash-text-muted))] tabular-nums">
                {published}/{items.length || platform.capacity}
              </span>
            </div>
            <p className="text-[11px] text-[hsl(var(--dash-text-muted))] truncate">{platform.objective}</p>
          </div>
        </div>
        {/* Mini progress bar */}
        <div className="mt-2.5 h-1 rounded-full bg-[hsl(0,0%,93%)] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${platform.dot}`}
            style={{ width: `${items.length === 0 ? 0 : progressPct}%` }}
          />
        </div>
      </div>

      {/* Cards stack */}
      <div className="p-3 flex flex-col gap-2.5 min-h-[200px]">
        {items.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            platform={platform}
            isEditing={editingId === item.id}
            editValue={editValue}
            onDragStart={onDragStart}
            onEditStart={onEditStart}
            onEditChange={onEditChange}
            onEditSave={onEditSave}
            onDelete={onDelete}
            onFormatChange={onFormatChange}
            onTogglePublished={onTogglePublished}
            onOpenScript={onOpenScript}
          />
        ))}

        {/* Add new card button */}
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-[hsl(var(--dash-card-border))] text-[hsl(var(--dash-text-muted))] hover:border-[hsl(var(--dash-text-muted))] hover:bg-white text-xs font-medium transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          {platform.section === "ideas" ? "Nueva idea" : "Añadir contenido"}
        </button>
      </div>
    </div>
  );
};

interface CardProps {
  item: ContentItem;
  platform: Platform;
  isEditing: boolean;
  editValue: string;
  onDragStart: (item: ContentItem) => void;
  onEditStart: (id: string, title: string) => void;
  onEditChange: (val: string) => void;
  onEditSave: (id: string) => void;
  onDelete: (id: string) => void;
  onFormatChange: (id: string, format: string) => void;
  onTogglePublished: (id: string) => void;
  onOpenScript: (item: ContentItem) => void;
}

const ContentCard = ({
  item, platform, isEditing, editValue,
  onDragStart, onEditStart, onEditChange, onEditSave, onDelete,
  onFormatChange, onTogglePublished, onOpenScript,
}: CardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);

  // Parse script preview from description (could be JSON or plain text)
  const scriptPreview = (() => {
    if (!item.description) return null;
    try {
      const parsed = JSON.parse(item.description);
      const text = parsed.hook || parsed.body || parsed.cta || parsed.notes || "";
      return text ? String(text).slice(0, 30) : null;
    } catch {
      return item.description.slice(0, 30);
    }
  })();

  return (
    <div
      draggable={!isEditing}
      onDragStart={() => onDragStart(item)}
      className={`group relative rounded-xl bg-white border border-[hsl(var(--dash-card-border))] border-l-[3px] ${platform.border} shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
        item.published ? "bg-emerald-50/40" : ""
      }`}
    >
      <div className="p-3 space-y-2">
        {/* Top row: format chip + menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setFormatOpen((v) => !v); }}
              className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${formatChip(item.format)} hover:opacity-80 transition`}
            >
              {item.format || "+ formato"}
            </button>
            {formatOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFormatOpen(false)} />
                <div className="absolute z-20 mt-1 left-0 bg-white border border-[hsl(var(--dash-card-border))] rounded-lg shadow-lg py-1 min-w-[140px] max-h-56 overflow-y-auto">
                  {platform.formats.map((f) => (
                    <button
                      key={f}
                      onClick={(e) => { e.stopPropagation(); onFormatChange(item.id, f); setFormatOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[hsl(0,0%,96%)] ${item.format === f ? "font-semibold text-[hsl(var(--dash-text))]" : "text-[hsl(var(--dash-text-muted))]"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            {item.published && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                <Check className="h-2.5 w-2.5" /> Pub
              </span>
            )}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                className="p-1 rounded hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))]"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute z-20 right-0 mt-1 bg-white border border-[hsl(var(--dash-card-border))] rounded-lg shadow-lg py-1 min-w-[140px]">
                    <button
                      onClick={(e) => { e.stopPropagation(); onTogglePublished(item.id); setMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text))]"
                    >
                      {item.published ? "Marcar borrador" : "Marcar publicado"}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(item.id); setMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600 flex items-center gap-1.5"
                    >
                      <X className="h-3 w-3" /> Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Title — inline editable */}
        {isEditing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={() => onEditSave(item.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEditSave(item.id);
              if (e.key === "Escape") { onEditChange(item.title); onEditSave(item.id); }
            }}
            placeholder="Título del contenido"
            className="w-full bg-transparent outline-none text-sm font-medium text-[hsl(var(--dash-text))] placeholder:text-[hsl(var(--dash-text-muted))] border-b border-primary/30"
          />
        ) : (
          <button
            onClick={() => onEditStart(item.id, item.title)}
            className="block w-full text-left text-sm font-medium leading-snug text-[hsl(var(--dash-text))] hover:text-primary transition-colors"
          >
            {item.title || <span className="text-[hsl(var(--dash-text-muted))] italic font-normal">Sin título</span>}
          </button>
        )}

        {/* Bottom row: script chip */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); onOpenScript(item); }}
            className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md border transition max-w-full ${
              scriptPreview
                ? "bg-blue-50/60 border-blue-100 text-blue-700 hover:bg-blue-50"
                : "border-dashed border-[hsl(var(--dash-card-border))] text-[hsl(var(--dash-text-muted))] hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            <FileText className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              {scriptPreview ? scriptPreview : "Añadir guion"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlannerGrid;
