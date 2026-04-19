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

const PlannerGrid = (props: PlannerGridProps) => {
  const getSlotItems = (section: Section, colIndex: number) =>
    props.items.filter((i) => i.month === sectionKey(section) && i.column_index === colIndex).sort((a, b) => a.row_index - b.row_index);

  const renderSection = (section: Section, count: number, formats: string[], accent: string, keyPrefix: string) => (
    <div className={`grid grid-cols-2 ${count === 8 ? "sm:grid-cols-4" : "sm:grid-cols-4"} gap-2 sm:gap-3`}>
      {Array.from({ length: count }).map((_, colIdx) => (
        <ContentColumn
          key={`${keyPrefix}-${colIdx}`}
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
          accentClass={accent}
          publishedClass="bg-emerald-50 border-emerald-200"
          formats={formats}
          showFormat
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <SectionHeader icon={<Instagram className="h-5 w-5" />} label="Instagram" colorClass="text-pink-500" />
        {renderSection("instagram", 4, FORMATS, "border-pink-200", "ig")}
      </div>
      <div>
        <SectionHeader icon={<Video className="h-5 w-5" />} label="TikTok" colorClass="text-[hsl(var(--dash-text))]" />
        {renderSection("tiktok", 4, FORMATS, "border-gray-200", "tiktok")}
      </div>
      <div>
        <SectionHeader icon={<Lightbulb className="h-5 w-5" />} label="Ideas Futuras" colorClass="text-amber-500" />
        {renderSection("ideas", 8, FORMATS, "border-amber-200", "idea")}
      </div>
      <div>
        <SectionHeader icon={<Sun className="h-5 w-5" />} label="Solar" colorClass="text-orange-500" />
        {renderSection("solar", 4, SOLAR_FORMATS, "border-orange-200", "solar")}
      </div>
    </div>
  );
};

const SectionHeader = ({ icon, label, colorClass }: { icon: React.ReactNode; label: string; colorClass: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className={colorClass}>{icon}</span>
    <h2 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">{label}</h2>
  </div>
);

interface ContentColumnProps {
  section: Section; colIndex: number; items: ContentItem[]; onAdd: () => void;
  onDrop: (section: Section, colIndex: number) => void; onDragStart: (item: ContentItem) => void;
  editingId: string | null; editValue: string; onEditStart: (id: string, title: string) => void;
  onEditChange: (val: string) => void; onEditSave: (id: string) => void; onDelete: (id: string) => void;
  onFormatChange: (id: string, format: string) => void; onTogglePublished: (id: string) => void;
  onOpenScript: (item: ContentItem) => void;
  accentClass: string; publishedClass: string; formats: string[]; showFormat?: boolean;
}

const ContentColumn = ({
  section, colIndex, items, onAdd, onDrop, onDragStart,
  editingId, editValue, onEditStart, onEditChange, onEditSave, onDelete,
  onFormatChange, onTogglePublished, onOpenScript, publishedClass, formats, showFormat,
}: ContentColumnProps) => {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`group/col dash-tile rounded-2xl min-h-[100px] p-3 flex flex-col gap-2.5 transition-all ${dragOver ? "scale-[1.01] ring-1 ring-primary/30" : ""}`}
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
          className={`group relative rounded-xl px-3 py-3 text-xs cursor-grab active:cursor-grabbing transition-all border ${
            item.published
              ? `${publishedClass} text-emerald-800`
              : "bg-[hsl(var(--dash-bg))] border-[hsl(var(--dash-card-border))] text-[hsl(var(--dash-text))] hover:border-primary/20"
          }`}
        >
          {editingId === item.id ? (
            <input
              autoFocus value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              onBlur={() => onEditSave(item.id)}
              onKeyDown={(e) => { if (e.key === "Enter") onEditSave(item.id); if (e.key === "Escape") { onEditChange(item.title); onEditSave(item.id); } }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent outline-none text-xs text-center font-medium"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 relative">
              <div className="absolute -top-1 -right-1 flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onOpenScript(item); }} className="rounded-full p-0.5 hover:bg-blue-50 transition-all text-blue-500" title="Guion"><FileText className="h-2.5 w-2.5" /></button>
                <button onClick={(e) => { e.stopPropagation(); onTogglePublished(item.id); }} className={`rounded-full p-0.5 transition-all ${item.published ? "text-emerald-600 opacity-100" : "hover:bg-[hsl(0,0%,96%)]"}`}><Check className="h-2.5 w-2.5" /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="rounded-full p-0.5 hover:bg-red-50 transition-all"><X className="h-2.5 w-2.5" /></button>
              </div>
              <span className="text-[11px] leading-snug font-medium text-center w-full" onClick={(e) => { e.stopPropagation(); onEditStart(item.id, item.title); }}>{item.title || "Sin título"}</span>
              {item.description && <span className="text-[9px] text-[hsl(var(--dash-text-muted))] truncate max-w-full">📝 Guion</span>}
              {showFormat && <FormatSelector value={item.format} onChange={(f) => onFormatChange(item.id, f)} formats={formats} />}
            </div>
          )}
        </div>
      ))}
      {items.length === 0 && (
        <button onClick={onAdd} className="flex-1 flex items-center justify-center text-[hsl(var(--dash-text-muted))] rounded-xl hover:bg-[hsl(0,0%,96%)] opacity-30 hover:opacity-80 transition-all">
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
    className="text-[10px] opacity-80 hover:opacity-100 transition-opacity rounded-full px-2 py-0.5 bg-[hsl(var(--dash-bg))] border border-[hsl(var(--dash-card-border))] text-[hsl(var(--dash-text))] outline-none"
  >
    <option value="" disabled>Formato</option>
    {formats.map((f) => <option key={f} value={f}>{f}</option>)}
  </select>
);

export default PlannerGrid;
