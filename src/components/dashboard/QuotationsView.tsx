import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Trash2, Edit2, Sparkles, FileDown } from "lucide-react";
import QuotationAIChat from "./QuotationAIChat";
import { generateQuotationPDF } from "@/lib/quotation-pdf";

interface QuotationItem {
  description: string;
  amount: number;
}

interface Quotation {
  id: string;
  title: string;
  description: string | null;
  items: QuotationItem[];
  total: number;
  status: string;
  client_id: string | null;
  created_at: string;
  clients?: { name: string } | null;
  conditions?: string[];
}

const DEFAULT_CONDITIONS = [
  "Forma de pago: 40% al finalizar la sesión y 60% al momento de entregar el contenido total finalizado.",
  "La entrega del contenido total editado se coordina directamente con el cliente.",
  "Si se exceden las horas de grabación durante la jornada, se hará un cobro adicional de $80.000 COP por cada hora que transcurra.",
  "Modelos, utilería o algún elemento a solicitud del cliente tiene un costo adicional según el requerimiento.",
  "Todos los precios están expresados en pesos colombianos (COP) e incluyen retención en la fuente.",
  "Esta cotización tiene una validez de 30 días a partir de la fecha de emisión.",
];

interface Client {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  borrador: "bg-muted text-muted-foreground",
  enviada: "bg-primary/20 text-primary",
  aceptada: "bg-green-500/20 text-green-400",
  rechazada: "bg-destructive/20 text-destructive",
};

