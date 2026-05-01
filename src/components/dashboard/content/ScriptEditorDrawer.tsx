import { useEffect, useRef, useState } from "react";
import { X, Check, FileText } from "lucide-react";
import { ContentItem } from "./PlannerGrid";

export interface ScriptData {
  hook: string;
  body: string;
  cta: string;
  notes: string;
  duration: string;
}

const EMPTY: ScriptData = { hook: "", body: "", cta: "", notes: "", duration: "" };

export const parseScript = (description: string | null | undefined): ScriptData => {
  if (!description) return { ...EMPTY };
  try {
    const parsed = JSON.parse(description);
    if (parsed && typeof parsed === "object" && ("hook" in parsed || "body" in parsed || "cta" in parsed)) {
      return {
        hook: parsed.hook || "",
        body: parsed.body || "",
        cta: parsed.cta || "",
        notes: parsed.notes || "",
        duration: parsed.duration || "",
      };
    }
  } catch {
    // legacy plain text → goes into "body"
  }
  return { ...EMPTY, body: description };
};

export const serializeScript = (data: ScriptData): string => {
  const isEmpty = !data.hook && !data.body && !data.cta && !data.notes && !data.duration;
  if (isEmpty) return "";
  return JSON.stringify(data);
};

interface Props {
  item: ContentItem | null;
  platformLabel: string;
  platformAccent: string; // tailwind text color class
  onClose: () => void;
  onSave: (data: ScriptData) => Promise<void> | void;
}

const Block = ({
  label, hint, value, onChange, minRows = 3, placeholder,
}: { label: string; hint?: string; value: string; onChange: (v: string) => void; minRows?: number; placeholder?: string }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);
  return (
    <div className="rounded-xl border border-[hsl(var(--dash-card-border))] bg-white overflow-hidden">
      <div className="px-3 pt-2.5 pb-1 flex items-baseline justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">{label}</span>
        {hint && <span className="text-[10px] text-[hsl(var(--dash-text-muted))]">{hint}</span>}
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={minRows}
        className="w-full px-3 pb-3 pt-1 bg-transparent outline-none text-sm leading-relaxed text-[hsl(var(--dash-text))] placeholder:text-[hsl(var(--dash-text-muted))] resize-none"
      />
    </div>
  );
};

const ScriptEditorDrawer = ({ item, platformLabel, platformAccent, onClose, onSave }: Props) => {
  const [data, setData] = useState<ScriptData>(EMPTY);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (item) {
      setData(parseScript(item.description));
      setDirty(false);
      setSavedAt(null);
    }
  }, [item?.id]);

  // Auto-save with debounce
  useEffect(() => {
    if (!item || !dirty) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      await onSave(data);
      setSavedAt(Date.now());
      setDirty(false);
    }, 800);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [data, dirty, item?.id]);

  const update = (patch: Partial<ScriptData>) => {
    setData((d) => ({ ...d, ...patch }));
    setDirty(true);
  };

  const handleClose = async () => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (dirty) await onSave(data);
    onClose();
  };

  // Lock body scroll
  useEffect(() => {
    if (!item) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [item?.id]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="relative h-full w-full sm:max-w-[520px] bg-[hsl(0,0%,98%)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--dash-card-border))] bg-white">
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]"
          >
            <X className="h-4 w-4" /> Cerrar
          </button>
          <div className="text-[11px] text-[hsl(var(--dash-text-muted))] flex items-center gap-1">
            {dirty ? (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Guardando…
              </span>
            ) : savedAt ? (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <Check className="h-3 w-3" /> Guardado
              </span>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* Context chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${platformAccent}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {platformLabel}
            </span>
            {item.format && (
              <span className="text-[11px] font-medium text-[hsl(var(--dash-text-muted))] uppercase tracking-wide">
                · {item.format}
              </span>
            )}
          </div>

          {/* Title display */}
          <div>
            <div className="flex items-center gap-2 text-[hsl(var(--dash-text-muted))] mb-1">
              <FileText className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Guion</span>
            </div>
            <h2 className="text-xl font-semibold text-[hsl(var(--dash-text))] leading-tight">
              {item.title || <span className="italic text-[hsl(var(--dash-text-muted))] font-normal">Sin título</span>}
            </h2>
          </div>

          <Block
            label="Hook"
            hint="0–3 segundos"
            value={data.hook}
            onChange={(v) => update({ hook: v })}
            placeholder="¿Qué dices o pasa en los primeros 3 segundos para enganchar?"
            minRows={2}
          />
          <Block
            label="Desarrollo"
            value={data.body}
            onChange={(v) => update({ body: v })}
            placeholder="Cuerpo del video. Puntos clave, narrativa, escenas…"
            minRows={6}
          />
          <Block
            label="CTA / Cierre"
            value={data.cta}
            onChange={(v) => update({ cta: v })}
            placeholder="Llamado a la acción o cierre memorable."
            minRows={2}
          />
          <Block
            label="Notas de grabación"
            value={data.notes}
            onChange={(v) => update({ notes: v })}
            placeholder="Cámara, locación, props, transiciones, música…"
            minRows={3}
          />

          <div className="rounded-xl border border-[hsl(var(--dash-card-border))] bg-white px-3 py-2.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">
              Duración estimada
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                value={data.duration}
                onChange={(e) => update({ duration: e.target.value })}
                placeholder="30"
                className="w-16 text-right bg-transparent outline-none text-sm font-medium text-[hsl(var(--dash-text))] placeholder:text-[hsl(var(--dash-text-muted))] tabular-nums"
              />
              <span className="text-xs text-[hsl(var(--dash-text-muted))]">seg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptEditorDrawer;
