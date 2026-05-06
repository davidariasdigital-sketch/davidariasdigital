import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, FileText, ChevronDown, ChevronUp, Calculator, Copy, Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface CostModule {
  id: string;
  user_id: string;
  module_key: string;
  title: string;
  subtitle: string | null;
  columns: string[];
  rows: string[][];
  notes: string | null;
  sort_order: number;
  created_at: string;
}

const DEFAULT_MODULES: Omit<CostModule, "id" | "user_id" | "created_at">[] = [
  {
    module_key: "nomina",
    title: "Escenario de Nómina (Contrato Laboral)",
    subtitle: "Costo mensual total que la empresa debe presupuestar para contratarte, sin incluir el uso de tus herramientas personales.",
    sort_order: 0,
    notes: "Base de Tiempo: Mes de 22 días laborales (Hábiles).",
    columns: ["Concepto Mensual", "Servicio Completo (R-III)", "Servicio Básico (R-III)", "Solo Edición (R-I)"],
    rows: [
      ["Salario Base (Bruto)", "4000000", "4000000", "4000000"],
      ["Transporte/Movilidad", "180000", "180000", "180000"],
      ["Salud (Patronal 8.5%)", "340000", "340000", "340000"],
      ["Pensión (Patronal 12%)", "480000", "480000", "480000"],
      ["ARL (Según Riesgo)", "97440", "97440", "20880"],
      ["Prima (8.33%)", "333200", "333200", "333200"],
      ["Cesantías (8.33%)", "333200", "333200", "333200"],
      ["Intereses Cesantías (1%)", "40000", "40000", "40000"],
      ["Vacaciones (4.17%)", "166800", "166800", "166800"],
    ],
  },
  {
    module_key: "freelance",
    title: "Prestación de Servicios (Freelance)",
    subtitle: "Valor mínimo a facturar para cubrir tu talento, gastos operativos y seguridad social (sin incluir equipos).",
    sort_order: 1,
    notes: "Para cálculo de proyectos: Tu tarifa base de talento equivale a aprox. $264.668 COP / día.",
    columns: ["Concepto Mensual", "Servicio Completo (R-III)", "Servicio Básico (R-III)", "Solo Edición (R-I)"],
    rows: [
      ["Utilidad (Tu sueldo)", "4000000", "4000000", "4000000"],
      ["Operación (Luz/Net)", "290000", "290000", "290000"],
      ["Movilidad y Transportes", "180000", "180000", "180000"],
      ["Seguridad Social (SMLV)", "441750", "441750", "441750"],
      ["ARL (Independiente)", "37758", "37758", "8091"],
      ["Prima de Servicios (8.33%)", "333200", "333200", "333200"],
      ["Cesantías (8.33%)", "333200", "333200", "333200"],
      ["Intereses Cesantías (1%)", "40000", "40000", "40000"],
      ["Vacaciones (4.17%)", "166800", "166800", "166800"],
    ],
  },
  {
    module_key: "equipos",
    title: "Tarifario de Alquiler de Equipos (Por Día)",
    subtitle: "Basado en depreciación a 3 años (36 meses) sobre 22 días hábiles/mes.",
    sort_order: 2,
    notes: "Estos valores son preferenciales por volumen (basados en depreciación pura). Para alquileres externos, se recomienda un margen comercial superior (ej. $400.000/día para kit completo).",
    columns: ["Escenario de Equipo", "Valor del Activo", "Depreciación Mensual", "Alquiler por Día"],
    rows: [
      ["Servicio Completo", "31000000", "861111", "39141"],
      ["Servicio Básico", "20000000", "555556", "25253"],
      ["Solo Edición", "4000000", "111111", "5051"],
    ],
  },
  {
    module_key: "equipos_av",
    title: "Inventario de Equipos Audiovisuales",
    subtitle: "Listado completo de equipos con su valor de adquisición. Total calculado automáticamente.",
    sort_order: 3,
    notes: "Mantén actualizado el inventario para calcular correctamente la depreciación y tarifas de alquiler.",
    columns: ["Item", "Valor", "Alquiler/Día"],
    rows: [
      ["Kit camera", "10000000", ""],
      ["Lente sigma 28-70", "3000000", ""],
      ["Iphone 15 pro", "4300000", ""],
      ["Kit Ronin Rs3 mini", "1500000", ""],
      ["Tripod camera", "500000", ""],
      ["Amaran 300C", "3000000", ""],
      ["Amaran 60D", "500000", ""],
      ["Flex", "80000", ""],
      ["Octabox armado manual", "200000", ""],
      ["Softbox armado rapido", "200000", ""],
      ["C-Stand", "700000", ""],
      ["Tripode plateado", "300000", ""],
      ["PC", "6770000", ""],
      ["HDD disk portatil", "200000", ""],
      ["Maquina de humo", "220000", ""],
      ["Viltrox 20mm lens", "680000", ""],
      ["Adapter ND anillos", "150000", ""],
      ["Magic arm", "150000", ""],
      ["Bag pack camera", "300000", ""],
      ["Monitor Feelworld f7 plus", "800000", ""],
      ["Transmisores TP MAX", "550000", ""],
      ["Equipment car", "800000", ""],
      ["Camera cage", "780000", ""],
      ["Paneles acustico", "800000", ""],
      ["Escritorio", "500000", ""],
      ["Wacom tableta", "300000", ""],
      ["Dji mic mini", "400000", ""],
      ["SSD 2 TB", "950000", ""],
      ["Macbook air M4 512 gbs", "5000000", ""],
      ["Davinci resolve", "1200000", ""],
    ],
  },
  {
    module_key: "proyectos",
    title: "Proyectos y Servicios Específicos (Llave en Mano)",
    subtitle: "Fórmula: (Días Talento × $265.000) + (Días Uso Equipo Comercial) + Viáticos + Externos + Margen (%) = PRECIO CLIENTE",
    sort_order: 4,
    notes: "Los valores de referencia son aproximados basándose en tu tarifa diaria freelance de $265.000 COP + costos comerciales de alquiler de equipo + margen.\n\nGestión de Riesgos ARL: Riesgo III para campo, Riesgo I para edición en casa/estudio.\nNunca saltarse el margen de ganancia: cubre imprevistos y tiempo de ventas.",
    columns: ["Tipo de Servicio", "Despliegue de Costos", "Margen Sugerido", "Valor Referencia"],
    rows: [
      ["Producción Sesión de Contenido", "1d Pre + 1d Rodaje + 2d Edición + Viáticos", "20% - 30%", "$1.600.000 - $1.900.000"],
      ["Cobertura de Boda (Foto o Video)", "0.5d Reuniones + 1.5d Cobertura + 2da Cám + 4-5d Edición + Equipo Full", "30% - 40%", "$3.200.000 - $4.500.000"],
      ["Sesión de Fotos (Retrato/Producto)", "0.5d Concepto + 1d Rodaje + 1d Retoque (15-20 fotos)", "20% - 25%", "$850.000 - $1.100.000"],
      ["Solo Edición (Reels / Video YT)", "0.5d Ingesta + 1-2d Edición + Música/Librerías + Depreciación", "15% - 20%", "$450.000 - $650.000"],
      ["Colorización (Color Grading)", "0.5d Conformado + 1-2d Etalonaje + Render + Monitor Calibrado", "25% - 35%", "$1.000.000 - $1.400.000"],
    ],
  },
];

