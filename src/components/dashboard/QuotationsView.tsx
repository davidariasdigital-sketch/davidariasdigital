import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Trash2, Edit2, FileDown } from "lucide-react";
import { generateQuotationPDF } from "@/lib/quotation-pdf";
import QuotationAIAssistant from "./QuotationAIAssistant";

interface QuotationItem { description: string; amount: number; }

interface Quotation {
  id: string; title: string; description: string | null; items: QuotationItem[];
  total: number; status: string; client_id: string | null; created_at: string;
  clients?: { name: string } | null; conditions?: string[]; costos?: string[];
  requisitos?: string[];
}

const DEFAULT_CONDITIONS = [
  "Forma de pago: 40% al finalizar la sesión y 60% al momento de entregar el contenido total finalizado.",
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

interface Client { id: string; name: string; }

const statusColors: Record<string, string> = {
  borrador: "bg-[hsl(0,0%,96%)] text-[hsl(var(--dash-text-muted))] border-[hsl(var(--dash-card-border))]",
  enviada: "bg-amber-50 text-amber-700 border-amber-200",
  aceptada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rechazada: "bg-red-50 text-red-700 border-red-200",
};

const QuotationsView = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [form, setForm] = useState({ title: "", description: "", client_id: "", status: "borrador" as string, delivery_date: "" });
  const [items, setItems] = useState<QuotationItem[]>([{ description: "", amount: 0 }]);
  const [selectedConditions, setSelectedConditions] = useState<boolean[]>(DEFAULT_CONDITIONS.map(() => true));
  const [selectedCostos, setSelectedCostos] = useState<boolean[]>(COSTOS_OPTIONS.map(() => false));
  const [requisitos, setRequisitos] = useState<string[]>([]);
  const [newRequisito, setNewRequisito] = useState("");

  const fetchData = async () => {
    const [q, c] = await Promise.all([
      supabase.from("quotations").select("*, clients(name)").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name"),
    ]);
    if (q.data) setQuotations(q.data as unknown as Quotation[]);
    if (c.data) setClients(c.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const total = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const conditions = DEFAULT_CONDITIONS.filter((_, i) => selectedConditions[i]);
    const costos = COSTOS_OPTIONS.filter((_, i) => selectedCostos[i]);
    const payload = {
      title: form.title, description: form.description || null, client_id: form.client_id || null,
      status: form.status as any, items: items as any, total, conditions: conditions as any,
      costos: costos as any, requisitos: requisitos as any, delivery_date: form.delivery_date || null, user_id: user.id,
    };
    if (editing) {
      const { user_id, ...updatePayload } = payload;
      await supabase.from("quotations").update(updatePayload as any).eq("id", editing.id);
    } else {
      await supabase.from("quotations").insert(payload);
    }
    resetForm();
    fetchData();
  };

  const resetForm = () => {
    setForm({ title: "", description: "", client_id: "", status: "borrador", delivery_date: "" });
    setItems([{ description: "", amount: 0 }]);
    setSelectedConditions(DEFAULT_CONDITIONS.map(() => true));
    setSelectedCostos(COSTOS_OPTIONS.map(() => false));
    setRequisitos([]);
    setNewRequisito("");
    setShowForm(false);
    setEditing(null);
  };

  const handleEdit = (q: Quotation) => {
    setEditing(q);
    setForm({ title: q.title, description: q.description ?? "", client_id: q.client_id ?? "", status: q.status, delivery_date: (q as any).delivery_date ?? "" });
    setItems(q.items.length > 0 ? q.items : [{ description: "", amount: 0 }]);
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
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("quotations").update({ status: status as any }).eq("id", id);
    fetchData();
  };

  const inputCls = "dash-input rounded-xl px-4 py-2.5 text-sm";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-extrabold text-[hsl(var(--dash-text))]">Cotizaciones</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); }} className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-full hover:shadow-lg transition-all">
          <Plus size={16} /> Nueva
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="dash-tile rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-[hsl(var(--dash-text))]">{editing ? "Editar cotización" : "Nueva cotización"}</h3>
            <button type="button" onClick={resetForm} className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título *" className={`w-full ${inputCls}`} />
            <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className={`w-full ${inputCls}`}>
              <option value="">Sin cliente</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción / Objetivo de la cotización" className={`w-full ${inputCls} min-h-[60px]`} />
          <QuotationAIAssistant
            currentDescription={form.description}
            quotationTitle={form.title}
            onApply={(text) => setForm({ ...form, description: text })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider mb-1 block">Fecha de realización / entrega</label>
              <input type="date" value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} className={`w-full ${inputCls}`} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Conceptos</p>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input value={item.description} onChange={(e) => { const n = [...items]; n[i].description = e.target.value; setItems(n); }} placeholder="Concepto" className={`flex-1 ${inputCls}`} />
                <input type="number" value={item.amount || ""} onChange={(e) => { const n = [...items]; n[i].amount = Number(e.target.value); setItems(n); }} placeholder="$" className={`w-28 ${inputCls}`} />
                {items.length > 1 && <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-[hsl(var(--dash-text-muted))] hover:text-destructive p-2"><X size={14} /></button>}
              </div>
            ))}
            <button type="button" onClick={() => setItems([...items, { description: "", amount: 0 }])} className="text-xs text-primary font-bold hover:underline">+ Agregar concepto</button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Condiciones del PDF</p>
            {DEFAULT_CONDITIONS.map((condition, i) => (
              <label key={i} className="flex items-start gap-2 cursor-pointer group">
                <input type="checkbox" checked={selectedConditions[i]} onChange={() => { const n = [...selectedConditions]; n[i] = !n[i]; setSelectedConditions(n); }} className="mt-0.5 accent-primary" />
                <span className="text-xs text-[hsl(var(--dash-text-muted))] group-hover:text-[hsl(var(--dash-text))] transition-colors">{condition}</span>
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Costos incluidos en el PDF</p>
            {COSTOS_OPTIONS.map((costo, i) => (
              <label key={i} className="flex items-start gap-2 cursor-pointer group">
                <input type="checkbox" checked={selectedCostos[i]} onChange={() => { const n = [...selectedCostos]; n[i] = !n[i]; setSelectedCostos(n); }} className="mt-0.5 accent-primary" />
                <span className="text-xs text-[hsl(var(--dash-text-muted))] group-hover:text-[hsl(var(--dash-text))] transition-colors">{costo}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[hsl(var(--dash-text))]">Total: ${items.reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString()}</p>
            <button type="submit" className="btn-dark text-sm px-6 py-2.5">
              {editing ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {quotations.map((q) => (
          <div key={q.id} className="dash-tile rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-[hsl(var(--dash-text))] text-sm">{q.title}</p>
              <p className="text-xs text-[hsl(var(--dash-text-muted))]">
                {q.clients?.name ?? "Sin cliente"} · ${Number(q.total).toLocaleString()}
                {(q as any).delivery_date && ` · 📅 ${new Date((q as any).delivery_date).toLocaleDateString("es-CO")}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select value={q.status} onChange={(e) => updateStatus(q.id, e.target.value)} className={`text-[11px] font-bold px-3 py-1 rounded-full border focus:outline-none ${statusColors[q.status] ?? ""}`}>
                <option value="borrador">Borrador</option>
                <option value="enviada">Enviada</option>
                <option value="aceptada">Aceptada</option>
                <option value="rechazada">Rechazada</option>
              </select>
              <button onClick={() => generateQuotationPDF(q)} className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] p-1.5 rounded-lg hover:bg-[hsl(0,0%,96%)]" title="Descargar PDF"><FileDown size={14} /></button>
              <button onClick={() => handleEdit(q)} className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] p-1.5 rounded-lg hover:bg-[hsl(0,0%,96%)]"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(q.id)} className="text-[hsl(var(--dash-text-muted))] hover:text-destructive p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {quotations.length === 0 && <p className="text-center text-[hsl(var(--dash-text-muted))] text-sm py-8">No hay cotizaciones aún</p>}
      </div>
    </div>
  );
};

export default QuotationsView;