import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Trash2, Edit2, FileDown, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { toast } from "sonner";
import { generateQuotationPDF } from "@/lib/quotation-pdf";
import { generateCombinedQuotationInvoicePDF } from "@/lib/combined-pdf";
import QuotationAIAssistant from "./QuotationAIAssistant";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface QuotationItem { description: string; amount: number; entregables?: string[]; }

interface Quotation {
  id: string; title: string; description: string | null; items: QuotationItem[];
  total: number; status: string; client_id: string | null; client_name: string | null; created_at: string;
  clients?: { name: string } | null; conditions?: string[]; costos?: string[];
  requisitos?: string[];
}

const DEFAULT_CONDITIONS = [
  "Para agendar el servicio debe pagarse el 50% del valor total una semana antes de la fecha de grabación. El 50% restante se cancela cuando el contenido total sea entregado.",
  "La entrega del contenido total editado se coordina directamente con el cliente.",
  "Si se exceden las horas de grabación durante la jornada, se hará un cobro adicional de $80.000 COP por cada hora que transcurra.",
  "Modelos, utilería o algún elemento a solicitud del cliente tiene un costo adicional según el requerimiento.",
  "Todos los precios están expresados en pesos colombianos (COP) e incluyen retención en la fuente.",
  "Esta cotización tiene una validez de 30 días a partir de la fecha de emisión.",
];

const COSTOS_OPTIONS = [
  "Mano de obra",
  "Equipo técnico",
  "Viáticos",
  "Alquiler de equipos",
  "Seguro de riesgo",
];



const statusColors: Record<string, string> = {
  borrador: "bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] border-[hsl(var(--dash-card-border))]",
  enviada: "bg-amber-50 text-amber-700 border-amber-200",
  aceptada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rechazada: "bg-red-50 text-red-700 border-red-200",
};

interface QuotationsViewProps {
  embedded?: boolean;
  triggerNew?: number;
  onMutate?: () => void;
}