const TAB_LABELS: Record<string, string> = {
  nomina: "Nómina",
  freelance: "Freelance",
  equipos: "Equipos",
  equipos_av: "Equipos AV",
  proyectos: "Proyectos",
};

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

const isNumeric = (s: string) => /^[\d.]+$/.test(s.replace(/[,$\s]/g, ""));
const parseNum = (s: string) => parseFloat(s.replace(/[,$\s]/g, "")) || 0;

// Percentage formulas keyed by row label pattern
const NOMINA_PERCENTAGES: Record<string, number> = {
  "salud": 0.085,
  "pensión": 0.12,
  "prima": 0.0833,
  "cesantías": 0.0833,
  "intereses": 0.01,
  "vacaciones": 0.0417,
};

const ARL_RATES: Record<string, number> = {
  "R-III": 0.02436,
  "R-I": 0.00522,
};

const findRowByLabel = (rows: string[][], pattern: string): number =>
  rows.findIndex((r) => r[0]?.toLowerCase().includes(pattern.toLowerCase()));

const recalculateModule = (mod: CostModule): string[][] => {
  const rows = mod.rows.map((r) => [...r]);

  if (mod.module_key === "nomina" || mod.module_key === "freelance") {
    const baseLabel = mod.module_key === "nomina" ? "salario base" : "utilidad";
    const baseIdx = findRowByLabel(rows, baseLabel);
    if (baseIdx === -1) return rows;

    for (let ci = 1; ci < mod.columns.length; ci++) {
      const base = parseNum(rows[baseIdx][ci]);
      if (!base) continue;

      const colHeader = (mod.columns[ci] || "").toString();

      for (const [pattern, pct] of Object.entries(NOMINA_PERCENTAGES)) {
        const ri = findRowByLabel(rows, pattern);
        if (ri !== -1 && ri !== baseIdx) {
          rows[ri][ci] = Math.round(base * pct).toString();
        }
      }

      // ARL depends on column header (R-III or R-I)
      const arlIdx = findRowByLabel(rows, "arl");
      if (arlIdx !== -1) {
        const riskKey = colHeader.includes("R-I") && !colHeader.includes("R-II") && !colHeader.includes("R-III")
          ? "R-I" : "R-III";
        rows[arlIdx][ci] = Math.round(base * ARL_RATES[riskKey]).toString();
      }
    }
  }

  if (mod.module_key === "equipos") {
    for (let ri = 0; ri < rows.length; ri++) {
      const valorActivo = parseNum(rows[ri][1]);
      if (valorActivo > 0) {
        const depMensual = Math.round(valorActivo / 36);
        const alqDia = Math.round(depMensual / 22);
        rows[ri][2] = depMensual.toString();
        rows[ri][3] = alqDia.toString();
      }
    }
  }

  if (mod.module_key === "equipos_av") {
    for (let ri = 0; ri < rows.length; ri++) {
      const valor = parseNum(rows[ri][1]);
      const current = (rows[ri][2] || "").trim();
      // Solo autocalcular si el usuario no ha definido un valor manual
      if (valor > 0 && current === "") {
        const alqDia = Math.round(valor / 12 / 22);
        rows[ri][2] = alqDia.toString();
      }
    }
  }

  return rows;
};

