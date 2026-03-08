import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Trash2, Edit2, X, Upload } from "lucide-react";
import { toast } from "sonner";

const BRAND_CLIENTS = [
  "La Pescadería", "Uva de lujo", "Palmetto", "El Cortijo", "Comité Olímpico",
  "Hunts", "Coloriss", "TQ", "Yanko", "Satillos", "La Cava",
  "Nutricionista Natalia Valencia", "Hair Beauty", "Kimeline", "Angus Burguer",
  "Michelangelo", "Restaurante 1975", "Epioné", "Rombo Quadrado", "Jazz Café",
  "Joykeys", "Salon IN", "Iluminata", "Impocali", "Self", "Nize", "Atavico",
  "Vitane", "Shibumi", "Luminance", "Tanga", "Suarez Abogados", "Dermocorea",
  "Resonance", "Aromasense", "Greencode", "Deopies", "Muss", "Follies",
  "Recamier Corp", "Ruuts", "Whitman", "Sra Buenaventura",
];

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
}

const ClientsView = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", notes: "" });

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    if (data) setClients(data);
  };

  useEffect(() => { fetchClients(); }, []);

  const seedClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const existing = clients.map((c) => c.name.toLowerCase());
    const toInsert = BRAND_CLIENTS
      .filter((name) => !existing.includes(name.toLowerCase()))
      .map((name) => ({ name, user_id: user.id }));
    if (toInsert.length === 0) {
      toast.info("Todos los clientes ya están agregados");
      return;
    }
    const { error } = await supabase.from("clients").insert(toInsert);
    if (error) { toast.error("Error al importar"); return; }
    toast.success(`${toInsert.length} clientes importados`);
    fetchClients();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editing) {
      await supabase.from("clients").update(form).eq("id", editing.id);
    } else {
      await supabase.from("clients").insert({ ...form, user_id: user.id });
    }
    setForm({ name: "", email: "", phone: "", company: "", notes: "" });
    setShowForm(false);
    setEditing(null);
    fetchClients();
  };

  const handleEdit = (c: Client) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email ?? "", phone: c.phone ?? "", company: c.company ?? "", notes: c.notes ?? "" });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("clients").delete().eq("id", id);
    fetchClients();
  };

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
        <div className="flex items-center gap-2">
          <button onClick={seedClients} className="flex items-center gap-2 bg-muted text-foreground text-sm font-semibold px-4 py-2 rounded-full hover:bg-muted/80 transition-all">
            <Upload size={16} /> Importar marcas
          </button>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", email: "", phone: "", company: "", notes: "" }); }} className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-full hover:shadow-lg transition-all">
            <Plus size={16} /> Nuevo
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full bg-muted/50 border border-border rounded-full pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="liquid-glass rounded-[var(--radius)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{editing ? "Editar cliente" : "Nuevo cliente"}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre *" className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Teléfono" className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Empresa" className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[60px]" />
          <button type="submit" className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-full hover:shadow-lg transition-all">
            {editing ? "Guardar" : "Crear"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="liquid-glass rounded-[var(--radius)] p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground text-sm">{c.name}</p>
              <p className="text-xs text-muted-foreground">{[c.company, c.email].filter(Boolean).join(" · ")}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleEdit(c)} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/50"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(c.id)} className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No hay clientes aún</p>}
      </div>
    </div>
  );
};

export default ClientsView;