const QuotationsView = ({ embedded = false, triggerNew = 0, onMutate }: QuotationsViewProps = {}) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [form, setForm] = useState({ title: "", description: "", client_name: "", status: "borrador" as string, delivery_date: "" });
  const [items, setItems] = useState<QuotationItem[]>([{ description: "", amount: 0, entregables: [] }]);
  const [selectedConditions, setSelectedConditions] = useState<boolean[]>(DEFAULT_CONDITIONS.map(() => true));
  const [selectedCostos, setSelectedCostos] = useState<boolean[]>(COSTOS_OPTIONS.map(() => false));
  const [requisitos, setRequisitos] = useState<string[]>([]);
  const [newRequisito, setNewRequisito] = useState("");
  const [entregableInputs, setEntregableInputs] = useState<string[]>([""]);
  const [showConditions, setShowConditions] = useState(false);
  const [showCostos, setShowCostos] = useState(false);
  const isMobile = useIsMobile();

  const fetchData = async () => {
    const q = await supabase.from("quotations").select("*, clients(name)").order("created_at", { ascending: false });
    if (q.data) setQuotations(q.data as unknown as Quotation[]);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (triggerNew > 0) { resetForm(); setShowForm(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerNew]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Debes iniciar sesión"); return; }
      const total = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
      const conditions = DEFAULT_CONDITIONS.filter((_, i) => selectedConditions[i]);
      const costos = COSTOS_OPTIONS.filter((_, i) => selectedCostos[i]);
      const payload = {
        title: form.title, description: form.description || null, client_id: null, client_name: form.client_name.trim() || null,
        status: form.status as any, items: items as any, total, conditions: conditions as any,
        costos: costos as any, requisitos: requisitos as any, delivery_date: form.delivery_date || null, user_id: user.id,
      };
      if (editing) {
        const { user_id, ...updatePayload } = payload;
        const { error } = await supabase.from("quotations").update(updatePayload as any).eq("id", editing.id);
        if (error) { toast.error("Error al guardar: " + error.message); return; }
        toast.success("Cotización actualizada");
      } else {
        const { error } = await supabase.from("quotations").insert(payload);
        if (error) { toast.error("Error al crear: " + error.message); return; }
        toast.success("Cotización creada");
      }
      resetForm();
      fetchData();
      onMutate?.();
    } catch (err: any) {
      toast.error("Error inesperado: " + err.message);
    }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", client_name: "", status: "borrador", delivery_date: "" });
    setItems([{ description: "", amount: 0, entregables: [] }]);
    setSelectedConditions(DEFAULT_CONDITIONS.map(() => true));
    setSelectedCostos(COSTOS_OPTIONS.map(() => false));
    setRequisitos([]);
    setNewRequisito("");
    setEntregableInputs([""]);
    setShowForm(false);
    setEditing(null);
    setShowConditions(false);
    setShowCostos(false);
  };

  const handleEdit = (q: Quotation) => {
    setEditing(q);
    setForm({ title: q.title, description: q.description ?? "", client_name: q.client_name ?? q.clients?.name ?? "", status: q.status, delivery_date: (q as any).delivery_date ?? "" });
    const parsedItems = q.items.length > 0 ? q.items.map(it => ({ ...it, entregables: it.entregables ?? [] })) : [{ description: "", amount: 0, entregables: [] }];
    setItems(parsedItems);
    setEntregableInputs(parsedItems.map(() => ""));
    const savedConditions = (q.conditions as string[]) ?? [];
    setSelectedConditions(DEFAULT_CONDITIONS.map(c => savedConditions.length === 0 || savedConditions.includes(c)));
    const savedCostos = (q.costos as string[]) ?? [];
    setSelectedCostos(COSTOS_OPTIONS.map(c => savedCostos.includes(c)));
    setRequisitos((q.requisitos as string[]) ?? []);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("quotations").delete().eq("id", id);
    fetchData();
    onMutate?.();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("quotations").update({ status: status as any }).eq("id", id);
    fetchData();
    onMutate?.();
  };

  const handleGenerateInvoice = async (q: Quotation) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Debes iniciar sesión"); return; }

      const clientName = q.client_name || q.clients?.name || "Cliente";
      const concept = Array.isArray(q.items) && q.items.length > 0
        ? q.items.map((it) => it.description).filter(Boolean).join(", ") || q.title
        : q.title;

      // Reuse existing invoice if already linked, otherwise create one
      const { data: existing } = await supabase
        .from("invoices")
        .select("*")
        .eq("quotation_id", q.id)
        .maybeSingle();

      let invoice = existing as any;
      if (!invoice) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        const payload = {
          concept,
          amount: Number(q.total),
          status: "pendiente" as any,
          due_date: dueDate.toISOString().slice(0, 10),
          paid_date: null,
          notes: `Generada automáticamente desde la cotización: ${q.title}`,
          client_id: q.client_id,
          client_name: clientName,
          quotation_id: q.id,
          user_id: user.id,
        };
        const { data: inserted, error } = await supabase
          .from("invoices")
          .insert(payload)
          .select()
          .single();
        if (error) { toast.error("Error al crear la cuenta: " + error.message); return; }
        invoice = inserted;
        toast.success("Cuenta de cobro creada y vinculada");
      } else {
        toast.success("Usando cuenta de cobro existente");
      }

      await generateCombinedQuotationInvoicePDF(q, {
        concept: invoice.concept,
        amount: Number(invoice.amount),
        clientName: invoice.client_name || clientName,
        createdAt: invoice.created_at,
        notes: invoice.notes,
        due_date: invoice.due_date,
      });

      onMutate?.();
    } catch (err: any) {
      toast.error("Error inesperado: " + (err?.message ?? String(err)));
    }
  };


  const inputCls = "dash-input rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm w-full";

  const formContent = (
    <div className="space-y-3 sm:space-y-4">
      {/* Title & Client */}
      <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título *" className={inputCls} />
      <input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="Cliente" className={inputCls} />

      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción / Objetivo" className={`${inputCls} min-h-[50px]`} rows={2} />
      <QuotationAIAssistant
        currentDescription={form.description}
        quotationTitle={form.title}
        onApply={(text) => setForm({ ...form, description: text })}
      />

      <div>
        <label className="text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider mb-1 block">Fecha de generación</label>
        <input type="date" value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} className={inputCls} />
      </div>

      {/* Conceptos */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Conceptos</p>
        {items.map((item, i) => (
          <div key={i} className="space-y-2 p-2.5 sm:p-3 rounded-xl bg-[hsl(0,0%,97%)] border border-[hsl(var(--dash-card-border))]">
            <div className="space-y-2">
              <input value={item.description} onChange={(e) => { const n = [...items]; n[i].description = e.target.value; setItems(n); }} placeholder="Concepto" className={inputCls} />
              <div className="flex gap-2 items-center">
                <input type="number" value={item.amount || ""} onChange={(e) => { const n = [...items]; n[i].amount = Number(e.target.value); setItems(n); }} placeholder="$ Monto" className={inputCls} />
                {items.length > 1 && <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-[hsl(var(--dash-text-muted))] hover:text-destructive p-2 shrink-0"><X size={14} /></button>}
              </div>
            </div>
            {/* Entregables */}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Entregables</p>
              {(item.entregables ?? []).map((ent, ei) => (
                <div key={ei} className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[hsl(var(--dash-text))] flex-1 leading-tight">• {ent}</span>
                  <button type="button" onClick={() => { const n = [...items]; n[i].entregables = (n[i].entregables ?? []).filter((_, j) => j !== ei); setItems(n); }} className="text-[hsl(var(--dash-text-muted))] hover:text-destructive p-0.5 shrink-0"><X size={10} /></button>
                </div>
              ))}
              <div className="flex gap-1.5">
                <input
                  value={entregableInputs[i] ?? ""}
                  onChange={(e) => { const n = [...entregableInputs]; n[i] = e.target.value; setEntregableInputs(n); }}
                  placeholder="Ej: 10 fotos editadas"
                  className={`${inputCls} text-xs`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = (entregableInputs[i] ?? "").trim();
                      if (val) {
                        const n = [...items]; n[i].entregables = [...(n[i].entregables ?? []), val]; setItems(n);
                        const ni = [...entregableInputs]; ni[i] = ""; setEntregableInputs(ni);
                      }
                    }
                  }}
                />
                <button type="button" onClick={() => {
                  const val = (entregableInputs[i] ?? "").trim();
                  if (val) {
                    const n = [...items]; n[i].entregables = [...(n[i].entregables ?? []), val]; setItems(n);
                    const ni = [...entregableInputs]; ni[i] = ""; setEntregableInputs(ni);
                  }
                }} className="text-[10px] text-primary font-bold hover:underline whitespace-nowrap shrink-0 px-1">+ Add</button>
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => { setItems([...items, { description: "", amount: 0, entregables: [] }]); setEntregableInputs([...entregableInputs, ""]); }} className="text-xs text-primary font-bold hover:underline">+ Agregar concepto</button>
      </div>

      {/* Condiciones - collapsible on mobile */}
      <div className="space-y-1.5">
        <button type="button" onClick={() => setShowConditions(!showConditions)} className="flex items-center gap-1.5 w-full">
          <p className="text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Condiciones del PDF</p>
          {isMobile && (showConditions ? <ChevronUp size={12} className="text-[hsl(var(--dash-text-muted))]" /> : <ChevronDown size={12} className="text-[hsl(var(--dash-text-muted))]" />)}
        </button>
        {(showConditions || !isMobile) && (
          <div className="space-y-1.5">
            {DEFAULT_CONDITIONS.map((condition, i) => (
              <label key={i} className="flex items-start gap-2 cursor-pointer group">
                <input type="checkbox" checked={selectedConditions[i]} onChange={() => { const n = [...selectedConditions]; n[i] = !n[i]; setSelectedConditions(n); }} className="mt-0.5 accent-primary shrink-0" />
                <span className="text-[11px] leading-tight text-[hsl(var(--dash-text-muted))] group-hover:text-[hsl(var(--dash-text))] transition-colors">{condition}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Costos - collapsible on mobile */}
      <div className="space-y-1.5">
        <button type="button" onClick={() => setShowCostos(!showCostos)} className="flex items-center gap-1.5 w-full">
          <p className="text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Costos incluidos</p>
          {isMobile && (showCostos ? <ChevronUp size={12} className="text-[hsl(var(--dash-text-muted))]" /> : <ChevronDown size={12} className="text-[hsl(var(--dash-text-muted))]" />)}
        </button>
        {(showCostos || !isMobile) && (
          <div className="space-y-1.5">
            {COSTOS_OPTIONS.map((costo, i) => (
              <label key={i} className="flex items-start gap-2 cursor-pointer group">
                <input type="checkbox" checked={selectedCostos[i]} onChange={() => { const n = [...selectedCostos]; n[i] = !n[i]; setSelectedCostos(n); }} className="mt-0.5 accent-primary shrink-0" />
                <span className="text-[11px] text-[hsl(var(--dash-text-muted))] group-hover:text-[hsl(var(--dash-text))] transition-colors">{costo}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Requisitos */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Requisitos</p>
        <div className="space-y-1">
          {requisitos.map((req, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[11px] text-[hsl(var(--dash-text))] flex-1 leading-tight">• {req}</span>
              <button type="button" onClick={() => setRequisitos(requisitos.filter((_, j) => j !== i))} className="text-[hsl(var(--dash-text-muted))] hover:text-destructive p-0.5 shrink-0"><X size={12} /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5">
          <input value={newRequisito} onChange={(e) => setNewRequisito(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newRequisito.trim()) { setRequisitos([...requisitos, newRequisito.trim()]); setNewRequisito(""); } } }} placeholder="Ej: Acceso al lugar" className={inputCls} />
          <button type="button" onClick={() => { if (newRequisito.trim()) { setRequisitos([...requisitos, newRequisito.trim()]); setNewRequisito(""); } }} className="text-[10px] text-primary font-bold hover:underline shrink-0 px-1">+ Add</button>
        </div>
      </div>

      {/* Total & Submit */}
      <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--dash-card-border))]">
        <p className="text-sm font-bold text-[hsl(var(--dash-text))]">Total: ${items.reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString()}</p>
        <button type={isMobile ? "button" : "submit"} onClick={isMobile ? () => handleSubmit() : undefined} className="btn-dark text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5">
          {editing ? "Guardar" : "Crear"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {!embedded && (
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-[hsl(var(--dash-text))]">Cotizaciones</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-full hover:shadow-lg transition-all shrink-0">
            <Plus size={14} /> Nueva
          </button>
        </div>
      )}

      {/* Mobile: Drawer | Desktop: Inline form */}
      {isMobile ? (
        <Drawer open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="font-display font-bold text-[hsl(var(--dash-text))]">
                {editing ? "Editar cotización" : "Nueva cotización"}
              </DrawerTitle>
              <DrawerDescription className="sr-only">Formulario de cotización</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-6 overflow-y-auto">
              {formContent}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        showForm && (
          <form onSubmit={handleSubmit} className="dash-tile rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-[hsl(var(--dash-text))]">{editing ? "Editar cotización" : "Nueva cotización"}</h3>
              <button type="button" onClick={resetForm} className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]"><X size={16} /></button>
            </div>
            {formContent}
          </form>
        )
      )}

      {/* Quotation list */}
      <div className="space-y-3">
        {quotations.length === 0 && (
          <p className="text-[hsl(var(--dash-text-muted))] text-sm text-center py-10">No hay cotizaciones aún.</p>
        )}
        {quotations.map((q) => (
          <div key={q.id} className="dash-tile rounded-2xl p-3 sm:p-4 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-xs sm:text-sm text-[hsl(var(--dash-text))] truncate">{q.title}</span>
                <select
                  value={q.status}
                  onChange={(e) => updateStatus(q.id, e.target.value)}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border appearance-none cursor-pointer ${statusColors[q.status] ?? statusColors.borrador}`}
                >
                  <option value="borrador">Borrador</option>
                  <option value="enviada">Enviada</option>
                  <option value="aceptada">Aceptada</option>
                  <option value="rechazada">Rechazada</option>
                </select>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[11px] sm:text-xs text-[hsl(var(--dash-text-muted))] flex-wrap">
                <span className="font-bold text-[hsl(var(--dash-text))]">${Number(q.total).toLocaleString()} COP</span>
                {(q.client_name || q.clients?.name) && <span>• {q.client_name || q.clients?.name}</span>}
                {(q as any).delivery_date && <span className="hidden sm:inline">• {new Date((q as any).delivery_date + "T00:00:00").toLocaleDateString("es-CO")}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => generateQuotationPDF(q)} className="p-2 text-[hsl(var(--dash-text-muted))] hover:text-primary transition-colors rounded-lg hover:bg-[hsl(0,0%,96%)]" title="Descargar PDF"><FileDown size={14} /></button>
              <button onClick={() => handleEdit(q)} className="p-2 text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors rounded-lg hover:bg-[hsl(0,0%,96%)]"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(q.id)} className="p-2 text-[hsl(var(--dash-text-muted))] hover:text-destructive transition-colors rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuotationsView;
