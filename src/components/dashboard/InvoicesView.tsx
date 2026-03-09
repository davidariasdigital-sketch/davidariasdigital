import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Trash2, Edit2, FileDown } from "lucide-react";
import { generateInvoicePDF } from "@/lib/invoice-pdf";

interface Invoice {
  id: string;
  concept: string;
  amount: number;
  status: string;
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  client_id: string | null;
  quotation_id: string | null;
  created_at: string;
  clients?: { name: string } | null;
}

interface Client { id: string; name: string; }
interface Quotation { id: string; title: string; }

const statusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  pagada: "Pagada",
  vencida: "Vencida",
};

const statusColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  pagada: "bg-emerald-100 text-emerald-700",
  vencida: "bg-red-100 text-red-700",
};

const InvoicesView = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    concept: "", amount: "", status: "pendiente", due_date: "", paid_date: "", notes: "", client_id: "", quotation_id: "",
  });

  const formatCOP = (v: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v);

  const fetchAll = async () => {
    const [inv, cl, qt] = await Promise.all([
      supabase.from("invoices").select("*, clients(name)").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name").order("name"),
      supabase.from("quotations").select("id, title").order("created_at", { ascending: false }),
    ]);
    setInvoices((inv.data as any) ?? []);
    setClients(cl.data ?? []);
    setQuotations(qt.data ?? []);
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setForm({ concept: "", amount: "", status: "pendiente", due_date: "", paid_date: "", notes: "", client_id: "", quotation_id: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.concept || !form.amount) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = {
      concept: form.concept, amount: parseFloat(form.amount), status: form.status as any,
      due_date: form.due_date || null, paid_date: form.paid_date || null, notes: form.notes || null,
      client_id: form.client_id || null, quotation_id: form.quotation_id || null, user_id: user.id,
    };
    if (editingId) { await supabase.from("invoices").update(payload).eq("id", editingId); }
    else { await supabase.from("invoices").insert(payload); }
    resetForm();
    fetchAll();
  };

  const handleEdit = (inv: Invoice) => {
    setForm({
      concept: inv.concept, amount: String(inv.amount), status: inv.status,
      due_date: inv.due_date ?? "", paid_date: inv.paid_date ?? "", notes: inv.notes ?? "",
      client_id: inv.client_id ?? "", quotation_id: inv.quotation_id ?? "",
    });
    setEditingId(inv.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("invoices").delete().eq("id", id);
    fetchAll();
  };

  const totalPending = invoices.filter((i) => i.status === "pendiente").reduce((s, i) => s + Number(i.amount), 0);
  const totalPaid = invoices.filter((i) => i.status === "pagada").reduce((s, i) => s + Number(i.amount), 0);

  const inputCls = "w-full dash-input rounded-lg px-4 py-2 text-sm";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[hsl(0,0%,15%)]">Cuentas por Cobrar</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
          <Plus size={14} /> Nueva
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="dash-card p-5">
          <p className="text-xs text-[hsl(0,0%,50%)]">Pendiente por cobrar</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{formatCOP(totalPending)}</p>
        </div>
        <div className="dash-card p-5">
          <p className="text-xs text-[hsl(0,0%,50%)]">Total cobrado</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCOP(totalPaid)}</p>
        </div>
      </div>

      {showForm && (
        <div className="dash-glass rounded-[var(--radius)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[hsl(0,0%,15%)]">{editingId ? "Editar cuenta" : "Nueva cuenta por cobrar"}</h3>
            <button onClick={resetForm} className="text-[hsl(0,0%,50%)] hover:text-[hsl(0,0%,20%)]"><X size={16} /></button>
          </div>
          <input placeholder="Concepto *" value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} className={inputCls} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="number" placeholder="Monto (COP) *" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="vencida">Vencida</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[hsl(0,0%,50%)] mb-1 block">Fecha de vencimiento</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-[hsl(0,0%,50%)] mb-1 block">Fecha de pago</label>
              <input type="date" value={form.paid_date} onChange={(e) => setForm({ ...form, paid_date: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className={inputCls}>
              <option value="">Sin cliente</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.quotation_id} onChange={(e) => setForm({ ...form, quotation_id: e.target.value })} className={inputCls}>
              <option value="">Sin cotización</option>
              {quotations.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
            </select>
          </div>
          <textarea placeholder="Notas (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputCls} resize-none`} rows={2} />
          <button onClick={handleSubmit} className="bg-primary text-primary-foreground text-xs font-bold px-6 py-2 rounded-full hover:opacity-90 transition-opacity">
            {editingId ? "Guardar cambios" : "Crear cuenta"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {invoices.length === 0 && (
          <p className="text-[hsl(0,0%,50%)] text-sm text-center py-10">No hay cuentas por cobrar aún.</p>
        )}
        {invoices.map((inv) => (
          <div key={inv.id} className="dash-card p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-[hsl(0,0%,15%)] truncate">{inv.concept}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[inv.status]}`}>
                  {statusLabels[inv.status]}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-[hsl(0,0%,50%)] flex-wrap">
                <span className="font-bold text-[hsl(0,0%,15%)]">{formatCOP(Number(inv.amount))}</span>
                {inv.clients?.name && <span>• {inv.clients.name}</span>}
                {inv.due_date && <span>• Vence: {new Date(inv.due_date + "T00:00:00").toLocaleDateString("es-CO")}</span>}
                {inv.paid_date && <span>• Pagada: {new Date(inv.paid_date + "T00:00:00").toLocaleDateString("es-CO")}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => generateInvoicePDF({ concept: inv.concept, amount: Number(inv.amount), clientName: inv.clients?.name ?? "Cliente", createdAt: inv.created_at, notes: inv.notes, due_date: inv.due_date })} className="p-2 text-[hsl(0,0%,55%)] hover:text-primary transition-colors" title="Descargar PDF"><FileDown size={14} /></button>
              <button onClick={() => handleEdit(inv)} className="p-2 text-[hsl(0,0%,55%)] hover:text-[hsl(0,0%,20%)] transition-colors"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(inv.id)} className="p-2 text-[hsl(0,0%,55%)] hover:text-[hsl(0,84%,60%)] transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoicesView;