const QuotationsView = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [form, setForm] = useState({ title: "", description: "", client_id: "", status: "borrador" as string, delivery_date: "" });
  const [items, setItems] = useState<QuotationItem[]>([{ description: "", amount: 0 }]);
  const [showAI, setShowAI] = useState(false);
  const [aiQuotation, setAiQuotation] = useState<Quotation | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<boolean[]>(DEFAULT_CONDITIONS.map(() => true));

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
    console.log("handleSubmit called", { form, items });
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("getUser result", { user: user?.id, userError });
    if (!user) {
      console.error("No user found, cannot create quotation");
      return;
    }

    const total = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const conditions = DEFAULT_CONDITIONS.filter((_, i) => selectedConditions[i]);
    const payload = {
      title: form.title,
      description: form.description || null,
      client_id: form.client_id || null,
      status: form.status as any,
      items: items as any,
      total,
      conditions: conditions as any,
      delivery_date: form.delivery_date || null,
      user_id: user.id,
    };

    if (editing) {
      const { user_id, ...updatePayload } = payload;
      const { error } = await supabase.from("quotations").update(updatePayload as any).eq("id", editing.id);
      if (error) console.error("Update error:", error);
    } else {
      const { error } = await supabase.from("quotations").insert(payload);
      if (error) console.error("Insert error:", error);
    }
    resetForm();
    fetchData();
  };

  const resetForm = () => {
    setForm({ title: "", description: "", client_id: "", status: "borrador", delivery_date: "" });
    setItems([{ description: "", amount: 0 }]);
    setSelectedConditions(DEFAULT_CONDITIONS.map(() => true));
    setShowForm(false);
    setEditing(null);
  };

  const handleEdit = (q: Quotation) => {
    setEditing(q);
    setForm({ title: q.title, description: q.description ?? "", client_id: q.client_id ?? "", status: q.status, delivery_date: (q as any).delivery_date ?? "" });
    setItems(q.items.length > 0 ? q.items : [{ description: "", amount: 0 }]);
    // Restore selected conditions from saved data
    const savedConditions = (q.conditions as string[]) ?? [];
    setSelectedConditions(DEFAULT_CONDITIONS.map(c => savedConditions.length === 0 || savedConditions.includes(c)));
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

  const handleDownloadPDF = (q: Quotation) => {
    generateQuotationPDF(q);
  };

  const openAIForQuotation = (q: Quotation | null) => {
    setAiQuotation(q);
    setShowAI(true);
  };

  const getFormContext = () => {
    if (showForm) {
      return `Título: ${form.title}\nDescripción: ${form.description}\nConceptos: ${items.map(i => `${i.description} - $${i.amount}`).join(", ")}\nTotal: $${items.reduce((s, i) => s + (Number(i.amount) || 0), 0)}`;
    }
    if (aiQuotation) {
      return `Título: ${aiQuotation.title}\nDescripción: ${aiQuotation.description ?? ""}\nCliente: ${aiQuotation.clients?.name ?? "Sin cliente"}\nConceptos: ${aiQuotation.items.map(i => `${i.description} - $${i.amount}`).join(", ")}\nTotal: $${Number(aiQuotation.total)}`;
    }
    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Cotizaciones</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => openAIForQuotation(null)} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full liquid-btn text-foreground hover:text-primary transition-colors">
            <Sparkles size={16} /> Asistente IA
          </button>
          <button onClick={() => { setShowForm(true); setEditing(null); }} className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-full hover:shadow-lg transition-all">
            <Plus size={16} /> Nueva
          </button>
        </div>
      </div>

      {showAI && (
        <QuotationAIChat
          quotationContext={getFormContext()}
          onClose={() => { setShowAI(false); setAiQuotation(null); }}
        />
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="liquid-glass rounded-[var(--radius)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{editing ? "Editar cotización" : "Nueva cotización"}</h3>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => openAIForQuotation(null)} className="text-primary hover:text-primary/80 p-1.5" title="Pedir ayuda a la IA"><Sparkles size={14} /></button>
              <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título *" className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">Sin cliente</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[60px]" />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conceptos</p>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input value={item.description} onChange={(e) => { const n = [...items]; n[i].description = e.target.value; setItems(n); }} placeholder="Concepto" className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <input type="number" value={item.amount || ""} onChange={(e) => { const n = [...items]; n[i].amount = Number(e.target.value); setItems(n); }} placeholder="$" className="w-28 bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                {items.length > 1 && <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive p-2"><X size={14} /></button>}
              </div>
            ))}
            <button type="button" onClick={() => setItems([...items, { description: "", amount: 0 }])} className="text-xs text-primary hover:underline">+ Agregar concepto</button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Condiciones del PDF</p>
            {DEFAULT_CONDITIONS.map((condition, i) => (
              <label key={i} className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedConditions[i]}
                  onChange={() => {
                    const n = [...selectedConditions];
                    n[i] = !n[i];
                    setSelectedConditions(n);
                  }}
                  className="mt-0.5 accent-primary"
                />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{condition}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">Total: ${items.reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString()}</p>
            <button type="submit" className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-full hover:shadow-lg transition-all">
              {editing ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {quotations.map((q) => (
          <div key={q.id} className="liquid-glass rounded-[var(--radius)] p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground text-sm">{q.title}</p>
              <p className="text-xs text-muted-foreground">{q.clients?.name ?? "Sin cliente"} · ${Number(q.total).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={q.status} onChange={(e) => updateStatus(q.id, e.target.value)} className={`text-[11px] font-semibold px-3 py-1 rounded-full border-0 focus:outline-none ${statusColors[q.status] ?? ""}`}>
                <option value="borrador">Borrador</option>
                <option value="enviada">Enviada</option>
                <option value="aceptada">Aceptada</option>
                <option value="rechazada">Rechazada</option>
              </select>
              <button onClick={() => openAIForQuotation(q)} className="text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-primary/10" title="Asistente IA"><Sparkles size={14} /></button>
              <button onClick={() => handleDownloadPDF(q)} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/50" title="Descargar PDF"><FileDown size={14} /></button>
              <button onClick={() => handleEdit(q)} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/50"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(q.id)} className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {quotations.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No hay cotizaciones aún</p>}
      </div>
    </div>
  );
};

export default QuotationsView;