// ============================================================
// Rental Calculator: pick equipment & sum rental costs
// ============================================================
const RENTAL_STORAGE_KEY = "equipos_av_rental_calc_v1";

interface RentalState {
  selected: string[];
  days: number;
  margin: number;
  open: boolean;
}

const RentalCalculator = ({ rows }: { rows: string[][] }) => {
  const [state, setState] = useState<RentalState>(() => {
    try {
      const raw = localStorage.getItem(RENTAL_STORAGE_KEY);
      if (raw) return { open: false, ...JSON.parse(raw) };
    } catch {}
    return { selected: [], days: 1, margin: 0, open: false };
  });
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const { open, ...persist } = state;
    try { localStorage.setItem(RENTAL_STORAGE_KEY, JSON.stringify(persist)); } catch {}
  }, [state]);

  const items = useMemo(() =>
    rows
      .map((r, i) => ({ idx: i, name: r[0] || "", rental: parseNum(r[2] || "0") }))
      .filter((it) => it.name && it.rental > 0),
    [rows]
  );

  const filtered = useMemo(() =>
    items.filter((it) => it.name.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  const selectedItems = items.filter((it) => state.selected.includes(it.name));
  const subtotal = selectedItems.reduce((s, it) => s + it.rental, 0) * state.days;
  const total = subtotal * (1 + state.margin / 100);

  const toggle = (name: string) => {
    setState((s) => ({
      ...s,
      selected: s.selected.includes(name)
        ? s.selected.filter((n) => n !== name)
        : [...s.selected, name],
    }));
  };

  const selectAll = () => setState((s) => ({ ...s, selected: filtered.map((it) => it.name) }));
  const clearAll = () => setState((s) => ({ ...s, selected: [] }));

  const copySummary = async () => {
    const lines = [
      `Alquiler de Equipos — ${state.days} día${state.days !== 1 ? "s" : ""}`,
      "",
      ...selectedItems.map((it) => `• ${it.name}: ${formatCOP(it.rental)}/día`),
      "",
      `Subtotal: ${formatCOP(subtotal)}`,
      state.margin > 0 ? `Margen ${state.margin}%: ${formatCOP(total - subtotal)}` : "",
      `TOTAL: ${formatCOP(total)}`,
    ].filter(Boolean).join("\n");
    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="dash-tile p-0 overflow-hidden">
      <button
        onClick={() => setState((s) => ({ ...s, open: !s.open }))}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[hsl(var(--dash-bg))] transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Calculator size={15} className="text-[hsl(var(--primary))]" />
          <span className="text-sm font-bold text-[hsl(var(--dash-text))]">Calcular alquiler para servicio</span>
          {state.selected.length > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
              {state.selected.length} sel · {formatCOP(total)}
            </span>
          )}
        </div>
        {state.open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {state.open && (
        <div className="border-t border-[hsl(var(--dash-card-border))] p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Días</label>
              <input
                type="number" min={1}
                value={state.days}
                onChange={(e) => setState((s) => ({ ...s, days: Math.max(1, parseInt(e.target.value) || 1) }))}
                className="mt-1 w-full bg-[hsl(var(--dash-bg))] border border-[hsl(var(--dash-card-border))] rounded-lg px-3 py-2 text-sm text-[hsl(var(--dash-text))] outline-none focus:border-[hsl(var(--primary))]"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Margen %</label>
              <input
                type="number" min={0}
                value={state.margin}
                onChange={(e) => setState((s) => ({ ...s, margin: Math.max(0, parseFloat(e.target.value) || 0) }))}
                className="mt-1 w-full bg-[hsl(var(--dash-bg))] border border-[hsl(var(--dash-card-border))] rounded-lg px-3 py-2 text-sm text-[hsl(var(--dash-text))] outline-none focus:border-[hsl(var(--primary))]"
                placeholder="0"
              />
              <p className="text-[10px] text-[hsl(var(--dash-text-muted))] mt-1">Sugerido externos: 30–60%</p>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Buscar equipo</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-1 w-full bg-[hsl(var(--dash-bg))] border border-[hsl(var(--dash-card-border))] rounded-lg px-3 py-2 text-sm text-[hsl(var(--dash-text))] outline-none focus:border-[hsl(var(--primary))]"
                placeholder="Filtrar..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button onClick={selectAll} className="font-semibold text-[hsl(var(--primary))] hover:opacity-80">
              Seleccionar visibles
            </button>
            <span className="text-[hsl(var(--dash-text-muted))]">·</span>
            <button onClick={clearAll} className="font-semibold text-[hsl(var(--dash-text-muted))] hover:text-red-500">
              Limpiar
            </button>
            <span className="ml-auto text-[hsl(var(--dash-text-muted))]">{filtered.length} de {items.length} equipos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-80 overflow-y-auto">
            {filtered.map((it) => {
              const checked = state.selected.includes(it.name);
              return (
                <label
                  key={it.idx}
                  className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer border transition-colors ${
                    checked
                      ? "bg-[hsl(var(--primary))]/5 border-[hsl(var(--primary))]/40"
                      : "bg-[hsl(var(--dash-bg))] border-[hsl(var(--dash-card-border))] hover:border-[hsl(var(--primary))]/30"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(it.name)}
                      className="accent-[hsl(var(--primary))] shrink-0"
                    />
                    <span className="text-xs font-medium text-[hsl(var(--dash-text))] truncate">{it.name}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[hsl(var(--dash-text-muted))] shrink-0">
                    {formatCOP(it.rental)}/d
                  </span>
                </label>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-full text-center text-xs text-[hsl(var(--dash-text-muted))] py-6">
                No hay equipos que coincidan
              </p>
            )}
          </div>

          <div className="bg-[hsl(var(--dash-bg))] rounded-xl p-4 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[hsl(var(--dash-text-muted))]">{selectedItems.length} equipos × {state.days} día{state.days !== 1 ? "s" : ""}</span>
              <span className="font-semibold text-[hsl(var(--dash-text))]">{formatCOP(subtotal)}</span>
            </div>
            {state.margin > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-[hsl(var(--dash-text-muted))]">Margen {state.margin}%</span>
                <span className="font-semibold text-[hsl(var(--dash-text))]">+ {formatCOP(total - subtotal)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-[hsl(var(--dash-card-border))]">
              <span className="text-sm font-bold text-[hsl(var(--dash-text))]">TOTAL ALQUILER</span>
              <span className="text-lg font-extrabold text-[hsl(var(--primary))]">{formatCOP(total)}</span>
            </div>
          </div>

          <button
            onClick={copySummary}
            disabled={selectedItems.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--dash-text))] text-[hsl(var(--dash-card-bg))] rounded-lg py-2.5 text-xs font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar resumen</>}
          </button>
        </div>
      )}
    </div>
  );
};

const ServiceCostsView = () => {
  const [modules, setModules] = useState<CostModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCell, setEditCell] = useState<{ modKey: string; row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchModules = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("cost_modules")
      .select("*")
      .eq("user_id", session.user.id)
      .order("sort_order");

    if (data && data.length > 0) {
      const parsed = data.map((d: any) => ({
        ...d,
        columns: d.columns as string[],
        rows: d.rows as string[][],
      }));

      // Insert any missing default modules
      const existingKeys = new Set(parsed.map((m: CostModule) => m.module_key));
      const missing = DEFAULT_MODULES.filter((m) => !existingKeys.has(m.module_key));
      if (missing.length > 0) {
        const inserts = missing.map((m) => ({
          user_id: session.user.id,
          ...m,
          columns: JSON.parse(JSON.stringify(m.columns)),
          rows: JSON.parse(JSON.stringify(m.rows)),
        }));
        await supabase.from("cost_modules").insert(inserts);
        fetchModules();
        return;
      }

      // Upgrade existing modules with new columns (e.g. equipos_av gained Alquiler/Día)
      const upgrades: CostModule[] = [];
      for (const mod of parsed) {
        const def = DEFAULT_MODULES.find((d) => d.module_key === mod.module_key);
        if (def && def.columns.length > mod.columns.length) {
          mod.columns = [...def.columns];
          mod.rows = mod.rows.map((row) => {
            while (row.length < def.columns.length) row.push("");
            return row;
          });
          mod.rows = recalculateModule(mod);
          upgrades.push(mod);
        }
      }
      if (upgrades.length > 0) {
        for (const u of upgrades) {
          await supabase.from("cost_modules").update({ columns: u.columns as any, rows: u.rows as any }).eq("id", u.id);
        }
      }

      setModules(parsed);
      const notes: Record<string, string> = {};
      parsed.forEach((m: CostModule) => { notes[m.module_key] = m.notes || ""; });
      setEditNotes(notes);
    } else {
      // Initialize with defaults
      const inserts = DEFAULT_MODULES.map((m) => ({
        user_id: session.user.id,
        ...m,
        columns: JSON.parse(JSON.stringify(m.columns)),
        rows: JSON.parse(JSON.stringify(m.rows)),
      }));
      await supabase.from("cost_modules").insert(inserts);
      fetchModules();
      return;
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchModules(); }, [fetchModules]);

  const saveModule = async (mod: CostModule) => {
    await supabase
      .from("cost_modules")
      .update({ columns: mod.columns as any, rows: mod.rows as any, notes: mod.notes })
      .eq("id", mod.id);
  };

  const handleCellClick = (modKey: string, row: number, col: number, value: string) => {
    setEditCell({ modKey, row, col });
    setEditValue(value);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCellBlur = async () => {
    if (!editCell) return;
    const mod = modules.find((m) => m.module_key === editCell.modKey);
    if (!mod) return;

    const newRows = [...mod.rows.map((r) => [...r])];
    newRows[editCell.row][editCell.col] = editValue;

    const withRecalc = recalculateModule({ ...mod, rows: newRows });
    const updated = { ...mod, rows: withRecalc };
    setModules((prev) => prev.map((m) => (m.id === mod.id ? updated : m)));
    setEditCell(null);
    await saveModule(updated);
  };

  const handleAddRow = async (modKey: string) => {
    const mod = modules.find((m) => m.module_key === modKey);
    if (!mod) return;

    const emptyRow = mod.columns.map(() => "");
    const updated = { ...mod, rows: [...mod.rows, emptyRow] };
    setModules((prev) => prev.map((m) => (m.id === mod.id ? updated : m)));
    await saveModule(updated);
  };

  const handleDeleteRow = async (modKey: string, rowIdx: number) => {
    const mod = modules.find((m) => m.module_key === modKey);
    if (!mod) return;

    const updated = { ...mod, rows: mod.rows.filter((_, i) => i !== rowIdx) };
    setModules((prev) => prev.map((m) => (m.id === mod.id ? updated : m)));
    await saveModule(updated);
  };

  const handleNotesBlur = async (modKey: string) => {
    const mod = modules.find((m) => m.module_key === modKey);
    if (!mod) return;

    const updated = { ...mod, notes: editNotes[modKey] || null };
    setModules((prev) => prev.map((m) => (m.id === mod.id ? updated : m)));
    await saveModule(updated);
  };

  const computeTotal = (mod: CostModule) => {
    if (mod.module_key !== "nomina" && mod.module_key !== "freelance" && mod.module_key !== "equipos_av") return null;
    const totals = mod.columns.slice(1).map((_, colIdx) =>
      mod.rows.reduce((sum, row) => sum + parseNum(row[colIdx + 1]), 0)
    );
    return totals;
  };

  const renderTable = (mod: CostModule) => {
    const totals = computeTotal(mod);
    const isProjectsModule = mod.module_key === "proyectos";

    return (
      <div className="space-y-4">
        {mod.subtitle && (
          <p className="text-xs text-[hsl(var(--dash-text-muted))] italic">{mod.subtitle}</p>
        )}

        {/* Desktop table */}
        <div className="hidden sm:block dash-tile overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--dash-card-border))]">
                  {mod.columns.map((col, i) => (
                    <th key={i} className={`py-3 px-4 text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider ${i === 0 ? "text-left" : "text-right"}`}>
                      {col}
                    </th>
                  ))}
                  <th className="py-3 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {mod.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-[hsl(var(--dash-card-border))] last:border-0 hover:bg-[hsl(var(--dash-bg))] transition-colors">
                    {row.map((cell, ci) => (
                      <td key={ci}
                        className={`py-2.5 px-4 ${ci === 0 ? "text-left font-medium text-[hsl(var(--dash-text))]" : "text-right"} cursor-pointer`}
                        onClick={() => handleCellClick(mod.module_key, ri, ci, cell)}
                      >
                        {editCell?.modKey === mod.module_key && editCell.row === ri && editCell.col === ci ? (
                          <input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={(e) => { if (e.key === "Enter") handleCellBlur(); if (e.key === "Escape") setEditCell(null); }}
                            className={`w-full bg-transparent border-b-2 border-[hsl(var(--primary))] outline-none text-sm py-0.5 text-[hsl(var(--dash-text))] ${ci === 0 ? "text-left" : "text-right"}`}
                          />
                        ) : (
                          <span className={ci > 0 && !isProjectsModule && isNumeric(cell) ? "font-semibold text-[hsl(var(--dash-text))]" : "text-[hsl(var(--dash-text-muted))]"}>
                            {ci > 0 && !isProjectsModule && isNumeric(cell) ? formatCOP(parseNum(cell)) : cell || "—"}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="py-2.5 px-2">
                      <button onClick={() => handleDeleteRow(mod.module_key, ri)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[hsl(var(--dash-text-muted))] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        style={{ opacity: 1 }}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                {totals && (
                  <tr className="bg-[hsl(var(--dash-bg))] font-bold">
                    <td className="py-3 px-4 text-[hsl(var(--dash-text))]">
                      {mod.module_key === "nomina" ? "TOTAL INVERSIÓN EMPRESA" : mod.module_key === "equipos_av" ? "TOTAL INVENTARIO" : "TOTAL MÍNIMO FACTURAR"}
                    </td>
                    {totals.map((t, i) => (
                      <td key={i} className="py-3 px-4 text-right text-[hsl(var(--primary))]">{formatCOP(t)}</td>
                    ))}
                    <td className="py-3 px-2"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-2">
          {mod.rows.map((row, ri) => (
            <div key={ri} className="dash-tile p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[hsl(var(--dash-text))]">{row[0] || "—"}</p>
                  {row.slice(1).map((cell, ci) => (
                    <div key={ci} className="flex justify-between mt-1.5">
                      <span className="text-[10px] text-[hsl(var(--dash-text-muted))] uppercase">{mod.columns[ci + 1]}</span>
                      <span className="text-xs font-semibold text-[hsl(var(--dash-text))]"
                        onClick={() => handleCellClick(mod.module_key, ri, ci + 1, cell)}>
                        {!isProjectsModule && isNumeric(cell) ? formatCOP(parseNum(cell)) : cell || "—"}
                      </span>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleDeleteRow(mod.module_key, ri)}
                  className="p-2 rounded-lg text-[hsl(var(--dash-text-muted))] hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {totals && (
            <div className="dash-tile p-4 bg-[hsl(var(--dash-bg))]">
              <p className="font-bold text-sm text-[hsl(var(--dash-text))] mb-2">
                {mod.module_key === "nomina" ? "TOTAL INVERSIÓN EMPRESA" : mod.module_key === "equipos_av" ? "TOTAL INVENTARIO" : "TOTAL MÍNIMO FACTURAR"}
              </p>
              {totals.map((t, i) => (
                <div key={i} className="flex justify-between mt-1">
                  <span className="text-[10px] text-[hsl(var(--dash-text-muted))] uppercase">{mod.columns[i + 1]}</span>
                  <span className="text-sm font-bold text-[hsl(var(--primary))]">{formatCOP(t)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add row + Notes */}
        <div className="flex items-center gap-3">
          <button onClick={() => handleAddRow(mod.module_key)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--primary))] hover:opacity-80 transition-opacity">
            <Plus size={14} /> Agregar fila
          </button>
          <button onClick={() => setExpandedNotes((p) => ({ ...p, [mod.module_key]: !p[mod.module_key] }))}
            className="flex items-center gap-1.5 text-xs text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors">
            <FileText size={13} /> Notas
            {expandedNotes[mod.module_key] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        {expandedNotes[mod.module_key] && (
          <textarea
            value={editNotes[mod.module_key] || ""}
            onChange={(e) => setEditNotes((p) => ({ ...p, [mod.module_key]: e.target.value }))}
            onBlur={() => handleNotesBlur(mod.module_key)}
            className="w-full bg-[hsl(var(--dash-bg))] border border-[hsl(var(--dash-card-border))] rounded-xl px-4 py-3 text-xs text-[hsl(var(--dash-text-muted))] min-h-[80px] resize-y outline-none focus:border-[hsl(var(--primary))] transition-colors"
            placeholder="Notas aclaratorias..."
          />
        )}

        {mod.module_key === "equipos_av" && <RentalCalculator rows={mod.rows} />}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-extrabold text-[hsl(var(--dash-text))]">
          Estructura de Costos Profesionales
        </h1>
        <p className="text-xs sm:text-sm text-[hsl(var(--dash-text-muted))]">
          Creativo Audiovisual — 2026
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="nomina" className="w-full">
        <TabsList className="w-full justify-start bg-[hsl(var(--dash-bg))] border border-[hsl(var(--dash-card-border))] rounded-xl p-1 gap-1 flex-wrap h-auto">
          {modules.map((m) => (
            <TabsTrigger key={m.module_key} value={m.module_key}
              className="text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-[hsl(var(--dash-card-bg))] data-[state=active]:text-[hsl(var(--dash-text))] data-[state=active]:shadow-sm text-[hsl(var(--dash-text-muted))] px-3 py-2">
              {TAB_LABELS[m.module_key] || m.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {modules.map((m) => (
          <TabsContent key={m.module_key} value={m.module_key} className="mt-4">
            <h2 className="text-sm sm:text-base font-bold text-[hsl(var(--dash-text))] mb-3">
              {m.title}
            </h2>
            {renderTable(m)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ServiceCostsView;
