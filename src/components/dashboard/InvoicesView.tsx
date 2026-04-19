import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Trash2, Edit2, FileDown } from "lucide-react";
import { generateInvoicePDF } from "@/lib/invoice-pdf";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

interface Invoice {
  id: string; concept: string; amount: number; status: string;
  due_date: string | null; paid_date: string | null; notes: string | null;
  client_id: string | null; client_name: string | null; quotation_id: string | null; created_at: string;
  clients?: { name: string } | null;
}

interface Quotation { id: string; title: string; total: number; description: string | null; client_id: string | null; client_name: string | null; items: any; clients?: { name: string } | null; }

const statusLabels: Record<string, string> = { pendiente: "Pendiente", pagada: "Pagada", vencida: "Vencida" };
const statusColors: Record<string, string> = {
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  pagada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  vencida: "bg-red-50 text-red-700 border-red-200",
};

interface InvoicesViewProps {
  embedded?: boolean;
  triggerNew?: number;
  onMutate?: () => void;
}

const InvoicesView = ({ embedded = false, triggerNew = 0, onMutate }: InvoicesViewProps = {}) => {
  const isMobile = useIsMobile();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    concept: "", amount: "", status: "pendiente", due_date: "", paid_date: "", notes: "", client_name: "", quotation_id: "",
  });

  const formatCOP = (v: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v);

  const fetchAll = async () => {
    const [inv, qt] = await Promise.all([
      supabase.from("invoices").select("*, clients(name)").order("created_at", { ascending: false }),
      supabase.from("quotations").select("id, title, total, description, client_id, client_name, items, clients(name)").order("created_at", { ascending: false }),
    ]);
    setInvoices((inv.data as any) ?? []);
    setQuotations((qt.data as any) ?? []);
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (triggerNew > 0) { resetForm(); setShowForm(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerNew]);

  const resetForm = () => {
    setForm({ concept: "", amount: "", status: "pendiente", due_date: "", paid_date: "", notes: "", client_name: "", quotation_id: "" });
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
      client_id: null, client_name: form.client_name.trim() || null, quotation_id: form.quotation_id || null, user_id: user.id,
    };
    if (editingId) { await supabase.from("invoices").update(payload).eq("id", editingId); }
    else { await supabase.from("invoices").insert(payload); }
    resetForm();
    fetchAll();
    onMutate?.();
  };

  const handleEdit = (inv: Invoice) => {
    setForm({
      concept: inv.concept, amount: String(inv.amount), status: inv.status,
      due_date: inv.due_date ?? "", paid_date: inv.paid_date ?? "", notes: inv.notes ?? "",
      client_name: inv.client_name ?? inv.clients?.name ?? "", quotation_id: inv.quotation_id ?? "",
    });
    setEditingId(inv.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("invoices").delete().eq("id", id);
    fetchAll();
    onMutate?.();
  };

  const totalPending = invoices.filter((i) => i.status === "pendiente").reduce((s, i) => s + Number(i.amount), 0);
  const totalPaid = invoices.filter((i) => i.status === "pagada").reduce((s, i) => s + Number(i.amount), 0);

  const inputCls = "w-full dash-input rounded-xl px-4 py-2.5 text-sm";

  return (
    <div className="space-y-4 sm:space-y-6">
      {!embedded && (
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-[hsl(var(--dash-text))]">Cuentas por Cobrar</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-full hover:shadow-lg transition-all shrink-0">
            <Plus size={14} /> Nueva
          </button>
        </div>
      )}

      {/* Summary cards */}
      {!embedded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="dash-tile-primary rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Pendiente por cobrar</p>
            <p className="text-2xl font-display font-extrabold mt-2">{formatCOP(totalPending)}</p>
          </div>
          <div className="dash-tile rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--dash-text-muted))]">Total cobrado</p>
            <p className="text-2xl font-display font-extrabold mt-2 text-emerald-600">{formatCOP(totalPaid)}</p>
          </div>
        </div>
      )}

      {/* Form content */}
      {(() => {
        const formContent = (
          <div className="space-y-4">
            <input placeholder="Concepto *" value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} className={inputCls} />
            <input type="number" placeholder="Monto (COP) *" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="vencida">Vencida</option>
            </select>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[hsl(var(--dash-text-muted))] mb-1 block">Fecha de vencimiento</label>
                <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--dash-text-muted))] mb-1 block">Fecha de pago</label>
                <input type="date" value={form.paid_date} onChange={(e) => setForm({ ...form, paid_date: e.target.value })} className={inputCls} />
              </div>
            </div>
            <input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="Cliente" className={inputCls} />
            <select value={form.quotation_id} onChange={(e) => {
              const qId = e.target.value;
              const qt = quotations.find((q) => q.id === qId);
              if (qt) {
                const itemsSummary = Array.isArray(qt.items)
                  ? (qt.items as any[]).map((it: any) => it.concept || it.title || "").filter(Boolean).join(", ")
                  : "";
                setForm({ ...form, quotation_id: qId, concept: itemsSummary || qt.title, amount: String(qt.total), client_name: qt.client_name ?? qt.clients?.name ?? form.client_name });
              } else {
                setForm({ ...form, quotation_id: qId });
              }
            }} className={inputCls}>
              <option value="">Sin cotización</option>
              {quotations.map((q) => <option key={q.id} value={q.id}>{q.title} — {formatCOP(q.total)}</option>)}
            </select>
            <textarea placeholder="Notas (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputCls} resize-none`} rows={2} />
            <button onClick={handleSubmit} className="btn-dark text-sm px-6 py-2.5 w-full sm:w-auto">
              {editingId ? "Guardar cambios" : "Crear cuenta"}
            </button>
          </div>
        );

        return isMobile ? (
          <Drawer open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
            <DrawerContent className="max-h-[90vh]">
              <DrawerHeader className="pb-2">
                <DrawerTitle className="font-display font-bold text-[hsl(var(--dash-text))]">
                  {editingId ? "Editar cuenta" : "Nueva cuenta por cobrar"}
                </DrawerTitle>
                <DrawerDescription className="sr-only">Formulario de cuenta por cobrar</DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-6 overflow-y-auto">{formContent}</div>
            </DrawerContent>
          </Drawer>
        ) : (
          showForm && (
            <div className="dash-tile rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-[hsl(var(--dash-text))]">{editingId ? "Editar cuenta" : "Nueva cuenta por cobrar"}</h3>
                <button onClick={resetForm} className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]"><X size={16} /></button>
              </div>
              {formContent}
            </div>
          )
        );
      })()}

      {/* List */}
      <div className="space-y-3">
        {invoices.length === 0 && (
          <p className="text-[hsl(var(--dash-text-muted))] text-sm text-center py-10">No hay cuentas por cobrar aún.</p>
        )}
        {invoices.map((inv) => (
          <div key={inv.id} className="dash-tile rounded-2xl p-3 sm:p-4 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-xs sm:text-sm text-[hsl(var(--dash-text))] truncate">{inv.concept}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusColors[inv.status]}`}>
                  {statusLabels[inv.status]}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[11px] sm:text-xs text-[hsl(var(--dash-text-muted))] flex-wrap">
                <span className="font-bold text-[hsl(var(--dash-text))]">{formatCOP(Number(inv.amount))}</span>
                {inv.clients?.name && <span>• {inv.clients.name}</span>}
                {inv.due_date && <span className="hidden sm:inline">• Vence: {new Date(inv.due_date + "T00:00:00").toLocaleDateString("es-CO")}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => generateInvoicePDF({ concept: inv.concept, amount: Number(inv.amount), clientName: inv.clients?.name ?? "Cliente", createdAt: inv.created_at, notes: inv.notes, due_date: inv.due_date })} className="p-2 text-[hsl(var(--dash-text-muted))] hover:text-primary transition-colors rounded-lg hover:bg-[hsl(0,0%,96%)]" title="Descargar PDF"><FileDown size={14} /></button>
              <button onClick={() => handleEdit(inv)} className="p-2 text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors rounded-lg hover:bg-[hsl(0,0%,96%)]"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(inv.id)} className="p-2 text-[hsl(var(--dash-text-muted))] hover:text-destructive transition-colors rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoicesView;